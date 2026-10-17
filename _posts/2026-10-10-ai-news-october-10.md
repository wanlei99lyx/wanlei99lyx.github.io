---
layout: post
title: "2026 年 10 月 10 日 AI 大事件：Gemini 4 Argon 参战、前沿模型集体锚定 2/10 美元、AI 算力撞上能源墙（附 10 月 2–9 日大事补记）"
date: 2026-10-10 01:50:00 +0800
categories: [行业动态]
tags: [Gemini 4 Argon, Google, Anthropic, Claude Haiku 5.5, OpenAI, GPT-6, Manus, Agent, 算力, 数据中心, AI安全, 具身智能]
---

过去一周，AI 行业同时发生了三件方向相反的事：**前沿模型价格继续向下**——谷歌 Gemini 4 Argon 把入门价压到每百万 Token 2 美元输入 / 10 美元输出，与 OpenAI GPT-6.1 Sol 几乎完全重合；**模型能力横向扩散**——马斯克宣布 Grok Bot 把任务外包给 Claude Opus 5.5，谷歌把 Claude 搬上 Google Cloud，“用谁的模型”正在变成可替换选项；而**算力与能源开始向上卡脖子**——甲骨文用卡车转运天然气给数据中心供电，光学组件厂商 Lumentum 的订单已经排到 2029 年初。

把这三条曲线叠在一起，本周真正的主题不是“谁又发了新模型”，而是：**当模型价格趋于一致、能力差距缩小，决定成败的因素转移到了系统层——电力、光学、封装、缓存、编排，以及谁能把 Agent 真正交付进企业。** 本期覆盖 10 月 2 日至 10 月 10 日，并在文末附上假期期间的补记。

## 一、Gemini 4 Argon：谷歌把前沿能力先交给了“网络防守方”

谷歌在 9 月 30 日（北京时间 10 月 1 日）发布新一代前沿模型 **Gemini 4 Argon**，但这一版不是“全面开放”，而是**分阶段放开**：首批通过 Fairwind Program 提供给经过审核的网络防御方，随后再逐步扩展到开发者、企业和消费者。到 10 月 9 日，Argon 已密集出现在 Google Cloud、编程工具 Antigravity 等平台，并向部分 Pro 用户开放。

![](/assets/images/posts/ai-october10-gemini4-argon.png)

Argon 的官方定位是三个方向：**真实软件工程、企业知识工作（法律、金融）、网络安全防御**。几个可核验的关键数据：

| 指标 | 官方数据 | 含义 |
|---|---|---|
| 入门价 | **$2 / 百万输入，$10 / 百万输出** | 与 GPT-6.1 Sol 完全同价 |
| 缓存输入 | 输入价的 **5%**（约 $0.10） | 长期 Agent 的账单主力 |
| 过渡期后价格 | **$4 / $20** | 新价格体系正在上行试探 |
| 输出上限 | **100 万 Token**（此前 64K） | 单次轨迹可生成数十万 Token |
| DeepSWE v1.1 | **77.9%** | 真实代码库长流程软件工程 |
| LVBench（长视频理解） | **91.7%** | 多模态长上下文 |
| CWE-bench v1（漏洞修复） | **68%** | 与头部模型并列第一 |

最值得注意的决策是：**谷歌对受信任的防御方和内部团队，直接发布不带网络防护栏（cyber guardrails）的 Argon**，让它完整发挥自主发现、验证、修补漏洞的能力。官方披露，Wiz 已在 Scan for Good 计划中用 Argon 发现了一个影响全球医院医疗软件的严重漏洞——**这是此前的前沿模型都漏掉的风险**。

![](/assets/images/posts/ai-october10-cwe-bench.png)

上方 CWE-bench v1 榜单也说明了当下的竞争密度：Gemini 4 Argon、Grok 4.7、GPT-6 Astra 三家以 68% 并列第一，Claude Opus 5.5 仅差 1 个百分点（67%），而 GPT-6 Sol 为 52%、DeepSeek-V4.1-Flash 为 55%。**在“修复漏洞”这类高价值任务上，第一梯队已经挤在一起。**

