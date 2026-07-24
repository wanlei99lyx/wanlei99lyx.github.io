---
layout: post
title: "LangChain Tools：让 LLM 拥有调用工具的能力"
date: 2026-07-24 20:00:00 +0800
categories: [开发工具]
tags: [LangChain, Tools, Function Calling, AI Agent]
---

Tool Calling（工具调用，也称 Function Calling）是 LangChain 最核心的能力之一——它让 LLM 不再只是一个"聊天机器人"，而是能够调用外部 API、查询数据库、执行代码的真实"智能体"。

## 什么是 Tool Calling

Tool Calling 的工作流程：

1. 开发者定义工具函数并注册给 LLM
2. LLM 分析用户需求，决定是否调用工具
3. 如果需要调用，LLM 返回工具调用请求（含参数）
4. 开发者在本地执行工具函数，将结果以 ToolMessage 返回给 LLM
5. LLM 结合工具结果生成最终回复

```
用户提问 → LLM 分析 → 决定调用工具 → 返回 tool_calls
→ 本地执行工具 → 返回 ToolMessage → LLM 生成最终回答
```

## @tool 装饰器：定义工具的最简方式

### 基础用法

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气信息
    
    Args:
        city: 城市名称
    """
    return f"{city} 今天 15°C"
```

`@tool` 装饰器会自动：
- 将函数签名转换为 OpenAI Tool Schema
- 将函数的文档字符串解析为工具描述
- 创建一个 `BaseTool` 实例

### 直接调用工具

```python
# 直接调用
result = get_weather.invoke({"city": "北京"})
print(result)  # 北京 今天 15°C
```

### 绑定工具到模型

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(
    model="gpt-5.4-mini",
    model_provider="openai",
)

# 绑定工具
model_with_tools = model.bind_tools([get_weather])

# LLM 自行判断是否调用工具
response = model_with_tools.invoke("北京天气怎么样？")

if response.tool_calls:
    print("AI 请求调用工具:", response.tool_calls)
else:
    print("AI 直接回答:", response.content)
```

当 LLM 决定调用工具时，`response.tool_calls` 返回：

```python
[{
    'name': 'get_weather',
    'args': {'city': '北京'},
    'id': 'call_fR3LE8Wjqh9lnDosQ61Y892E',
    'type': 'tool_call'
}]
```

## 完整的 Tool Calling 流程

### 方式一：手动处理（透彻理解原理）

```python
from langchain_core.messages import HumanMessage, ToolMessage

messages = [HumanMessage("北京天气怎么样？")]

# 第1步：AI 决定调用工具
response = model_with_tools.invoke(messages)
messages.append(response)

# 第2步：执行工具
for tool_call in response.tool_calls:
    if tool_call["name"] == "get_weather":
        tool_response = ToolMessage(
            content=get_weather(**tool_call["args"]),
            tool_call_id=tool_call["id"],
            name=tool_call["name"]
        )
        messages.append(tool_response)

# 第3步：AI 基于工具结果生成最终回答
final_response = model_with_tools.invoke(messages)
print(final_response.content)
```

### 方式二：通过 @tool 自动处理

`@tool` 创建的 Tool 自带 `.invoke()` 方法，可以直接传入 `tool_call`：

```python
for tool_call in response.tool_calls:
    tool_response = get_weather.invoke(tool_call)  # 返回 ToolMessage
    messages.append(tool_response)
```

## Tool Schema 详解

### convert_to_openai_tool

`@tool` 内部会将 Python 函数签名转换为 OpenAI Tool Schema：

```python
from langchain_core.utils.function_calling import convert_to_openai_tool

schema = convert_to_openai_tool(get_weather)
print(schema)
# {
#     'type': 'function',
#     'function': {
#         'name': 'get_weather',
#         'description': '获取指定城市的天气信息',
#         'parameters': {
#             'type': 'object',
#             'properties': {
#                 'city': {'type': 'string', 'description': '城市名称'}
#             },
#             'required': ['city']
#         }
#     }
# }
```

### 手动定义 Schema

除了 `@tool`，也可以手动创建 Tool Schema：

```python
from langchain_core.tools import tool
from pydantic import BaseModel, Field

class WeatherInput(BaseModel):
    city: str = Field(description="城市名称")
    unit: str = Field(default="celsius", description="温度单位")

@tool(args_schema=WeatherInput)
def get_weather(city: str, unit: str = "celsius") -> str:
    """获取指定城市的天气信息"""
    return f"{city} 25°{unit[0].upper()}"
```

## 工具定义的最佳实践

为了让 LLM 准确理解和使用工具，需要注意以下几点：

### 1. 参数要有清晰的描述

LLM 根据参数名和描述决定如何填充参数。参数名应自解释，复杂参数需要 `description`：

```python
@tool
def search_hotels(
    city: str,
    check_in: str,  # 格式说明
    check_out: str,
    guests: int = 1,
    min_rating: float = 0.0,
) -> list[dict]:
    """搜索酒店信息
    
    Args:
        city: 城市名称（中文）
        check_in: 入住日期，格式 YYYY-MM-DD
        check_out: 退房日期，格式 YYYY-MM-DD
        guests: 入住人数
        min_rating: 最低评分（0-5）
    """
    ...
```

### 2. 工具名称要有区分度

多个工具时，LLM 根据名称选择调用哪个。名称应表达动词+名词的组合：

```python
@tool
def search_flights(...): ...
@tool
def book_flight(...): ...
@tool
def cancel_booking(...): ...
```

### 3. 使用 Pydantic 精确控制参数

当参数结构复杂时，使用 Pydantic model 作为 `args_schema`：

```python
from pydantic import BaseModel, Field
from typing import Literal

class SearchFlightsInput(BaseModel):
    origin: str = Field(description="出发城市三字码，如 PEK")
    destination: str = Field(description="到达城市三字码，如 SHA")
    date: str = Field(description="出发日期，YYYY-MM-DD")
    cabin_class: Literal["economy", "business", "first"] = Field(
        default="economy", description="舱位等级"
    )
    passengers: int = Field(default=1, description="乘客人数", ge=1, le=9)

@tool(args_schema=SearchFlightsInput)
def search_flights(origin, destination, date, cabin_class="economy", passengers=1):
    """搜索航班信息"""
    ...
```

## tool_choice：控制工具调用行为

`bind_tools()` 接受 `tool_choice` 参数，控制 LLM 何时调用工具：

| tool_choice | 行为 |
|-------------|------|
| `None`（默认） | LLM 自主决定是否调用工具 |
| `"none"` | 禁止调用工具，纯文本回答 |
| `"auto"` | LLM 自主决定（同默认） |
| `"required"` | 强制调用工具（至少一个） |
| `"tool_name"` | 强制调用指定工具 |

```python
# 强制调用工具
model_with_tools = model.bind_tools([get_weather], tool_choice="required")

# 强制调用指定工具
model_with_tools = model.bind_tools([get_weather, search_hotels], 
                                     tool_choice="get_weather")

# 禁止调用工具
model_with_tools = model.bind_tools([get_weather], tool_choice="none")
```

`tool_choice="required"` 在需要确保 LLM 执行某个操作时非常有用，比如用户说"帮我查一下"但没明确说查什么时，强制 LLM 调用工具，通过工具的参数约束来引导用户补充信息。

## 总结

Tools 是 LangChain 从"对话框架"进化为"智能体框架"的关键能力：

1. **`@tool` 装饰器**——一行代码将 Python 函数变为 LLM 可调用的工具
2. **`bind_tools()`**——将工具注册到模型
3. **`tool_calls`**——LLM 返回的工具调用请求
4. **`ToolMessage`**——工具执行结果的消息封装
5. **`tool_choice`**——精细控制工具调用行为
6. **Pydantic args_schema**——复杂参数的精确描述

理解 Tool Calling 是掌握 LangChain Agent 和 RAG 的基础——下一章将介绍结构化输出，让 LLM 的回复从自由文本变为可控的 JSON 数据。
