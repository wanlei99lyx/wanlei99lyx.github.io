---
layout: post
title: "LangChain 1.2 完全攻略：从入门到实战（十章节全）"
date: 2026-07-24 22:00:00 +0800
categories: [开发工具]
tags: [LangChain, AI框架, RAG, Agent, Tools, PromptTemplate, LLM, Ollama]
toc: true
---

本系列是尚硅谷 LangChain 课程的系统笔记，覆盖 LangChain 1.2 框架的核心概念与实践操作。全文共十章，从框架概述到环境搭建、模型调用、提示词模板、工具调用、结构化输出、智能体、中间件、记忆系统，再到 RAG 完整实现。

> 环境要求：Python 3.10+，推荐使用 conda 或 uv 管理虚拟环境。

## 一、LangChain 概述

### 1.1 什么是 LangChain

LangChain 是一个用于构建基于大语言模型（LLM）应用的开发框架。它解决了 AI 应用开发中的几个核心问题：

1. **统一的模型 API 抽象**——屏蔽不同模型供应商的 API 差异
2. **链式调用编排**——将多个 LLM 调用、工具调用组合成复杂工作流
3. **智能体（Agent）机制**——让 LLM 自主决策、调用工具、执行行动

### 1.2 发展历程

| 阶段 | 时间 | 关键事件 |
|------|------|---------|
| **诞生** | 2022 年 10 月 | Harrison Chase 创建 LangChain |
| **快速崛起** | 2022 Q4 - 2023 Q1 | PromptTemplate、LLMChain 核心组件落地 |
| **生态扩张** | 2023 Q2 - Q4 | Tool、Agent、Retrieval 能力加入 |
| **平台化** | 2024 - 2025 | LangGraph、LangServe 发布 |
| **Agent 深化** | 2025 年后 | Deep Agent、Agent Harness 发布 |

### 1.3 v0.3 vs v1.2 核心变化

2025 年 10 月 20 日，LangChain 正式发布 v1.0.0。从 v0.3 到 v1.2，API 发生了重大变化：

| 维度 | v0.3 | v1.2 |
|------|------|------|
| Chain API | `LLMChain` 类 | `\|` 管道运算符 |
| Agent | `initialize_agent` | `create_agent` + LangGraph |
| Tool 定义 | `@tool` 装饰器 | Pydantic Schema |
| 结构化输出 | JSON Parser | `with_structured_output()` |
| 包结构 | 单包 `langchain` | `langchain-core` + `langchain-classic` + `langchain-community` |
| Python | >= 3.9 | >= 3.10 |
| Pydantic | v1 | v2 |

核心变化总结：**v1.x 抛弃了 Chain，全面拥抱 LangGraph**，AI Agent 成为第一公民。

### 1.4 生态系统

LangChain 生态包括四大核心产品：

- **LangChain（核心框架）**——模型调用、Message、Tool、Middleware 核心 API
- **LangGraph（编排引擎）**——有状态图形编排，Node + Edge + State
- **Deep Agent（深度智能体）**——树状搜索推理、多工具协调、持久化状态
- **LangSmith（可观测性平台）**——链路追踪、性能监控、评估、数据集管理

### 1.5 环境搭建

```bash
# 创建环境（推荐 Python 3.13.12）
conda create --name langchain1.2 python=3.13.12
conda activate langchain1.2

# 安装 LangChain
pip install langchain==1.2.12

# 验证
python -c "import langchain; print(langchain.__version__)"
```

其他常用包：
```bash
pip install langchain-openai langchain-deepseek langchain-ollama python-dotenv
```

---

## 二、模型的创建与调用

### 2.1 创建模型的几种方式

LangChain 1.2 提供了三种创建模型的途径：

**方式一：专属模型类**

```python
from langchain_deepseek import ChatDeepSeek

deepseek_llm = ChatDeepSeek(
    api_key="sk-xxx",
    api_base="https://api.deepseek.com",
    model="deepseek-v4-flash",
)
```

各供应商对应类：

| 供应商 | 模型类 | 安装包 |
|--------|--------|--------|
| DeepSeek | `ChatDeepSeek` | `langchain-deepseek` |
| 智谱 AI | `ChatZhipuAI` | `langchain-community` |
| 阿里通义 | `ChatTongyi` | `dashscope` |
| OpenAI | `ChatOpenAI` | `langchain-openai` |
| OpenRouter | `ChatOpenRouter` | `langchain-openrouter` |
| Ollama | `ChatOllama` | `langchain-ollama` |

**方式二：通用 ChatOpenAI 方式**

大多数模型供应商兼容 OpenAI API 格式：

