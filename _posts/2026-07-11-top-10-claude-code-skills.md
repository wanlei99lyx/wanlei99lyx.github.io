---
layout: post
title: "2026 年最值得装的 10 个 Claude Code Skill — 实测推荐"
date: 2026-07-11 14:00:00 +0800
pinned: true
categories: [AI, 开发工具]
tags: [Claude Code, Skill, 效率提升, AI编程, 工具推荐]
---

2026 年，GitHub 上已经有超过 **1400 个 Claude Code Skill**。但数量多不代表都好用——大部分装了就没再碰过。

我筛选了社区公认最实用、实际干活高频用到的 10 个 Skill，按场景分类，附安装方式和真实使用感受。

> **TL;DR**：先装 Superpowers 和 Anthropic 官方 Skill，然后按需补充。不要装超过 15 个。

![](/assets/images/posts/skills-tools.jpg)

## 第一梯队：必装（装了就删不掉）

### 1. Superpowers — 工程方法论全集

- **Stars**：243K+
- **安装**：`npx skills add obra/superpowers`
- **实测**：最值得装的 Skill，没有之一。

它是一个 Skill **合集**——包含 TDD、Systematic Debugging、Brainstorming、Parallel Agents、Code Review、Git Worktrees 等十几个子 Skill。不是教你怎么写代码，而是教 Claude 怎么 **按规范工作**。

印象最深的是 TDD 子 Skill——它真的会坚持让你先写测试再写代码，如果你先写了代码，它会要求你删掉重来。一开始觉得烦，但习惯后发现代码质量确实提升了。

### 2. Frontend Design — 告别"AI 感"UI

- **安装量**：277K+
- **安装**：`npx skills add anthropics/skills@frontend-design`
- **实测**：如果你让 Claude 写前端页面，这个必装。

默认情况下 Claude 写出来的 UI 有很明显的"AI 感"——圆角过大、配色千篇一律、排版套路化。这个 Skill 强制 Claude 走 OKLCH 色彩体系、关注对比度、拒绝模板化设计，输出效果提升很明显。

这个博客的暗色科技风主题就是这个 Skill 辅助设计的。

### 3. Skill Creator — 造 Skill 的 Skill

- **Stars**：157K+
- **安装**：`npx skills add anthropics/skills@skill-creator`
- **实测**：把工作流写成 Skill，是 Claude Code 效率翻倍的关键。

用自然语言描述你想要的工作流，它能自动生成结构完整的 SKILL.md，包含名称、描述、触发条件、操作步骤。写完还能跑测试用例验证效果。

我把自己写博客的流程写成了一个 Skill，现在只需要说"帮我写一篇关于 XXX 的文章"，从调研到配图到部署全自动完成。

## 第二梯队：干活利器

### 4. GSD（Get Shit Done）— 规范驱动的上下文工程

- **Stars**：64K+
- **安装**：`npx skills add gsd-build/gsd`

适合复杂任务。它会把大任务拆解为多个子任务，每个子任务启动独立的 Claude 会话，避免上下文污染。一个会话干一件事，干完就关，质量不会随着上下文增长而下降。

### 5. Systematic Debugging — 结构化调试

- **安装**：随 Superpowers 自带

四阶段调试法：**Observe → Hypothesize → Test → Fix**。遇到 Bug 时 Claude 不会再"猜一下改一下"，而是先收集证据、提出假设、验证、再修复。对于诡异的线上 Bug，这个流程能大幅缩短排查时间。

### 6. Code Review — 代码审查

- **安装**：Claude Code 内置，输入 `/review` 即可

审查代码时它会检查：逻辑正确性、边界条件、安全漏洞、性能问题。免费、不需要配 CI，在提交前跑一遍能拦住大部分低级错误。

在 `.git/hooks/pre-commit` 里配一个，每次提交前自动审查，效果很好。

![](/assets/images/posts/skills-code.jpg)

## 第三梯队：特定场景

### 7. webapp-testing — 浏览器端到端测试

- **安装**：`npx skills add anthropics/skills@webapp-testing`

基于 Playwright 的浏览器 QA 工具。能自动截图、填写表单、检查控制台报错。Anthropic 内部使用数据表明，这个 Skill 是所有 Skill 中"可测量影响"最高的——因为它直接发现了真实 Bug。

### 8. gstack — 全团队流程模拟

- **Stars**：118K+
- **安装**：`npx skills add garrytan/gstack`

YC 创始人 Garry Tan 出品。包含 23 个工具，模拟 CEO、设计师、工程经理、QA 等角色。适合独立开发者用来"一人抵一个团队"——写代码前让"设计师"评审 UI，完工后让"QA"检查质量。

### 9. brand-guidelines — 品牌一致性

- **安装**：`npx skills add anthropics/skills@brand-guidelines`

告诉 Claude 你的品牌色、字体、语气风格，之后所有输出都会保持一致。团队协作或维护开源项目时尤其有用。

### 10. PDF/DOCX/PPTX — 办公文档处理

- **安装**：`npx skills add anthropics/skills@pdf`

能在 Claude 里直接生成和操作 Office 文档——写周报生成 Word、数据分析导出 Excel、汇报整理成 PPT。对于经常要出文档的开发者来说，这个 Skill 省掉了很多手工调整格式的时间。

## 避坑指南

```
⚠️ 别装超过 15 个 → 上下文窗口有限，多余的会被丢弃
⚠️ 别装重复功能 → 3 个代码审查 Skill=互相打架
⚠️ 优先官方出品 → anthropics/skills 的 17 个质量最稳定
⚠️ 定期清理 → 一周没用过的，卸了也不可惜
⚠️ 自定义才是王道 → 把你团队的工作流写成 Skill，比 10 个通用 Skill 都值
```

## 安装命令汇总

```bash
# 必装
npx skills add obra/superpowers
npx skills add anthropics/skills@frontend-design
npx skills add anthropics/skills@skill-creator

# 干活
npx skills add gsd-build/gsd
npx skills add anthropics/skills@webapp-testing
npx skills add garrytan/gstack

# 文档
npx skills add anthropics/skills@pdf
npx skills add anthropics/skills@brand-guidelines
```

## 最后

Skill 的价值不在于数量，而在于**你是否真的在用**。我见过装了 50 个 Skill 但实际只用到 3 个的人，也见过只写了一个自定义 Skill 但效率翻倍的。

**先装 Superpowers + 官方三件套，用熟了再按需添加。** 这是目前社区公认的最佳策略。
