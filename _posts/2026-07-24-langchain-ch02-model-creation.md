---
layout: post
title: "LangChain 模型的创建与调用：从入门到实战"
date: 2026-07-24 14:00:00 +0800
categories: [开发工具]
tags: [LangChain, LLM, API, Ollama, DeepSeek]
---

LangChain 的核心能力之一是对不同模型供应商的统一抽象。无论你使用 OpenAI、Anthropic、DeepSeek 还是本地运行的 Ollama，LangChain 都提供了一致的 API 接口。本文详细介绍 LangChain 1.2 中模型的创建、配置与调用方式。

## 模型 I/O 体系

LangChain v1.x 的模型 I/O 分为三个环节：

```
Prompt Template → Model → Output Parser
```

- **Prompt Template**——构建输入提示词
- **Model**——调用 LLM 生成回复
- **Output Parser**——解析模型输出为结构化数据

## 创建模型的几种方式

### 1. 专属模型类（v0.3 兼容方式）

每个模型供应商有对应的封装类：

| 供应商 | 模型类 | 安装包 |
|--------|--------|--------|
| DeepSeek | `ChatDeepSeek` | `langchain-deepseek` |
| 智谱 AI | `ChatZhipuAI` | `langchain-community` + `pyjwt` |
| 阿里通义 | `ChatTongyi` | `dashscope` |
| OpenAI | `ChatOpenAI` | `langchain-openai` |
| OpenRouter | `ChatOpenRouter` | `langchain-openrouter` |
| Ollama | `ChatOllama` | `langchain-ollama` |

**DeepSeek 示例：**

```python
from langchain_deepseek import ChatDeepSeek
from dotenv import load_dotenv
import os

load_dotenv(override=True)

deepseek_llm = ChatDeepSeek(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    api_base=os.getenv("DEEPSEEK_BASE_URL"),
    model="deepseek-v4-flash",
)

print(deepseek_llm.invoke("你好"))
```

**智谱 AI 示例：**

```python
from langchain_community.chat_models import ChatZhipuAI

zhipu_llm = ChatZhipuAI(
    model="glm-5.1",
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    api_base=os.getenv("ZHIPUAI_BASE_URL"),
)
```

**阿里通义示例：**

```python
from langchain_community.chat_models import ChatTongyi

tongyi_llm = ChatTongyi(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    model="qwen-plus",
)
```

### 2. 通用 ChatOpenAI 方式

由于大多数模型供应商兼容 OpenAI API 格式，可以直接用 `ChatOpenAI` 配合不同的 `base_url` 调用：

```python
from langchain_openai import ChatOpenAI

# 调用 DeepSeek
deepseek_llm = ChatOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL"),
    model="deepseek-v4-flash",
)

# 调用智谱 AI
zhipu_llm = ChatOpenAI(
    api_key=os.getenv("ZHIPUAI_API_KEY"),
    base_url=os.getenv("ZHIPUAI_BASE_URL"),
    model="glm-5.1",
)

# 调用通义千问
tongyi_llm = ChatOpenAI(
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
    model="qwen-plus",
)
```

### 3. init_chat_model()（v1.x 推荐方式）

LangChain v1.x 推荐使用统一的 `init_chat_model()` 函数，通过 `model` 和 `model_provider` 参数切换供应商：

```python
from langchain.chat_models import init_chat_model

# DeepSeek
model = init_chat_model(
    model="deepseek-v4-flash",
    model_provider="deepseek",
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL"),
)

# 通义千问（OpenAI 兼容模式）
model = init_chat_model(
    model="qwen-plus",
    model_provider="openai",
    api_key=os.getenv("DASHSCOPE_API_KEY"),
    base_url=os.getenv("DASHSCOPE_BASE_URL"),
)

# 响应
response = model.invoke("你好")
print(response)
```

支持的 `model_provider` 包括：`deepseek`, `openai`, `anthropic`, `ollama`, `openrouter`, `google_genai`, `groq`, `mistralai`, `cohere`, `together` 等数十种。

