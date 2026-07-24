---
layout: post
title: "LangChain Message 体系与提示词模板完全指南"
date: 2026-07-24 18:00:00 +0800
categories: [开发工具]
tags: [LangChain, PromptTemplate, Message, 提示词工程]
---

Message 和 Prompt Template 是 LangChain 中构建 LLM 输入的基础构件。本文详细讲解 LangChain 1.2 的 Message 类型系统、PromptTemplate 和 ChatPromptTemplate 的使用方法。

## Message 类型体系

LangChain 1.2 提供了 4 种核心 Message 类型，对应 LLM 对话中的不同角色。

### 四种消息类型

| 消息类 | JSON role | 说明 |
|--------|-----------|------|
| `SystemMessage` | `system` | 系统提示词，设定 AI 的行为和角色 |
| `HumanMessage` | `user` | 用户输入 |
| `AIMessage` | `assistant` | AI 回复（可包含 tool_calls） |
| `ToolMessage` | `tool` | 工具调用结果 |

### 两种表示方式

**方式一：JSON 字典**

```python
messages = [
    {"role": "system", "content": "你是一个 AI 助手"},
    {"role": "user", "content": "你好"},
    {"role": "assistant", "content": "你好！有什么可以帮助你的？"},
    {"role": "user", "content": "今天天气怎么样"},
]
```

**方式二：Message 对象（推荐）**

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, ToolMessage

messages = [
    SystemMessage(content="你是一个 AI 助手"),
    HumanMessage(content="你好"),
    AIMessage(content="你好！有什么可以帮助你的？"),
    HumanMessage(content="今天天气怎么样"),
]
```

两种方式效果相同，最终都会被 LangChain 标准化处理。

### Message 属性详解

**HumanMessage 参数：**

```python
HumanMessage(
    content="Hello!",       # 消息内容
    name="alice",           # 发送者名称（部分模型支持）
    id="msg_123",           # 消息唯一标识
)
```

**AIMessage 特殊属性：**

```python
AIMessage(
    content="",                              # 文本回复
    tool_calls=[{                            # 工具调用请求
        'name': 'get_weather',
        'args': {'city': '北京'},
        'id': 'call_xxx'
    }],
    usage_metadata={                         # Token 用量
        'input_tokens': 34,
        'output_tokens': 118,
        'total_tokens': 152
    }
)
```

**ToolMessage：**

```python
ToolMessage(
    content="北京今天 15°C",
    name="get_weather",
    tool_call_id="call_xxx"  # 对应 AIMessage.tool_calls[0].id
)
```

### content_blocks：多模态消息

LangChain 1.2 引入了 `content_blocks`，支持多模态内容（文本、图片、音频、视频、推理链）。

**传统方式（content + base64 Data URI）：**

```python
import base64

def encode_image(img_path, img_type='jpeg'):
    with open(img_path, "rb") as f:
        return f"data:image/{img_type};base64,{base64.b64encode(f.read()).decode()}"

response = model.invoke([
    HumanMessage(content=[
        {'type': 'text', 'text': '描述这张图片'},
        {'type': 'image_url', 'image_url': encode_image("image.png")},
    ])
])
```

**推荐方式（content_blocks）：**

```python
response = model.invoke([
    HumanMessage(
        content_blocks=[
            {'type': 'text', 'text': '描述这张图片'},
            {'type': 'image', 'base64': base64_image, 'mime_type': 'image/png'},
        ]
    )
])
```

`content_blocks` 的优势在于跨模型供应商的统一接口——OpenAI、Anthropic、Google 的多模态 API 都能通过同一方式调用。

**DeepSeek 推理链提取：**

```python
response = model.invoke("请解释量子计算")
# reasoning_content 在 content_blocks 中
print(response.content_blocks)
# [{'type': 'reasoning', 'reasoning': '...'}, {'type': 'text', 'text': '...'}]
```

## PromptTemplate vs ChatPromptTemplate

LangChain 提供了两种提示词模板，分别对应两类模型：

| 模板类型 | 适用模型 | 输出格式 |
|----------|---------|---------|
| `PromptTemplate` | 文本补全模型（LLM） | 纯文本字符串 |
| `ChatPromptTemplate` | 对话模型（ChatModel） | BaseMessage 列表 |

**LangChain 1.x 推荐使用 ChatPromptTemplate。**

### PromptTemplate（适用于旧式文本模型）

```python
from langchain.prompts import PromptTemplate