安全侧，谷歌披露了四层前置措施：拒答有害请求并加强内部激活监控；针对间接提示注入做对抗训练（声称在 Gray Swan 的 IPI 基准上领先）；监控 Argon 的思维链与动作，越界时中止执行；以及在训练前对沙箱环境做隔离封闭。官方还特别强调——**对训练过程的监控结果不会回流进训练**，以免模型学会规避监控。

## 二、2 美元 / 10 美元：前沿模型的定价正在“锚定”

如果只看单个模型，价格变化像是促销；但把本周发布放在一起看，会发现一个清晰的锚点正在形成。

| 模型 | 输入（每百万 Token） | 缓存输入 | 输出 | 备注 |
|---|---:|---:|---:|---|
| **GPT-6.1 Sol** | $2 | $0.10 | $10 | 标准价 |
| **Gemini 4 Argon** | $2 | ~$0.10 | $10 | 过渡期价格，之后 $4/$20 |
| Claude Opus 5.5 | $4 | $0.20 | $20 | 上一代旗舰定价 |
| Claude Haiku 5.5 | — | — | — | 比 Haiku 4.5 便宜约 75% |

两家最前沿的实验室，在不到两周内先后把“接近旗舰的能力”定在 **$2 输入 / $10 输出**，并把**缓存输入压到标准输入的 5%**。这不是巧合，而是同一个判断：**Agent 的主要成本来自反复读取上下文，而不是首次输入。**

一个简单的算术：若一个常驻 Agent 每天读取 1 亿缓存 Token，$0.20 与 $0.10 的差距是每天 10 美元、每月 300 美元；而当缓存价降到标准输入的 5%，同一份仓库文件被读 20 次与读 1 次的成本差异就被大幅抹平。**这正是“常驻 Agent”能成立的经济前提。**

反过来看，价格趋同意味着单靠“便宜”已经无法差异化。厂商必须转向其他维度竞争：任务成功率、单位成功成本、延迟、缓存命中率、工具生态、以及企业级权限与审计。**未来一年最有价值的指标可能不是 MMLU 排名，而是“跑完一个真实业务流程花了多少钱、返工几次”。**

## 三、Claude Haiku 5.5：小模型的角色从“省钱”变成“子代理”

10 月 7 日，Anthropic 发布 **Claude Haiku 5.5**，定位是最便宜、最快、也最强的小模型。它被明确设计用于**高频、成本敏感**的场景：摘要、上下文压缩、数据库查询、分类请求；同时可以**作为 Opus 5.5 / Sonnet 5.5 的子代理参与编码任务**，也适合实时客服和浏览器操作这类速度敏感场景。官方称其运行成本比 Haiku 4.5 **平均低约 75%**。

![](/assets/images/posts/ai-october10-haiku55.jpg)

| 基准 | Haiku 5.5 | Haiku 4.5 | GPT-6 Luna | Sonnet 5.5 |
|---|---:|---:|---:|---:|
| GDPval-AA v2.1（知识工作） | **1620** | 735 | 1437 | 1840 |
| AA-Briefcase v1.1 | **1578** | 614 | 1336 | 1824 |
| OSWorld 2.1（电脑操作，离线集） | **72.4%** | 15.7% | 48.9% | 83.9% |
| Humanity's Last Exam（无工具） | **45.9%** | 10.2% | — | 56.9% |
| Terminal-Bench 4.0（Agent 编码） | **39.2%** | 0.0% | 16.4% | 70.6% |
| FrontierCode 1.1（Main） | **46.4%** | — | 42.4% | 52.1% |
| Chartography（视觉推理） | **46.4%** | 6.4% | 29.1% | 61.6% |