指定格式为 `"provider:model_name"`，例如 `"openai:gpt-5.4-mini"`。

## 模型参数详解

### 核心参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `model` | `str` | 模型名称 | 必填 |
| `model_provider` | `str` | 模型供应商 | 根据模型推断 |
| `api_key` | `str` | API 密钥 | `None` |
| `base_url` | `str` | API 端点地址 | `None` |
| `temperature` | `float` | 生成随机性（0.0-2.0） | `0.7` |
| `max_tokens` | `int` | 最大输出 token 数 | `None` |
| `timeout` | `float` | 请求超时（秒） | `None` |
| `max_retries` | `int` | 失败重试次数 | `6` |

### temperature 选择指南

| 范围 | 适用场景 |
|------|---------|
| 0.0 - 0.3 | 代码生成、数学计算、JSON 输出、分类 |
| 0.5 - 0.7 | 通用对话、文案写作、翻译 |
| 0.8 - 1.5 | 创意写作、头脑风暴、诗歌 |
| 1.5 - 2.0 | 超创意生成（质量不稳定） |

相同输入下，temperature 越高，每次输出差异越大；temperature 越低，输出越确定。

## 常用 API 平台

在国内使用 LangChain 时，以下是常用的 API 接入平台：

| 平台 | 特点 | 接入方式 |
|------|------|---------|
| **OpenRouter** | 聚合多种模型，统一 API 和计费 | `ChatOpenRouter` 或 `ChatOpenAI` |
| **CloseAI** | OpenAI API 代理，可访问 GPT-4 等 | `ChatOpenAI` + 代理 base_url |
| **阿里云百炼** | 通义千问系列模型 | `ChatTongyi` 或 `ChatOpenAI` |
| **硅基流动** | 开源模型托管，价格低 | `ChatOpenAI` |
| **百度千帆** | 文心系列模型 | `ChatOpenAI` |

## 四种调用方式

LangChain 模型支持四种调用模式：

| 方法 | 说明 | 适用场景 |
|------|------|---------|
| `invoke()` | 同步调用，返回完整结果 | 通用 |
| `ainvoke()` | 异步调用 | Web 后端 |
| `stream()` | 流式调用，逐 token 返回 | 实时展示 |
| `astream()` | 异步流式 | Web 实时输出 |
| `batch()` | 批量调用 | 批量处理 |
| `abatch()` | 异步批量 | 高并发场景 |

### invoke()：基础调用

```python
# 传入字符串
response = model.invoke("你好")

# 传入消息列表
messages = [
    {"role": "system", "content": "你是一个 Python 专家"},
    {"role": "user", "content": "请解释装饰器"},
]
response = model.invoke(messages)
```

### stream()：流式输出

逐 token 实时返回，适合对话式应用：

```python
for chunk in model.stream("讲个故事"):
    print(chunk.content, end="", flush=True)
```

### batch()：批量处理

同时处理多个输入，支持并发控制：

```python
inputs = ["问题1", "问题2", "问题3", "问题4", "问题5"]

results = model.batch(
    inputs,
    config={"max_concurrency": 5}  # 最多 5 个并发
)
```

## Message 体系

LangChain 使用标准化的 Message 类型表示对话中的不同角色：

| 消息类型 | 对应 role | 说明 |
|----------|-----------|------|
| `SystemMessage` | `system` | 系统提示词，设定 AI 行为 |
| `HumanMessage` | `user` | 用户输入 |
| `AIMessage` | `assistant` | AI 回复 |

```python
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

messages = [
    SystemMessage("你是 Python 专家"),
    HumanMessage("2 + 3 * 2 = "),
    AIMessage("8"),
    HumanMessage("为什么？"),
]

response = model.invoke(messages)
```

### 多轮对话维护

```python
conversation = [
    SystemMessage("你是一个 AI 助手"),
    HumanMessage("你好")
]

# 第一轮
response1 = model.invoke(conversation)
conversation.append(AIMessage(content=response1.content))

# 第二轮（保留上下文）
conversation.append(HumanMessage("刚才我说了什么？"))
response2 = model.invoke(conversation)
```