template = PromptTemplate.from_template(
    "请用{difficulty}难度讲解{topic}"
)

prompt = template.format(difficulty="初级", topic="Python装饰器")
response = model.invoke(prompt)
```

### ChatPromptTemplate（推荐）

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain.chat_models import init_chat_model

# 1. 创建模板
chat_template = ChatPromptTemplate.from_messages([
    ("system", "你是一个 AI 助手。你的名字是 {name}。"),
    ("human", "你好"),
    ("ai", "你好！有什么可以帮助你的吗？"),
    ("human", "{user_input}"),
])

# 2. 填充变量
prompt = chat_template.invoke({
    "name": "小助",
    "user_input": "今天天气怎么样？"
})

# 3. 传入模型
model = init_chat_model(model="gpt-5.4-mini", model_provider="openai")
response = model.invoke(prompt)
```

## ChatPromptTemplate 的 4 种消息定义方式

### 1. Tuple 方式（最简洁）

```python
ChatPromptTemplate.from_messages([
    ("system", "你是{role}专家"),
    ("human", "{user_input}"),
])
```

### 2. Dict 方式

```python
ChatPromptTemplate.from_messages([
    {"role": "system", "content": "你是{role}专家"},
    {"role": "human", "content": "{user_input}"},
])
```

### 3. Message 对象

```python
from langchain_core.messages import SystemMessage, HumanMessage

ChatPromptTemplate.from_messages([
    SystemMessage(content="你是{role}专家"),
    HumanMessage(content=":{word}"),
])
```

**注意**：Message 对象中 `{variable}` 不会被模板引擎替换，如果需要动态变量，使用 tuple 或 dict 方式。

### 4. MessagePromptTemplate

```python
from langchain_core.prompts import HumanMessagePromptTemplate

ChatPromptTemplate.from_messages([
    HumanMessagePromptTemplate.from_template("{user_input}"),
])
```

## 3 种模板调用方式

| 方法 | 返回类型 | 适用场景 |
|------|---------|---------|
| `invoke()` | `ChatPromptValue` | 链式调用（推荐） |
| `format()` | `str` | 需要纯文本时 |
| `format_messages()` | `list[BaseMessage]` | 需要 Message 列表时 |

```python
template = ChatPromptTemplate.from_messages([
    ("system", "你是{name}"),
    ("human", "{input}"),
])

# invoke() — 推荐
result = template.invoke({"name": "AI助手", "input": "你好"})
# <class 'langchain_core.prompt_values.ChatPromptValue'>

# format() — 返回纯文本
result = template.format(name="AI助手", input="你好")
# "System: 你是AI助手\nHuman: 你好"

# format_messages() — 返回列表
result = template.format_messages(name="AI助手", input="你好")
# [SystemMessage(...), HumanMessage(...)]
```

## 高级模板技巧

### MessagesPlaceholder：动态对话历史

`MessagesPlaceholder` 可以在运行时注入任意数量的消息，非常适合 Agent 和多轮对话场景：

```python
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

template = ChatPromptTemplate.from_messages([
    ("system", "你是一个 AI 助手"),
    MessagesPlaceholder(variable_name="history"),
    ("human", "{question}"),
])

prompt = template.invoke({
    "history": [
        ("human", "5 + 2 = ?"),
        ("ai", "5 + 2 = 7"),
    ],
    "question": "那 4 + 3 呢？"
})
```

### 部分模板（Partial Templates）

当某些变量固定不变时，可以使用 `partial()` 创建预填充模板：