```python
from langchain_openai import ChatOpenAI

model = ChatOpenAI(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL"),
    model="deepseek-v4-flash",
)
```

**方式三：init_chat_model()（推荐）**

```python
from langchain.chat_models import init_chat_model

model = init_chat_model(
    model="deepseek-v4-flash",
    model_provider="deepseek",
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    base_url=os.getenv("DEEPSEEK_BASE_URL"),
)
```

借助 `init_chat_model()` 切换供应商只需改参数：

```python
# 切换到 OpenAI
model = init_chat_model(model="gpt-5.4-mini", model_provider="openai")
# 切换到 Ollama
model = init_chat_model(model="deepseek-r1:1.5b", model_provider="ollama")
```

### 2.2 核心参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `temperature` | 生成随机性（0.0 确定 - 2.0 随机） | 0.7 |
| `max_tokens` | 最大输出 token 数 | None |
| `timeout` | 请求超时（秒） | None |
| `max_retries` | 失败重试次数 | 6 |

temperature 选择：
- **0.0 - 0.3**：代码生成、数学计算、JSON 输出
- **0.5 - 0.7**：通用对话、翻译
- **0.8 - 1.5**：创意写作、头脑风暴

### 2.3 四种调用方式

| 方法 | 说明 |
|------|------|
| `invoke()` | 同步调用，返回完整结果 |
| `stream()` | 流式调用，逐 token 返回 |
| `batch()` | 批量调用，支持并发 |
| `ainvoke()` / `astream()` / `abatch()` | 异步变体 |

```python
# invoke
response = model.invoke("你好")

# stream
for chunk in model.stream("讲个故事"):
    print(chunk.content, end="", flush=True)

# batch
results = model.batch(["问题1", "问题2"], config={"max_concurrency": 5})
```

### 2.4 Message 类型体系

LangChain 1.2 有 4 种核心 Message 类型：

| 消息类 | role | 说明 |
|--------|------|------|
| `SystemMessage` | system | 系统提示词 |
| `HumanMessage` | user | 用户输入 |
| `AIMessage` | assistant | AI 回复（含 tool_calls） |
| `ToolMessage` | tool | 工具调用结果 |

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

### 2.5 Ollama 本地模型

```bash
ollama pull deepseek-r1:1.5b
ollama run deepseek-r1:1.5b
```

```python
from langchain_ollama import ChatOllama

ollama_llm = ChatOllama(model="deepseek-r1:1.5b", base_url="http://localhost:11434")
```

---

## 三、LangSmith 可观测性平台

LangSmith 是 LLM 应用的可观测性平台，提供链路追踪、性能监控和评估能力。

### 核心功能

| 功能 | 说明 |
|------|------|
| **Tracing** | 记录每次 LLM 调用的完整链路 |
| **Monitoring** | 实时监控 Token 消耗、QPS、延迟 |
| **Datasets & Experiments** | 测试数据集 + Prompt 版本实验 |
| **Evaluators** | Assert 检查、LLM-as-a-judge |
| **Annotation Queues** | 人工标注 Trace 数据 |

### 快速接入

```bash
# .env
LANGSMITH_TRACING=true
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=<YOUR_API_KEY>
LANGSMITH_PROJECT="your-project-name"
```

```python
from dotenv import load_dotenv
load_dotenv(override=True)  # 自动激活 Tracing
```

通过 `config` 参数为 Trace 添加元数据：

```python
config = {
    "run_name": "joke_generation",
    "tags": ["test"],
    "metadata": {"user_id": "123"},
    "configurable": {"temperature": 0.7},
}
response = model.invoke("讲个笑话", config=config)
```

---

## 四、Message 与提示词模板

### 4.1 content_blocks：多模态消息

LangChain 1.2 支持 `content_blocks` 统一处理文本、图片等多模态内容：

```python
import base64

response = model.invoke([
    HumanMessage(
        content_blocks=[
            {'type': 'text', 'text': '描述这张图片'},
            {'type': 'image', 'base64': base64_image, 'mime_type': 'image/png'},
        ]
    )
])
```

### 4.2 PromptTemplate vs ChatPromptTemplate

**ChatPromptTemplate（v1.x 推荐）**：

```python
from langchain_core.prompts import ChatPromptTemplate

chat_template = ChatPromptTemplate.from_messages([
    ("system", "你是{name}助手"),
    ("human", "你好"),
    ("ai", "你好！"),
    ("human", "{user_input}"),
])

prompt = chat_template.invoke({"name": "AI", "user_input": "今天天气？"})
response = model.invoke(prompt)
```