几个数字值得停下来看：Haiku 5.5 在 OSWorld 2.1 上从 15.7% 跳到 **72.4%**，在 Terminal-Bench 4.0 上从 **0.0%** 跳到 39.2%，同时它还超过了 GPT-6 Luna。**“小模型只能做简单事”这条经验规律已经失效**——现在的分层逻辑是“子代理能力”，而不是“能力阉割”。

Haiku 5.5 也是 Haiku 系列首款支持**可调推理强度（effort）**的模型，意味着同一个模型可以在“省钱”和“聪明”之间滑动。配合这一发布，Anthropic 把 **Sonnet 5.5 的缓存读取价砍半**，官方称其多数 Agent 工作负载因此便宜约 **20%**；同时为 Max 与 Team 订阅用户新增每月 API 额度。

把这条与上一条放在一起：**Agent 的总成本是它所有步骤的成本之和。** 一个任务如果由 30 步组成，其中 25 步可以交给便宜 75% 的子代理，那么优化小模型带来的节省，远比把旗舰模型单价砍掉 20% 更显著。这解释了为什么两家实验室同时在“旗舰降价”和“小模型跃升”两个方向发力。

## 四、Opus 5.5 接入一切：模型层开始变成“通用供应商”

10 月 9 日的一条消息颇具象征意义：马斯克宣布 **Grok Bot 将按任务外包给 Claude Opus 5.5**；仅一天后，谷歌在 Google Cloud 发布会上直接提供 **Claude Opus 5 与 Sonnet 5**。

这背后是一个正在发生的结构性变化：**最前沿的模型厂商，正在变成彼此的供应商。** 当调用成本趋同、能力接近，产品方的理性选择是“按任务择优路由”，而不是绑定单一模型。对用户而言这是好事——同一个界面可以调用各家最强能力；对模型厂商而言，这既是收入，也是风险：**你越容易被替换，定价权就越弱。**

对照来看，OpenAI 走的是相反方向：用 Dots 常驻智能体、Codex 云环境、Agents API 和 Sign in with ChatGPT 把用户锁在自己编排层里。Anthropic 则一边向第三方平台供货，一边用“安全与合规”构筑差异化。**一个赌入口，一个赌信任与交付。**

## 五、算力撞上能源墙：卡车运天然气，光学订单排到 2029 年

如果模型价格在下降，算力需求就应该下降吗？现实恰恰相反。本周三条基础设施新闻说明了瓶颈在哪里：

**第一，电力。** 彭博社报道，甲骨文（Oracle）正通过**卡车转运天然气**的方式，在配套燃气管网建成前临时满足数据中心能源需求，以加速算力上线。该方案已在犹他州一座数据中心使用一年有余，并用于为 OpenAI 开发的得克萨斯州 Shackelford 项目。当一家云厂商需要用卡车拉气来给 GPU 供电，说明**电力接入速度已经慢于芯片部署速度**。

**第二，光学。** Lumentum CEO 在东京表示，公司光学组件几乎“售罄”，**订单排到 2029 年初**；明年将无法满足部分产品约 **70%** 的需求，到 2028 年仍无法满足另一部分。AI 集群的规模扩张受制于光模块与光互连，而不只是 GPU。

**第三，芯片分工。** 英伟达被报道拟投资 AI 推理 ASIC 初创企业 **d-Matrix**——这是其在“事实收购”Groq 之后，对芯片领域竞争对手的又一次重磅动作。同时在制造侧，分析师认为英伟达光靠台积电不够，**可能使用英特尔封装**。

把这三条串起来，AI 基础设施的约束呈现出清晰的层级：

| 层级 | 本周信号 | 瓶颈性质 |
|---|---|---|
| 芯片 | 英伟达投资 d-Matrix、或用英特尔封装 | 推理专用化、产能分散 |
| 光互连 | Lumentum 订单排至 2029 年，70% 需求无法满足 | 供给刚性、扩产慢 |
| 电力 | 甲骨文用卡车运天然气 | 电网接入周期长 |
| 场地与冷却 | 数据中心持续扩建 | 资本开支与审批 |

