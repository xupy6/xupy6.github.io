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

## 发布

仓库名为 `xupy6.github.io`，GitHub Pages 会把默认分支根目录发布为个人站点。

## 写博客

在 `blogs/` 目录中新建 Markdown 文件，例如 `2026-08-28-agent-note.md`，提交并推送后访问：

- https://xupy6.github.io/blog.html

博客页面会自动读取 GitHub 仓库中的 `blogs/*.md` 文件，不需要手动维护文章列表。
