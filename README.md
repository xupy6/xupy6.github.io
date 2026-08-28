# xupy6.github.io

xupy6 的 GitHub Pages 个人主页。

访问地址：

- https://xupy6.github.io/

## 维护方式

这是一个纯静态站点，不依赖 Node、Vite 或构建流程。修改以下文件后直接提交并推送即可自动更新：

- `index.html`：页面内容
- `styles.css`：视觉样式
- `script.js`：导航高亮等轻量交互
- `blog.html` / `blog.js`：博客页面与 Markdown 渲染
- `blogs/*.md`：博客文章
- `projects/autofin/`：从 GitHub 仓库 `xupy6/AutoFin` 的 Flask 前端模板同步出的静态托管副本
- `projects/relation-slice/`：Relation Slice 前端构建产物

## 发布

仓库名为 `xupy6.github.io`，GitHub Pages 会把默认分支根目录发布为个人站点。

## 写博客

在 `blogs/` 目录中新建 Markdown 文件，例如 `2026-08-28-agent-note.md`，提交并推送后访问：

- https://xupy6.github.io/blog.html

博客页面会自动读取 GitHub 仓库中的 `blogs/*.md` 文件，不需要手动维护文章列表。

## 项目预览

- AutoFin：https://xupy6.github.io/projects/autofin/
- Relation Slice：https://xupy6.github.io/projects/relation-slice/

GitHub Pages 只能托管静态前端。Relation Slice 的真实上传分析、赛博克隆、DeepSeek 调用，以及 AutoFin 的 Socket.IO / Flask API 功能，仍需要分别启动对应项目的后端服务。