**当模型价格下降，行业总支出通常不降反升**——这正是杰文斯悖论的现代版本：单位成本越低，能跑的任务越多、越长、越常驻，最终把节省下来的钱全部还给电力、光学和封装。

## 六、GPT-6 向所有人开放，OpenAI 用“28 天连更”抢注意力

产品侧，OpenAI 本周最实际的动作为 **10 月 7 日把 GPT-6 全球开放给所有 ChatGPT 用户**，并配套推出 Intelligent UI——更快响应、带可视化和可交互体验。同时，OpenAI 立下了**连续更新 28 天**的承诺（并称若无新功能就重置周期）。

其余动作可以按“研究—产品—商业化—安全”四条线看：

- **研究**：10 月 6 日公开一批内部前沿模型在数学开放问题上的新结果，并在 GitHub 提供 Lean 形式化证明与细节（媒体称“一夜甩出 722 篇数学论文”）。
- **产品**：与 Ironclad 合作推进复杂合同工作流的电脑操作能力；与 Atlassian 扩大合作，把前沿模型接入企业知识；ChatGPT 搜索与插件持续向“任务执行”演化。
- **商业化**：10 月 5 日推出新的视觉广告格式并扩展测量与归因工具；面向青少年的 College Planner 等功能上线。
- **安全与合规**：10 月 8 日披露处置了两起使用“假记者”“假智库”的 AI 影响行动；10 月 5 日说明其在欧盟文本溯源规则下的水印方案。

值得留意的是**水印与溯源**这条线：欧盟规则要求对 AI 生成文本做标识，OpenAI 的做法是分层开放——先向研究人员提供检测能力。这与国内平台本周的整治行动指向同一个问题：**当生成内容足够逼真，“这是谁生成的”必须由技术回答，而不是由平台事后删帖回答。**

## 七、Anthropic：一边建“网络使命”，一边改写使用政策

如果说 OpenAI 在抢入口，Anthropic 本周的动作全部围绕“信任与交付”：

**10 月 8 日，Anthropic 启动 Cyber Mission**，承诺长期投入网络防御，首批两个方向：**关键基础设施**（电力、水务、交通的运营技术，以及政府系统）与**开源软件**。具体产品是 Critical Infrastructure Defense Program（CIDP，把前沿模型、驻场工程师和威胁研究带给防御方）与 **OSS Scanner**（为开源项目提供免费安全扫描）。官方坦言：Project Glasswing 虽发现大量漏洞，但“发现漏洞比以往更容易，验证、排序和修复仍然困难”。

**10 月 6 日**，扩展 Cyber Verification Program；**10 月 8 日**，发布 2026 版使用政策，新增“禁止欺骗性宣传与人工活动”章节，并**针对 Claude 被用于自主采取物理动作增加了控制条款**，同时明确健康、金融等高风险场景的要求，政策于 11 月 12 日生效。

**10 月 2 日**，启动 Claude Frontier Academy，投入 **1 亿美元**，目标到 2027 年底培养 **1 万名 Frontier Deployed Engineer（FDE）**，首批学员来自埃森哲、贝恩、凯捷、澳大利亚联邦银行、德勤、麦肯锡、摩根士丹利、诺和诺德等机构，并采用“医学住院医师”式培养路径。

这三件事组合起来指向同一个判断：**企业 AI 落地的瓶颈已经从“模型够不够强”变成“有没有人会用、出了事谁负责”。** 培训 1 万名工程师、给开源项目免费扫描、把“自主物理动作”写进政策——都是在为 Agent 大规模进入生产环境补上组织与制度基础设施。

## 八、Manus 2.0：把 Agent 的效率指标摊开讲

9 月 28 日，恢复独立运营的 Manus 发布 **Manus 2.0**，官方给出的效率数据相当具体：新一代自研 Agent 框架 **Cascade** 在一次测试配置中，**Token 用量减少 23.2%、任务完成时间缩短 28.2%、运行成本降低 32%**。

