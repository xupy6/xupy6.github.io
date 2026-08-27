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

const musicBox = document.getElementById("musicBox");
const toggleMusic = document.getElementById("toggleMusic");
const playIcon = document.getElementById("playIcon");
const prevTrack = document.getElementById("prevTrack");
const nextTrack = document.getElementById("nextTrack");
const musicProgress = document.getElementById("musicProgress");
const musicTitle = document.getElementById("musicTitle");
const musicDisc = document.getElementById("musicDisc");
const audio = new Audio();

let tracks = [];
let trackIndex = 0;
let isSeeking = false;

audio.preload = "metadata";

function updateMusicUi() {
  const track = tracks[trackIndex];
  musicTitle.textContent = track?.title ?? "Music";
  playIcon.textContent = audio.paused ? "▶" : "Ⅱ";
  toggleMusic.setAttribute("aria-label", audio.paused ? "播放" : "暂停");
  musicBox.classList.toggle("music-box-playing", !audio.paused);
  musicBox.classList.toggle("music-box-disabled", !tracks.length);
  musicDisc.classList.toggle("music-box-disc-active", !audio.paused);
}

function loadTrack(shouldPlay = false) {
  const track = tracks[trackIndex];
  if (!track) {
    updateMusicUi();
    return;
  }

  audio.src = track.src;
  audio.load();
  musicProgress.value = 0;
  updateMusicUi();

  if (shouldPlay) {
    audio.play().catch(updateMusicUi);
  }
}

function switchTrack(nextIndex) {
  if (!tracks.length) {
    return;
  }

  const shouldPlay = !audio.paused;
  trackIndex = (nextIndex + tracks.length) % tracks.length;
  loadTrack(shouldPlay);
}

async function loadPlaylist() {
  try {
    const response = await fetch("./music/tracks.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Playlist unavailable");
    }
    tracks = await response.json();
    trackIndex = 0;
    loadTrack(false);
  } catch {
    tracks = [];
    updateMusicUi();
  }
}

toggleMusic?.addEventListener("click", () => {
  if (!tracks.length) {
    return;
  }

  if (audio.paused) {
    audio.play().catch(updateMusicUi);
    return;
  }

  audio.pause();
});

prevTrack?.addEventListener("click", () => switchTrack(trackIndex - 1));
nextTrack?.addEventListener("click", () => switchTrack(trackIndex + 1));

musicProgress?.addEventListener("input", () => {
  isSeeking = true;
});

musicProgress?.addEventListener("change", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(musicProgress.value) / 100) * audio.duration;
  }
  isSeeking = false;
});

audio.addEventListener("play", updateMusicUi);
audio.addEventListener("pause", updateMusicUi);
audio.addEventListener("ended", () => switchTrack(trackIndex + 1));
audio.addEventListener("loadedmetadata", () => {
  musicProgress.value = 0;
  updateMusicUi();
});
audio.addEventListener("timeupdate", () => {
  if (isSeeking || !Number.isFinite(audio.duration) || audio.duration <= 0) {
    return;
  }

  musicProgress.value = Math.round((audio.currentTime / audio.duration) * 100);
});
audio.addEventListener("error", () => {
  musicTitle.textContent = "Audio unavailable";
  updateMusicUi();
});

loadPlaylist();