### 4.3 MessagesPlaceholder（动态对话历史）

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

### 4.4 高级模板技巧

**部分模板（Partial Templates）：**

```python
base = ChatPromptTemplate.from_messages([
    ("system", "你是{company}的{role}"),
    ("human", "{task}"),
])
sales_template = base.partial(company="ABC科技")
sales_template.invoke({"role": "顾问", "task": "写邮件"})
```

**模板组合：**

```python
combined = template1 + template2  # 合并
```

---

## 五、Tools 工具调用

Tool Calling 是 LangChain 的核心能力——让 LLM 能够调用外部 API。

### 5.1 @tool 装饰器

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

### 5.2 绑定与调用

```python
# 绑定工具到模型
model_with_tools = model.bind_tools([get_weather])

# AI 自动判断是否调用
response = model_with_tools.invoke("北京天气怎么样？")

if response.tool_calls:
    print("AI 调用工具:", response.tool_calls)
```

调用结果：

```python
[{'name': 'get_weather', 'args': {'city': '北京'}, 'id': 'call_xxx', 'type': 'tool_call'}]
```

### 5.3 完整流程

```python
from langchain_core.messages import HumanMessage, ToolMessage

messages = [HumanMessage("北京天气？")]

# 第1步：AI 决定调用工具
response = model_with_tools.invoke(messages)
messages.append(response)

# 第2步：执行工具并返回结果
for tc in response.tool_calls:
    tool_result = get_weather.invoke(tc)  # 返回 ToolMessage
    messages.append(tool_result)

# 第3步：AI 结合工具结果回答
final = model_with_tools.invoke(messages)
```

### 5.4 Pydantic 精确控制参数

```python
from pydantic import BaseModel, Field
from typing import Literal

class WeatherInput(BaseModel):
    city: str = Field(description="城市名称")
    unit: Literal["celsius", "fahrenheit"] = Field(default="celsius")

@tool(args_schema=WeatherInput)
def get_weather(city: str, unit: str = "celsius") -> str:
    ...
```

### 5.5 tool_choice 控制

| 取值 | 行为 |
|------|------|
| `None`（默认） | LLM 自主决定 |
| `"none"` | 禁止调用工具 |
| `"auto"` | 自主决定（同默认） |
| `"required"` | 强制调用至少一个工具 |
| `"tool_name"` | 强制调用指定工具 |

```python
model.bind_tools([get_weather], tool_choice="required")
```

---

## 六、结构化输出

### 6.1 传统方式 vs with_structured_output

传统方式需要手动解析 JSON，易出错：

```python
# 传统方式：手工 JSON + 验证
prompt = "JSON 格式返回：{name, age, occupation}"
response = model.invoke(prompt)
data = json.loads(response.content)  # 可能解析失败
```

### 6.2 with_structured_output（推荐）

LangChain 1.2 的 `with_structured_output()` 自动将 Pydantic 模型转为 Tool Schema，让 LLM 通过 tool_calls 返回结构化数据：

```python
from pydantic import BaseModel, Field

class Person(BaseModel):
    name: str = Field(description="姓名")
    age: int = Field(description="年龄")
    occupation: str = Field(description="职业")

structured_llm = model.with_structured_output(Person)
person = structured_llm.invoke("张三，30 岁，程序员")
print(person.name)  # 张三
print(person.age)   # 30
```

返回的是 Pydantic 对象，字段类型自动验证。

### 6.3 TypedDict 方式

```python
from typing import TypedDict

class Movie(TypedDict):
    title: str
    year: int
    rating: float

structured_llm = model.with_structured_output(Movie)
result = structured_llm.invoke("《盗梦空间》2010，评分 9.3")
```

### 6.4 JSON Schema 方式

```python
json_schema = {
    "type": "object",
    "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer"},
    },
    "required": ["name", "age"],
}

structured_llm = model.with_structured_output(json_schema)
```

---

## 七、智能体（Agent）

Agent 是 LangChain 中最具想象力的功能——它让 LLM 能够自主规划、调用工具、观察结果并持续迭代。

### 7.1 Agent 公式

```
Agent = LLM + Planning + Tools + Memory + Action
```

### 7.2 创建 Agent（v1.x 方式）

LangChain 1.x 使用 `create_agent()` 替代了旧版的 `initialize_agent()`：

```python
from langchain.agents import create_agent, AgentExecutor
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取城市天气"""
    return f"{city} 20°C"

@tool
def calculate(expr: str) -> str:
    """计算数学表达式"""
    return str(eval(expr))

agent = create_agent(
    model="gpt-5.4-mini",
    model_provider="openai",
    tools=[get_weather, calculate],
)

executor = AgentExecutor(agent=agent, tools=[get_weather, calculate])

response = executor.invoke({"input": "北京天气怎么样？再算一下 2^10"})
print(response["output"])
```