![](/assets/images/posts/ai-october10-manus2.png)

产品层面有三个变化值得记录：

| 能力 | 说明 |
|---|---|
| Cloud Computer | 可购买的专属云环境，用于需要 7×24 运行的项目（如多人游戏服务器、长期自动化） |
| Automations | 从定时任务升级为**事件触发**：新邮件、广告数据变化、日历事件、Slack 消息、Notion 更新都可启动工作流 |
| Manus Studio | 桌面端升级为人机共享工作区，新增视频编辑器（可手动改时间轴）、Alchemy 模式（视频生成 + 代码生成）、Game Dev |

其中 **Automations 的意义被低估了**：定时任务只是“到点执行”，事件触发才是“有变化就工作”。前者仍然是工具，后者才接近“常驻同事”。而 **Cascade 那三个百分比**同样值得注意——**当模型单价趋同时，Agent 框架的 Token 效率会成为产品差异化的主要来源。** 少用 23.2% 的 Token，等于把模型价格再打八折。

## 九、具身智能：GPT-6 Astra 接上宇树 G1 收拾厨房

本周具身智能也有实质进展：

- 斯坦福团队项目 **HomeBody** 让宇树 G1 先探索一个从未见过的厨房，随后按语言指令收拾物品、丢弃垃圾。**关键点不是“能抓取”，而是“在陌生环境里自主探索后再执行”**——这正是世界模型与长程规划能力的体现。
- 一项关于**触觉**的工作用 **500 小时真实操作数据**把人类双手的“手感”迁移给机器人，任务成功率翻倍。行业此前用数万小时的第一视角人类视频训练机器人，但摄像头拍得下手部轨迹，**拍不到指尖的接触位置与按压力度**——触觉数据的稀缺性正在凸显。
- 国内方面，清华团队的具身模型登顶全球第一，且不依赖外挂模块和额外数据；联想自研代码智能体 TianxiCode 在 SWE-bench-Live 上取得全球第一。

把这三条放在一起，具身智能的瓶颈已经很清楚：**视觉与语言问题基本被大模型解决，真正缺的是触觉数据、真实操作时长，以及“陌生环境下的自主探索”能力。**

## 十、监管与治理：国内集中整治“AI 魔改”，加州想禁“人机格斗赛”

10 月 8 日，微信、抖音、快手等平台同日出台“AI 魔改”相关要求。微信表示，根据国家广播电视总局部署，针对部分账号滥用 AI 工具对经典影视剧、动画片进行颠覆性篡改、“魔性”解构与低俗化改编的问题，进一步加大治理力度，**清理处置千余条违规内容**。

同期，有报道称美国加州试图禁止“人机格斗赛”，并指控已举办的对决赛事非法。

两条新闻的层级不同，但指向同一件事：**AI 生成内容的治理正在从“事后删帖”转向“规则前置”**。海外路径依赖**水印与溯源**（如 OpenAI 在欧盟规则下的方案），国内路径更强调**平台责任与集中整治**。对创作者和企业而言，这意味着同一个内容在不同市场的合规成本将明显分化。

## 十一、附：10 月 2–9 日大事补记

假期期间信息密集，以下为可核验的主要节点：

