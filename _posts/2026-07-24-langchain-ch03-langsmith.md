---
layout: post
title: "LangSmith：LangChain 可观测性平台实战指南"
date: 2026-07-24 16:00:00 +0800
categories: [开发工具]
tags: [LangChain, LangSmith, LLMOps, 可观测性]
---

LangSmith 是 LangChain 生态中的 LLM 应用可观测性平台，提供链路追踪、性能监控、数据集管理和模型评估等能力。对于生产环境的 AI 应用，LangSmith 是不可或缺的 DevOps 工具。

## LangSmith 的核心功能

### 1. Tracing（链路追踪）

自动记录每一次 LLM 调用的完整链路，包括：
- 输入/输出内容
- Token 用量
- 延迟数据
- Agent 和 RAG 的完整执行路径

当一个 Agent 依次调用 LLM、检索知识库、调用工具时，Trace 会将整个过程可视化呈现，每个环节的输入输出都清晰可查，极大简化了调试工作。

### 2. Monitoring（性能监控）

生产环境监控面板，实时展示：
- Token 消耗趋势
- QPS（每秒查询数）
- 响应延迟分布
- 错误率

通过这些指标，可以快速发现性能异常和瓶颈。

### 3. Datasets & Experiments（数据集与实验）

- 构建测试数据集（含边界情况）
- 对不同的 Prompt 或模型版本运行实验
- 对比评估结果，选择最优方案

### 4. Evaluators（评估器）

支持多种评估方式：
- **Assert-based**——基于规则的断言检查
- **LLM-as-a-judge**——用 LLM 评估输出质量
- 自定义评估函数

### 5. Annotation Queues（标注队列）

- 人工标注 Trace 数据
- 构建高质量的反馈数据集
- 持续改进 Prompt 和模型选择

## 附加工具

| 工具 | 功能 |
|------|------|
| **Prompts** | GitHub 风格的 Prompt 版本管理，支持 v1/v2 迭代和 API 回滚 |
| **Playground** | 在线测试 Prompt，支持切换不同模型（OpenAI、Anthropic 等） |
| **Studio** | LangGraph Agent 可视化，查看 Graph 状态流转 |
| **Context Hub** | 团队内共享 Prompt 和上下文 |

## 部署能力

LangSmith 的 Deployments 功能可将 LangChain 和 LangGraph Agent 直接部署为 API 接口。Sandboxes 提供了隔离的测试环境，支持 Tracing、Playground、Datasets 和 Studio 的完整功能。

## 快速接入

### 1. 注册并获取 API Key

访问 [smith.langchain.com](https://smith.langchain.com)，登录后进入设置页面生成 API Key。

### 2. 配置环境变量

在 `.env` 文件中添加以下配置：

```bash
# 启用 Tracing
LANGSMITH_TRACING=true

# LangSmith API 端点
LANGSMITH_ENDPOINT=https://api.smith.langchain.com

# API Key（从 Web UI 获取）
LANGSMITH_API_KEY=<YOUR_API_KEY>

# 项目名称（在 Web UI 中创建）
LANGSMITH_PROJECT="pr-clear-harmony-32"
```

### 3. 自动追踪

配置完成后，`load_dotenv()` 会自动加载这些环境变量，LangChain 的所有调用会自动上报 Trace 数据：

```python
from dotenv import load_dotenv
from langchain_deepseek import ChatDeepSeek

load_dotenv(override=True)

model = ChatDeepSeek(
    api_key=os.getenv("DEEPSEEK_API_KEY"),
    api_base=os.getenv("DEEPSEEK_BASE_URL"),
    model="deepseek-v4-flash",
)

# 这次调用会自动出现在 LangSmith Dashboard 中
print(model.invoke("你好"))
```

### 4. Config 元数据标注

通过 `config` 参数为 Trace 添加自定义元数据，方便在 Dashboard 中筛选和检索：

```python
config = {
    "run_name": "joke_generation",        # 在 LangSmith 中显示的名称
    "tags": ["my_tag1", "my_tag2"],        # 标签
    "metadata": {                          # 自定义元数据
        "user_id": "shkstart",
        "session_id": "sess_123"
    },
    "configurable": {                      # 运行时配置覆盖
        "model": "deepseek-v4-pro",
        "temperature": 0.7,
        "max_tokens": 1000
    }
}

response = model.invoke("讲个笑话", config=config)
```

在 LangSmith Web UI 中，可以通过 `run_name`、`tags` 和 `metadata` 快速定位到特定的 Trace。

## 总结

LangSmith 解决了 LLM 应用开发中的一个关键痛点：**AI 应用的黑盒问题**。传统应用有成熟的日志和监控体系，而 LLM 应用的"不可预测性"让调试和评估变得异常困难。LangSmith 通过 Tracing、Evaluation 和 Monitoring 三大能力，将 AI 应用的"黑盒"变成了"玻璃盒"。

对于任何生产级别的 LangChain 应用，LangSmith 都是强烈推荐的配套工具——它不仅帮助你在开发阶段快速定位问题，更在生产环境中提供持续的质量监控。
