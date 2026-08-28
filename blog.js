const blogList = document.getElementById("blogList");
const blogPost = document.getElementById("blogPost");
const blogCount = document.getElementById("blogCount");
const blogSidebarCount = document.getElementById("blogSidebarCount");
const blogSearch = document.getElementById("blogSearch");
const blogTagFilter = document.getElementById("blogTagFilter");

const blogApiUrl = "https://api.github.com/repos/xupy6/xupy6.github.io/contents/blogs?ref=main";
const localBlogIndexUrl = "./blogs/index.json";
let loadedPosts = [];
let filteredPosts = [];
let activeTag = "All";
let activePostName = "";

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---")) {
    return { meta: {}, body: markdown };
  }

  const end = markdown.indexOf("\n---", 3);
  if (end < 0) {
    return { meta: {}, body: markdown };
  }

  const rawMeta = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).trim();
  const meta = {};

  rawMeta.split(/\r?\n/).forEach((line) => {
    const [key, ...rest] = line.split(":");
    if (!key || !rest.length) {
      return;
    }
    meta[key.trim()] = rest.join(":").trim().replace(/^["']|["']$/g, "");
  });

  return { meta, body };
}

function renderMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const html = [];
  let inCode = false;
  let codeLines = [];
  let inList = false;

  function closeList() {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  }

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inCode) {
        html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
        codeLines = [];
        inCode = false;
      } else {
        closeList();
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeLines.push(line);
      return;
    }

    if (!line.trim()) {
      closeList();
      return;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeList();
      const level = heading[1].length + 1;
      html.push(`<h${level}>${renderInlineMarkdown(heading[2])}</h${level}>`);
      return;
    }

    const listItem = line.match(/^[-*]\s+(.+)$/);
    if (listItem) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(listItem[1])}</li>`);
      return;
    }

    const quote = line.match(/^>\s+(.+)$/);
    if (quote) {
      closeList();
      html.push(`<blockquote>${renderInlineMarkdown(quote[1])}</blockquote>`);
      return;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  closeList();
  if (inCode) {
    html.push(`<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`);
  }

  return html.join("");
}

function normalizePost(file, markdown) {
  const { meta, body } = parseFrontMatter(markdown);
  const title = meta.title || file.name.replace(/\.md$/i, "").replace(/[-_]/g, " ");
  const date = meta.date || "";
  const tags = (meta.tags || "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    name: file.name,
    title,
    date,
    tags,
    summary: meta.summary || body.replace(/[#>*`\-]/g, "").trim().slice(0, 90),
    body,
  };
}

function renderPostList(posts) {
  filteredPosts = posts;
  blogCount.textContent = `${posts.length} posts`;
  if (blogSidebarCount) {
    blogSidebarCount.textContent = `${loadedPosts.length} posts`;
  }

  if (!posts.length) {
    blogList.innerHTML = `
      <article class="blog-card">
        <span>Empty</span>
        <h2>没有匹配的笔记</h2>
        <p>换一个关键词或标签试试。</p>
      </article>
    `;
    return;
  }

  blogList.innerHTML = posts
    .map(
      (post, index) => `
        <button class="blog-card ${post.name === activePostName ? "active" : ""}" type="button" data-name="${escapeHtml(post.name)}">
          <span>${escapeHtml(formatPostDate(post.date) || "Note")}</span>
          <h2>${escapeHtml(post.title)}</h2>
          <p>${escapeHtml(post.summary)}</p>
          <div class="blog-card-tags">
            ${post.tags.slice(0, 3).map((tag) => `<i>${escapeHtml(tag)}</i>`).join("")}
          </div>
        </button>
      `,
    )
    .join("");

  blogList.querySelectorAll(".blog-card").forEach((card) => {
    card.addEventListener("click", () => openPostByName(card.dataset.name));
  });
}

