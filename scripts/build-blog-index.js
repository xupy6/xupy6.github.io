const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const blogDir = path.join(root, "blogs");
const outputPath = path.join(blogDir, "index.json");

function parseFrontMatter(markdown) {
  if (!markdown.startsWith("---")) {
    return {};
  }

  const end = markdown.indexOf("\n---", 3);
  if (end < 0) {
    return {};
  }

  return markdown
    .slice(3, end)
    .trim()
    .split(/\r?\n/)
    .reduce((meta, line) => {
      const [key, ...rest] = line.split(":");
      if (!key || !rest.length) {
        return meta;
      }
      meta[key.trim()] = rest.join(":").trim().replace(/^["']|["']$/g, "");
      return meta;
    }, {});
}

function stripFrontMatter(markdown) {
  if (!markdown.startsWith("---")) {
    return markdown;
  }

  const end = markdown.indexOf("\n---", 3);
  return end >= 0 ? markdown.slice(end + 4).trim() : markdown;
}

function makeSummary(markdown) {
  return stripFrontMatter(markdown)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[#>*`\-[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

const posts = fs
  .readdirSync(blogDir)
  .filter((name) => /\.md$/i.test(name) && name.toLowerCase() !== "readme.md")
  .sort((a, b) => b.localeCompare(a))
  .map((name) => {
    const fullPath = path.join(blogDir, name);
    const markdown = fs.readFileSync(fullPath, "utf8");
    const meta = parseFrontMatter(markdown);

    return {
      name,
      path: `./blogs/${name}`,
      title: meta.title || name.replace(/\.md$/i, "").replace(/[-_]/g, " "),
      date: meta.date || "",
      summary: meta.summary || makeSummary(markdown),
      tags: meta.tags || "",
    };
  })
  .sort((a, b) => (b.date || b.name).localeCompare(a.date || a.name));

fs.writeFileSync(outputPath, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
console.log(`Generated ${path.relative(root, outputPath)} with ${posts.length} post(s).`);