```python
base_template = ChatPromptTemplate.from_messages([
    ("system", "你是{company}的{role}，负责{department}"),
    ("human", "{task}"),
])

# 预填充固定参数
sales_template = base_template.partial(
    company="ABC科技",
    department="销售部"
)

# 只需传入剩余变量
sales_template.invoke({
    "role": "高级销售顾问",
    "task": "编写产品介绍邮件"
})
```

### 模板组合

LangChain 1.0 支持 `+` 运算符组合模板：

```python
template1 = ChatPromptTemplate.from_messages([
    ("system", "你是一个专业顾问"),
])
template2 = ChatPromptTemplate.from_messages([
    ("user", "{input}"),
])

combined = template1 + template2  # 合并为一个 ChatPromptTemplate
```

### Prompt 库管理

将常用 Prompt 封装为类，统一管理：

```python
# templates.py
from langchain_core.prompts import ChatPromptTemplate

class PromptLibrary:
    TRANSLATOR = ChatPromptTemplate.from_messages([
        ("system", "将{source_lang}翻译为{target_lang}"),
        ("user", "\n{text}")
    ])

    CODE_REVIEWER = ChatPromptTemplate.from_messages([
        ("system", "你是一个{language}专家，重点关注{focus}"),
        ("user", "\n```{language}\n{code}\n```")
    ])

# 使用
from templates import PromptLibrary
messages = PromptLibrary.TRANSLATOR.format_messages(
    source_lang="英文",
    target_lang="中文",
    text="Hello World"
)
```

## 多轮对话管理

### 基础的消息累积

```python
conversation = []

# 第1轮
conversation.append({"role": "user", "content": "1+1=?"})
response1 = model.invoke(conversation)
conversation.append({"role": "assistant", "content": response1.content})

# 第2轮（保留上下文）
conversation.append({"role": "user", "content": "刚才我问了什么？"})
response2 = model.invoke(conversation)
```

### 上下文窗口优化

LLM 的上下文窗口有限，需要控制输入长度：

```python
def keep_recent_messages(messages, max_pairs=3):
    """保留系统消息 + 最近 N 轮对话"""
    system_msgs = [m for m in messages if m.get("role") == "system"]
    conversation_msgs = [m for m in messages if m.get("role") != "system"]
    recent_msgs = conversation_msgs[-(max_pairs * 2):]
    return system_msgs + recent_msgs

# 只保留最近 2 轮对话
optimized = keep_recent_messages(long_conversation, max_pairs=2)
```

## 实战：完整的多轮对话 CLI

```python
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv
import os

load_dotenv(override=True)

model = init_chat_model(
    model="gpt-5.4-mini",
    model_provider="openai",
    api_key=os.getenv("CLOSEAI_API_KEY"),
    base_url=os.getenv("CLOSEAI_BASE_URL"),
)

messages = [{"role": "system", "content": "你是一个 AI 助手"}]
MAX_PAIRS = 10

print("开始对话（输入 quit 退出）\n")

while True:
    user_input = input("你: ")
    if user_input.lower() == "quit":
        break

    messages.append({"role": "user", "content": user_input})

    # 上下文裁剪
    memory = keep_recent_messages(messages, max_pairs=MAX_PAIRS)

    print("AI: ", end="", flush=True)
    reply = ""
    for chunk in model.stream(memory):
        if chunk.content:
            print(chunk.content, end="", flush=True)
            reply += chunk.content

    messages.append({"role": "assistant", "content": reply})
    print("\n")
```

## 总结

Message 和 Prompt Template 是 LangChain 中最基础也最重要的构件：

- **4 种 Message 类型**覆盖了 LLM 对话的所有角色场景
- **ChatPromptTemplate** 是 v1.x 推荐的模板方式，支持 role-based 多消息模板
- **MessagesPlaceholder** 实现了动态历史的灵活注入
- **content_blocks** 统一了多模态消息的跨供应商调用

掌握这些基础构件后，就可以进入更高阶的 Topics：Tools、结构化输出、Agent 和 RAG。
