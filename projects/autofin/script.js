const knowledge = [
  {
    title: "函数与导数",
    points: ["函数概念与性质", "指数函数与对数函数", "导数及其应用", "单调性与极值"],
  },
  {
    title: "几何与向量",
    points: ["平面向量", "空间向量", "直线与圆", "圆锥曲线"],
  },
  {
    title: "概率与统计",
    points: ["古典概型", "条件概率", "随机变量", "统计推断"],
  },
];

const agents = [
  ["课程导航 Agent", "定位知识路径、前置知识和后续关联。"],
  ["知识讲解 Agent", "按照概念、公式、例题、易错点生成讲解。"],
  ["解题诊断 Agent", "拆题、识别题型、输出规范步骤。"],
  ["举一反三 Agent", "生成基础题、变式题和综合提升题。"],
  ["错题本 Agent", "整理错因、订正步骤和复习提醒。"],
  ["RAG 知识库 Agent", "后续负责教材、讲义、试卷召回与引用。"],
];

const answerTemplate = `
<h3>兜底讲解</h3>
<p>先看题目属于哪个知识点，再找它需要的核心定义或公式。比如导数题一般要先确认定义域，再求导，最后用导数符号判断单调区间。</p>
<p><strong>解题步骤：</strong>1. 标出已知条件；2. 写出目标；3. 套用对应知识点；4. 检查端点、定义域和特殊情况。</p>
<p><strong>易错提醒：</strong>不要跳过定义域，也不要把“导数为正”直接套到不连续区间上。</p>
`;

function renderCards() {
  document.getElementById("knowledgeGrid").innerHTML = knowledge
    .map(
      (item) => `
        <article class="knowledge-card">
          <h3>${item.title}</h3>
          <ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");

  document.getElementById("agentGrid").innerHTML = agents
    .map(
      ([title, copy]) => `
        <article class="agent-card">
          <h3>${title}</h3>
          <p>${copy}</p>
        </article>
      `,
    )
    .join("");
}

function bindNavigation() {
  document.querySelectorAll("[data-target]").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav button").forEach((button) => {
        button.classList.toggle("active", button.dataset.target === item.dataset.target);
      });
      document.getElementById(item.dataset.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function bindDemo() {
  const input = document.getElementById("questionInput");
  const answer = document.getElementById("answerBox");

  document.getElementById("sampleBtn").addEventListener("click", () => {
    input.value = "为什么导数大于 0 可以判断函数递增？";
    input.focus();
  });

  document.getElementById("answerBtn").addEventListener("click", () => {
    answer.innerHTML = answerTemplate;
  });
}

function drawMathCanvas() {
  const canvas = document.getElementById("mathCanvas");
  const context = canvas.getContext("2d");
  let frame = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw() {
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    context.clearRect(0, 0, width, height);
    context.strokeStyle = "rgba(47, 131, 216, 0.16)";
    context.lineWidth = 1;

    for (let x = 40; x < width; x += 44) {
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }

    for (let y = 40; y < height; y += 44) {
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    context.strokeStyle = "#4d93d1";
    context.lineWidth = 4;
    context.beginPath();
    for (let x = 0; x < width; x += 4) {
      const y = height * 0.54 - Math.sin((x + frame) * 0.018) * 62 - Math.cos((x - frame) * 0.009) * 22;
      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.stroke();

    context.fillStyle = "#52a47b";
    for (let index = 0; index < 8; index += 1) {
      const x = 80 + (index * (width - 160)) / 7;
      const y = height * 0.54 - Math.sin((x + frame) * 0.018) * 62 - Math.cos((x - frame) * 0.009) * 22;
      context.beginPath();
      context.arc(x, y, 5, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "rgba(17, 24, 39, 0.72)";
    context.font = "700 24px Consolas, monospace";
    context.fillText("y = f(x)", 38, 56);
    context.fillText("∫  P(A|B)  Σ  lim", 38, 92);

    frame += 1.5;
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener("resize", resize);
  draw();
}

renderCards();
bindNavigation();
bindDemo();
drawMathCanvas();