## AIMessage 响应结构

`invoke()` 返回 `AIMessage` 对象，包含丰富的元信息：

```
AIMessage(
    content='2 + 3 * 2 = **8**',       # 回复内容
    additional_kwargs={'refusal': None}, # 额外信息
    response_metadata={
        'token_usage': {
            'completion_tokens': 15,    # 输出 token 数
            'prompt_tokens': 16,         # 输入 token 数
            'total_tokens': 31,          # 总计
        },
        'model_name': 'gpt-5.4-mini-...',# 实际使用模型
        'finish_reason': 'stop',         # 结束原因
    },
    tool_calls=[],                      # 工具调用
    usage_metadata={
        'input_tokens': 16,
        'output_tokens': 15,
        'total_tokens': 31,
    }
)
```

关键字段：
- `content`——模型生成的文本内容
- `response_metadata`——包含 token 用量、模型名称、结束原因
- `usage_metadata`——LangChain 标准化的用量统计
- `tool_calls`——函数调用请求列表

## 本地模型：Ollama 集成

Ollama 是在本地运行开源模型的首选工具。

### 安装 Ollama

- **Linux**: `curl -fsSL https://ollama.com/install.sh | sh`
- **Windows**: 下载安装包，或 `OllamaSetup.exe /DIR=F:\common_tools\Ollama`

### 常用命令

```bash
ollama pull deepseek-r1:1.5b   # 下载模型
ollama run deepseek-r1:1.5b    # 运行模型
ollama list                    # 查看已安装模型
ollama serve                   # 启动 API 服务
ollama ps                      # 查看运行中的模型
```

### LangChain 调用 Ollama

```python
from langchain_ollama import ChatOllama

ollama_llm = ChatOllama(
    model="deepseek-r1:1.5b",
    base_url="http://localhost:11434",  # 默认地址
)

response = ollama_llm.invoke("你好")
```

也支持 `init_chat_model` 方式：

```python
model = init_chat_model(
    model="deepseek-r1:1.5b",
    model_provider="ollama",
)
```

## Config 配置详解

LangChain 支持通过 `config` 参数控制运行时行为：

```python
config = {
    "run_name": "joke_generation",       # LangSmith 追踪名
    "tags": ["tag1", "tag2"],             # 标签
    "metadata": {"user_id": "123"},       # 自定义元数据
    "configurable": {
        "model": "deepseek-v4-pro",       # 运行时切换模型
        "temperature": 0.7,                # 运行时切换参数
    }
}

response = model.invoke("讲个笑话", config=config)
```

**注意**：要在 `init_chat_model()` 中启用 `configurable` 字段，需要声明可配置参数：

```python
model = init_chat_model(
    model="deepseek-v4-flash",
    model_provider="deepseek",
    configurable_fields=("model", "temperature", "max_tokens"),
)
```

## 安全性：API Key 管理

永远不要将 API Key 硬编码在代码中。推荐使用 `.env` 文件：

```bash
# .env 文件
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

```python
from dotenv import load_dotenv
load_dotenv(override=True)

import os
api_key = os.getenv("DEEPSEEK_API_KEY")
```

将 `.env` 加入 `.gitignore`，避免密钥泄露。

## 总结

LangChain 1.2 的模型层提供了灵活的三层抽象：
1. **专属类**——`ChatDeepSeek`、`ChatOpenAI` 等，语义清晰
2. **统一函数**——`init_chat_model()`，按需切换供应商
3. **通用兼容**——`ChatOpenAI` + `base_url`，覆盖 OpenAI 兼容 API

四种调用方式（invoke / stream / batch / 异步变体）适应不同的应用场景。配合 Message 类型系统和 Config 运行时配置，LangChain 的模型层既能满足快速原型开发，也能支撑生产级 AI 应用。

下一章将介绍 LangSmith——LangChain 的可观测性平台。