function renderTagFilters(posts) {
  if (!blogTagFilter) {
    return;
  }

  const tags = ["All", ...Array.from(new Set(posts.flatMap((post) => post.tags))).sort((a, b) => a.localeCompare(b))];
  blogTagFilter.innerHTML = tags
    .map(
      (tag) => `
        <button class="${tag === activeTag ? "active" : ""}" type="button" data-tag="${escapeHtml(tag)}">
          ${escapeHtml(tag)}
        </button>
      `,
    )
    .join("");

  blogTagFilter.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeTag = button.dataset.tag || "All";
      applyFilters();
    });
  });
}

function applyFilters() {
  const query = (blogSearch?.value || "").trim().toLowerCase();
  const posts = loadedPosts.filter((post) => {
    const tagMatched = activeTag === "All" || post.tags.includes(activeTag);
    const haystack = [post.title, post.summary, post.date, post.tags.join(" "), post.body].join(" ").toLowerCase();
    return tagMatched && (!query || haystack.includes(query));
  });

  renderTagFilters(loadedPosts);
  renderPostList(posts);
}

function openPostByName(name) {
  const index = loadedPosts.findIndex((post) => post.name === name);
  openPost(index >= 0 ? index : 0);
}

function openPost(index) {
  const post = loadedPosts[index];
  if (!post) {
    return;
  }

  activePostName = post.name;
  blogList.querySelectorAll(".blog-card").forEach((card, cardIndex) => {
    card.classList.toggle("active", filteredPosts[cardIndex]?.name === post.name);
  });

  blogPost.innerHTML = `
    <header class="blog-post-head">
      <button class="blog-back" type="button">文章列表</button>
      <p class="eyebrow">${escapeHtml(formatPostDate(post.date) || "Blog")}</p>
      <h1>${escapeHtml(post.title)}</h1>
      <div class="blog-tags">
        ${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
      </div>
    </header>
    <div class="blog-content">${renderMarkdown(post.body)}</div>
  `;

  blogPost.querySelector(".blog-back")?.addEventListener("click", () => {
    document.querySelector(".blog-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  const url = new URL(window.location.href);
  url.searchParams.set("post", post.name);
  window.history.replaceState({}, "", url);
}

async function fetchMarkdown(file) {
  const source = file.download_url || file.path;
  const response = await fetch(source, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${file.name}`);
  }
  return response.text();
}

async function loadPostsFromIndex() {
  const response = await fetch(localBlogIndexUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Local blog index unavailable");
  }

  const files = await response.json();
  const posts = await Promise.all(
    files.map(async (file) => normalizePost(file, await fetchMarkdown(file))),
  );

  return posts.sort((a, b) => (b.date || b.name).localeCompare(a.date || a.name));
}

async function loadPostsFromGithubApi() {
  const response = await fetch(blogApiUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("GitHub API unavailable");
  }

  const files = (await response.json())
      .filter((file) => file.type === "file" && /\.md$/i.test(file.name) && file.name.toLowerCase() !== "readme.md")
      .sort((a, b) => b.name.localeCompare(a.name));

  const posts = await Promise.all(
    files.map(async (file) => normalizePost(file, await fetchMarkdown(file))),
  );

  return posts.sort((a, b) => (b.date || b.name).localeCompare(a.date || a.name));
}

async function loadBlogPosts() {
  try {
    try {
      loadedPosts = await loadPostsFromIndex();
    } catch {
      loadedPosts = await loadPostsFromGithubApi();
    }

    renderTagFilters(loadedPosts);
    renderPostList(loadedPosts);

    blogSearch?.addEventListener("input", applyFilters);

    const selected = new URLSearchParams(window.location.search).get("post");
    const selectedIndex = Math.max(0, loadedPosts.findIndex((post) => post.name === selected));
    if (loadedPosts.length) {
      openPost(selectedIndex);
    }
  } catch (error) {
    blogCount.textContent = "Offline";
    if (blogSidebarCount) {
      blogSidebarCount.textContent = "Offline";
    }
    blogList.innerHTML = `
      <article class="blog-card">
        <span>Unavailable</span>
        <h2>暂时没有读取到博客</h2>
        <p>确认仓库里存在 blogs/*.md 文件，并且 GitHub Pages 已完成同步。错误：${escapeHtml(error.message)}</p>
      </article>
    `;
  }
}

function formatPostDate(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString("en", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

loadBlogPosts();