| 日期 | 事件 | 关键数据 |
|---|---|---|
| 10 月 1 日 | 谷歌发布 Gemini 4 Argon（分阶段开放） | 入门价 $2/$10，DeepSWE v1.1 达 77.9% |
| 10 月 2 日 | Anthropic 启动 Claude Frontier Academy | 投入 1 亿美元，目标 2027 年底培养 1 万名 FDE |
| 10 月 2 日 | OpenAI 发布 GPT-6 家族选型指南 | 面向创业者的模型选择与推理强度调优 |
| 10 月 5 日 | OpenAI 推出 ChatGPT 新广告格式 | 扩展测量、归因与品牌适配工具 |
| 10 月 5 日 | OpenAI 说明欧盟文本溯源方案 | 水印优先向研究人员开放检测 |
| 10 月 6 日 | OpenAI 公开数学开放问题成果 | 提供 Lean 形式化证明与 GitHub 细节 |
| 10 月 6 日 | Anthropic 扩展 Cyber Verification Program | 向合格安全从业者开放高级网络能力 |
| 10 月 7 日 | **Claude Haiku 5.5 发布** | 成本比 Haiku 4.5 低约 75%，OSWorld 2.1 达 72.4% |
| 10 月 7 日 | **GPT-6 向所有 ChatGPT 用户开放** | 配套 Intelligent UI |
| 10 月 8 日 | **Anthropic Cyber Mission 启动** | CIDP + OSS Scanner（开源项目免费扫描） |
| 10 月 8 日 | Anthropic 发布 2026 使用政策更新 | 新增反欺骗章节，11 月 12 日生效 |
| 10 月 8 日 | OpenAI 披露处置 AI“假记者”影响行动 | 两起假前线运营 |
| 10 月 8 日 | 国内平台集中整治“AI 魔改” | 清理处置千余条违规内容 |
| 10 月 9 日 | **Gemini 4 Argon 现身 Google Cloud 等平台** | 向部分 Pro 用户开放 |
| 10 月 9 日 | 马斯克宣布 Grok Bot 外包任务给 Opus 5.5 | 模型互供趋势 |
| 10 月 9 日 | 英伟达拟投资推理 ASIC 企业 d-Matrix | 继 Groq 之后再度出手 |
| 10 月 9 日 | Lumentum 光学组件订单排至 2029 年初 | 部分产品 70% 需求无法满足 |
| 10 月 9 日 | 甲骨文用卡车转运天然气供数据中心 | 犹他州已用一年余 |
| 10 月 9 日 | 微软大改 Windows 11 搜索 | 任务栏变 Agent 启动器 |

此外，媒体报道称 DeepSeek 拟融资超 **800 亿元**人民币并为 IPO 做准备；Manus 完成 **5 亿美元**融资；Anthropic 的 IPO 材料显示**近半收入来自亚马逊与 Google 云渠道**；陶哲轩公开声援抵制 OpenAI，数学界与 AI 巨头的矛盾升级；另有报道称 OpenAI 年化营收达 **500 亿美元**但存在预期差，英伟达股价一度应声下跌。以上数据均来自二手报道，尚未获得相关公司官方确认，引用时应保留余地。

## 十二、总结：价格战打完了上半场，系统战才刚开始

**总结：** 过去一周，AI 行业同时出现了“降价”与“缺货”两个看似矛盾的现象。Gemini 4 Argon 与 GPT-6.1 Sol 把前沿能力定价锚定在 $2/$10、缓存价 5%，Claude Haiku 5.5 把子代理成本压低 75%——**模型本身正在快速商品化**；与此同时，甲骨文用卡车运天然气、Lumentum 订单排到 2029 年、英伟达转向投资推理 ASIC，说明**真正稀缺的东西已经不在模型层**。

这带来三个可操作的判断：

1. **选型指标要换。** 从“每百万 Token 多少钱”换成“每个成功任务的总成本”，把重试次数、子代理分层、缓存命中率一起算进去。
2. **效率即产品。** Manus 把“少用 23.2% Token、成本降 32%”作为核心卖点，说明 Agent 框架的工程效率将直接决定毛利。
3. **治理先于规模。** Anthropic 把“自主物理动作”写进使用政策、谷歌为防御方开放无防护栏模型、国内平台集中整治 AI 魔改——**在 Agent 真正大规模替人行动之前，权限、溯源与责任分配必须先有答案。**

下一阶段的竞争不会发生在排行榜上，而会发生在电力合同、光模块产能、企业培训体系和政策合规这几张桌子上。

---

## 参考链接

