const nav = document.querySelector(".nav");
const navLiquid = document.querySelector(".nav-liquid");
const navLinks = Array.from(document.querySelectorAll(".nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

let activeIndex = 0;

function moveNavLiquid(index) {
  const target = navLinks[index];
  if (!nav || !navLiquid || !target) {
    return;
  }

  const navRect = nav.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  navLiquid.style.transform = `translateX(${targetRect.left - navRect.left - 5}px)`;
}

const activateLink = () => {
  const current = sections.findLast((section) => section.getBoundingClientRect().top < 180);
  const nextIndex = Math.max(
    0,
    navLinks.findIndex((link) => current && link.getAttribute("href") === `#${current.id}`),
  );
  activeIndex = nextIndex;
  navLinks.forEach((link, index) => link.classList.toggle("active", index === activeIndex));
  moveNavLiquid(activeIndex);
};

navLinks.forEach((link, index) => {
  link.addEventListener("mouseenter", () => moveNavLiquid(index));
  link.addEventListener("focus", () => moveNavLiquid(index));
});

nav?.addEventListener("mouseleave", () => moveNavLiquid(activeIndex));
window.addEventListener("scroll", activateLink, { passive: true });
window.addEventListener("resize", () => moveNavLiquid(activeIndex), { passive: true });
activateLink();