### 7.3 ReAct 模式

ReAct（Reasoning + Acting）是 Agent 的经典推理模式：

```
思考：用户想知道北京天气，我需要调用天气工具
行动：get_weather(city="北京")
观察：北京 20°C
思考：好的，北京 20°C，同时用户还要求计算 2^10
行动：calculate(expr="2**10")
观察：1024
思考：现在我可以给出完整回答了
回答：北京今天 20°C，2^10 = 1024
```

### 7.4 v0.3 兼容：create_react_agent

```python
from langchain.agents import create_react_agent, AgentExecutor
from langchain_core.prompts import PromptTemplate

prompt = PromptTemplate.from_template("""
You are a helpful assistant.
Tools: {tools}
Tool Names: {tool_names}
{agent_scratchpad}
""")

agent = create_react_agent(llm=model, tools=tools, prompt=prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)
executor.invoke({"input": "搜索 LangChain 最新版本"})
```

---

## 八、中间件（Middleware）

中间件是 LangChain 1.x 引入的重要机制，允许在 Agent 执行的不同阶段插入自定义逻辑。

### 8.1 中间件的概念

```
请求 → [中间件1] → [中间件2] → [Agent 核心] → [中间件2] → [中间件1] → 响应
```

中间件在 Agent 的每个执行步骤前后触发，类似于 Web 框架的中间件机制。

### 8.2 内置中间件

```python
from langchain.agents import create_agent
from langchain.agents.middleware import (
    SummarizationMiddleware,
    HumanInTheLoopMiddleware,
    PIIMaskingMiddleware,
)

agent = create_agent(
    model="gpt-5.4-mini",
    model_provider="openai",
    tools=[...],
    middleware=[
        SummarizationMiddleware(max_tokens=2000),
        HumanInTheLoopMiddleware(),
    ],
)
```

### 8.3 主要中间件类型

| 中间件 | 功能 |
|--------|------|
| **SummarizationMiddleware** | 自动压缩过长的对话历史 |
| **HumanInTheLoopMiddleware** | 关键操作前暂停，等待人工确认 |
| **PIIMaskingMiddleware** | 自动遮蔽敏感信息（身份证、手机号等） |
| **RateLimitMiddleware** | API 调用频率控制 |
| **LoggingMiddleware** | 请求/响应日志记录 |

### 8.4 自定义中间件

```python
from langchain.agents.middleware import BaseMiddleware

class LoggingMiddleware(BaseMiddleware):
    def pre_action(self, action, **kwargs):
        print(f"[LOG] 执行工具: {action.name}")
        return action

    def post_action(self, action, result, **kwargs):
        print(f"[LOG] 工具结果: {result}")
        return result

agent = create_agent(
    model="gpt-5.4-mini",
    tools=tools,
    middleware=[LoggingMiddleware()],
)
```

---

## 九、上下文与记忆

### 9.1 Message 级别的记忆

最简单的记忆——手动维护消息列表：

```python
conversation = [SystemMessage("你是 AI 助手")]

# 第1轮
conversation.append(HumanMessage("1+1=?"))
response1 = model.invoke(conversation)
conversation.append(AIMessage(content=response1.content))

# 第2轮
conversation.append(HumanMessage("刚才我问了什么？"))
response2 = model.invoke(conversation)
```

### 9.2 上下文窗口管理

LLM 上下文窗口有限，需控制输入长度：

```python
def keep_recent(messages, max_pairs=3):
    """保留系统消息 + 最近 N 轮对话"""
    system = [m for m in messages if isinstance(m, SystemMessage)]
    conversation = [m for m in messages if not isinstance(m, SystemMessage)]
    recent = conversation[-(max_pairs * 2):]
    return system + recent

# 只保留最近 2 轮
messages = keep_recent(long_conversation, max_pairs=2)
```

### 9.3 InMemorySaver（Agent 持久化）

LangGraph 提供了 `InMemorySaver`，让 Agent 在多次调用间保持状态：

```python
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent, AgentExecutor

agent = create_agent(
    model="gpt-5.4-mini",
    model_provider="openai",
    tools=[get_weather],
    checkpointer=InMemorySaver(),
)

executor = AgentExecutor(agent=agent, tools=[get_weather])

# 第一次调用
result1 = executor.invoke(
    {"input": "我叫张三"},
    config={"configurable": {"thread_id": "user_001"}}
)

# 第二次调用（Agent 记得名字）
result2 = executor.invoke(
    {"input": "我叫什么名字？"},
    config={"configurable": {"thread_id": "user_001"}}
)  # 回复：你叫张三
```