- [Google：Introducing Gemini 4 Argon](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/)
- [Anthropic：Introducing Claude Haiku 5.5](https://www.anthropic.com/claude-haiku-5-5)
- [Anthropic：Introducing the Anthropic Cyber Mission](https://www.anthropic.com/news/anthropic-cyber-mission)
- [Anthropic：Claude Frontier Academy: $100M to train 10,000 engineers](https://www.anthropic.com/news/claude-frontier-academy)
- [Anthropic：2026 Usage Policy update](https://www.anthropic.com/news/2026-usage-policy-update)
- [Anthropic：Expanding the Cyber Verification Program](https://www.anthropic.com/news/cyber-verification-program)
- [OpenAI：GPT-6 and Intelligent UI for everyone](https://openai.com/index/gpt-6-for-everyone)
- [OpenAI：Sharing AI progress in mathematics](https://openai.com/index/sharing-ai-progress-in-mathematics)
- [OpenAI：Advancing computer use with Ironclad](https://openai.com/index/advancing-computer-use-with-ironclad)
- [OpenAI：Disrupting AI-enabled “false front” operations](https://openai.com/index/disrupting-ai-enabled-false-front-operations)
- [OpenAI：Our approach to EU text provenance rules](https://openai.com/index/eu-text-provenance)
- [OpenAI：Building advertising for the way people use AI](https://openai.com/index/new-chatgpt-ads-format-and-measurement)
- [OpenAI：Atlassian and OpenAI expand partnership](https://openai.com/index/atlassian-partnership)
- [Manus：Manus 2.0 正式发布](https://manus.im/zh-cn/blog/introducing-manus-2-0)
- [博客园新闻：Opus 5.5 接入一切，OpenAI 遭全硅谷围剿](https://news.cnblogs.com/n/840079/)
- [博客园新闻：最快今日发布！谷歌 Gemini 4 Argon 已对部分用户开放](https://news.cnblogs.com/n/840075/)
- [博客园新闻：应急举措：Oracle 利用卡车转运天然气以满足数据中心能源需求](https://news.cnblogs.com/n/840067/)
- [博客园新闻：AI 数据中心需求爆棚 Lumentum 光学组件订单排至 2029 年](https://news.cnblogs.com/n/840068/)
- [博客园新闻：消息称英伟达拟投资 AI 推理 ASIC 企业 d-Matrix](https://news.cnblogs.com/n/840063/)
- [博客园新闻：微信、抖音、快手同日重拳出击“AI 魔改”](https://news.cnblogs.com/n/840065/)
- [博客园新闻：刚刚，GPT-6 Astra 接上宇树 G1，把厨房收拾了！](https://news.cnblogs.com/n/840069/)
- [博客园新闻：把人类双手的「手感」移植给机器人：500 小时真实操作数据](https://news.cnblogs.com/n/840061/)
- [博客园新闻：加州试图禁止“人机格斗赛”](https://news.cnblogs.com/n/840071/)
- [博客园新闻：OpenAI 年化营收 500 亿美元：存在巨大预期差 英伟达股价应声下跌](https://news.cnblogs.com/n/840051/)
- [博客园新闻：国庆 AI 圈没闲着！DeepSeek 被曝拟融资超 800 亿元，OpenAI 立下连更 28 天承诺](https://news.cnblogs.com/n/840021/)
- [博客园新闻：Manus 5 亿美金破纪录融资](https://news.cnblogs.com/n/840000/)
- [博客园新闻：Anthropic IPO 材料曝光，近半收入来自亚马逊与 Google 云渠道](https://news.cnblogs.com/n/839888/)
- [博客园新闻：陶哲轩公开声援抵制 OpenAI](https://news.cnblogs.com/n/840036/)
- [博客园新闻：微软大改 Windows 11 搜索：任务栏变 Agent 启动器](https://news.cnblogs.com/n/840006/)
- [量子位：联想天禧自研代码智能体 TianxiCode 斩获 SWE-bench-Live 全球第一](https://www.qbitai.com/2026/10/502422.html)
- [量子位：清华具身模型登顶全球第一](https://www.qbitai.com/2026/10/502125.html)