`thread_id` 用于区分不同会话。同一 `thread_id` 共享记忆，不同 `thread_id` 隔离。

### 9.4 三种记忆机制

| 级别 | 实现 | 说明 |
|------|------|------|
| **短期** | Message 列表 | 单次请求上下文 |
| **中期** | keep_recent 裁剪 | 限制上下文窗口 |
| **长期** | InMemorySaver | 跨请求持久化（可替换为 Redis/SQLite） |

---

## 十、RAG 检索增强生成

RAG（Retrieval-Augmented Generation）是目前企业级 LLM 应用最广泛的架构，能有效解决 LLM 知识过时和幻觉问题。

### 10.1 RAG 完整流程

```
文档（PDF/Word/TXT）
  → 文档加载器（Document Loaders）
  → 文本分割器（Text Splitters）
  → Embedding 模型
  → 向量数据库（Vector Store）
  → 相似度搜索
  → Reranker（重排序）
  → Prompt（Context + Query）
  → LLM → 回答
```

### 10.2 Document Loaders

```python
from langchain_community.document_loaders import TextLoader, CSVLoader, JSONLoader

# TXT
loader = TextLoader("data.txt")
docs = loader.load()

# CSV
loader = CSVLoader("data.csv")
docs = loader.load()

# JSON
loader = JSONLoader("data.json", jq_schema=".[]")
docs = loader.load()

# PDF
from langchain_community.document_loaders import PyPDFLoader
loader = PyPDFLoader("document.pdf")
docs = loader.load()
```

### 10.3 文本分割

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", "。", "！", "？", " ", ""],
)
chunks = splitter.split_documents(docs)
```

### 10.4 Embedding 与向量存储

```python
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
vectorstore = Chroma.from_documents(chunks, embeddings)

# 相似度搜索
results = vectorstore.similarity_search("相关问题", k=5)

# 作为检索器使用
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
```

### 10.5 完整 RAG 链路

```python
from langchain_core.prompts import ChatPromptTemplate

# 构建 prompt
template = ChatPromptTemplate.from_messages([
    ("system", "基于以下上下文回答问题。如无法从上下文中找到答案，请如实告知。\n\n{context}"),
    ("human", "{question}"),
])

# 检索上下文
docs = retriever.invoke("LangChain 如何创建 Agent？")
context = "\n\n".join([d.page_content for d in docs])

# 生成回答
response = model.invoke(template.invoke({
    "context": context,
    "question": "LangChain 如何创建 Agent？"
}))
```

### 10.6 引入 Reranker 提升质量

Reranker 对检索结果进行语义重排序，能显著提升最终回答质量：

```python
# 先用向量检索取更多结果（如 top 20）
initial_results = vectorstore.similarity_search(query, k=20)

# 用 Reranker 精排取 top 3-5
from langchain_community.cross_encoders import HuggingFaceCrossEncoder
reranker = HuggingFaceCrossEncoder(model_name="BAAI/bge-reranker-v2-m3")
pairs = [(query, doc.page_content) for doc in initial_results]
scores = reranker.score(pairs)

# 按分数排序取 top
ranked = [doc for _, doc in sorted(zip(scores, initial_results), reverse=True)][:5]
```

### 10.7 RAG 核心优势

| 对比项 | 纯 LLM | LLM + RAG |
|--------|--------|-----------|
| 知识时效性 | 训练数据截止日期 | 实时检索最新信息 |
| 幻觉率 | 较高（约 20-30%） | 大幅降低（约 5-10%） |
| 可解释性 | 黑盒 | 可追溯来源文档 |
| 领域适配 | 需要微调 | 零成本接入企业知识库 |

---

## 总结

LangChain 1.2 是一个成熟的 AI 应用开发框架，核心能力可以用一张图概括：

```
应用层：      Agent（智能体）        RAG（检索增强）
编排层：      LangGraph
工具层：      Tools（工具调用）      Middleware（中间件）
模型层：      Chat Models（统一模型抽象）
可观测性：    LangSmith（追踪 + 监控 + 评估）
```

学习路径建议：

1. **入门**：模型创建与调用（二）→ Message（四）→ PromptTemplate（四）
2. **进阶**：Tools（五）→ 结构化输出（六）→ Agent（七）
3. **深入**：Middleware（八）→ Memory（九）→ RAG（十）
4. **生产**：LangSmith（三）→ LangGraph → Deep Agent
