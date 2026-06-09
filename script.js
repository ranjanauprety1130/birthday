const TAU = Math.PI * 2;

function buildLily(lily, index) {
  const petalCount = 6;
  const phase = index * 0.17;

  for (let i = 0; i < petalCount; i += 1) {
    const petal = document.createElement("span");
    const angle = (TAU * i) / petalCount + phase;
    const degrees = (angle * 180) / Math.PI;
    const spread = 0.88 + 0.08 * Math.sin(angle * 3);

    petal.className = "petal";
    petal.style.transform = `translate(-50%, -100%) rotate(${degrees}deg) scaleY(${spread})`;
    petal.style.zIndex = String(i % 2);
    lily.appendChild(petal);
  }

  const center = document.createElement("span");
  center.className = "lily-center";
  lily.appendChild(center);
}

document.querySelectorAll("[data-lily]").forEach(buildLily);

const field = document.querySelector("#petalField");
const petalCount = window.innerWidth < 700 ? 12 : 22;

for (let i = 0; i < petalCount; i += 1) {
  const petal = document.createElement("span");
  const goldenAngle = 137.508;
  const position = (i * goldenAngle) % 100;
  const oscillation = Math.sin(i * 1.7);

  petal.className = "falling-petal";
  petal.style.setProperty("--left", `${position}%`);
  petal.style.setProperty("--size", `${7 + (i % 5) * 2}px`);
  petal.style.setProperty("--duration", `${11 + (i % 7) * 1.4}s`);
  petal.style.setProperty("--delay", `${-i * 1.8}s`);
  petal.style.setProperty("--drift", `${oscillation * 150}px`);
  petal.style.setProperty("--spin", `${260 + i * 37}deg`);
  field.appendChild(petal);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 },
);

document.querySelectorAll(".reveal").forEach((element) => {
  revealObserver.observe(element);
});

function createBurst(originX, originY, amount = 40) {
  for (let i = 0; i < amount; i += 1) {
    const particle = document.createElement("span");
    const angle = (TAU * i) / amount + Math.random() * 0.35;
    const distance = 90 + Math.random() * 230;
    const colors = ["#ffffff", "#f4a5b8", "#d9aa56", "#d52047"];

    particle.className = "burst";
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.background = colors[i % colors.length];
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    particle.style.animationDelay = `${Math.random() * 100}ms`;
    document.body.appendChild(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

const celebrateButton = document.querySelector("#celebrateButton");

celebrateButton.addEventListener("click", () => {
  const rect = celebrateButton.getBoundingClientRect();
  createBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 48);
  document.querySelector("#birthday-wish").scrollIntoView({ behavior: "smooth" });
});

const timelineTrack = document.querySelector("#timelineTrack");
const timelinePrevious = document.querySelector("#timelinePrevious");
const timelineNext = document.querySelector("#timelineNext");
const timelineProgress = document.querySelector("#timelineProgress");
const timelineCards = [...timelineTrack.querySelectorAll(".timeline-card")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

timelineCards.forEach((card) => {
  const clone = card.cloneNode(true);
  clone.setAttribute("aria-hidden", "true");
  clone.querySelectorAll("img").forEach((image) => {
    image.alt = "";
  });
  timelineTrack.appendChild(clone);
});

let timelinePosition = timelineTrack.scrollLeft;
let timelineInteracting = false;
let timelinePauseUntil = 0;

function timelineStep() {
  const card = timelineTrack.querySelector(".timeline-card");
  const gap = Number.parseFloat(getComputedStyle(timelineTrack).columnGap) || 0;
  return card.getBoundingClientRect().width + gap;
}

function timelineCycleWidth() {
  return timelineCards.length * timelineStep();
}

function updateTimelineProgress() {
  const cycleWidth = timelineCycleWidth();
  const progress = cycleWidth > 0 ? (timelineTrack.scrollLeft % cycleWidth) / cycleWidth : 0;
  const visibleShare = timelineTrack.clientWidth / cycleWidth;
  const scale = Math.min(1, visibleShare + progress * (1 - visibleShare));
  timelineProgress.style.transform = `scaleX(${scale})`;
}

function temporarilyPauseTimeline() {
  timelinePauseUntil = Date.now() + 1400;
}

function timelineShouldPause() {
  return (
    reduceMotion.matches ||
    document.hidden ||
    timelineInteracting ||
    timelineTrack.matches(":hover") ||
    timelineTrack.matches(":focus-within") ||
    Date.now() < timelinePauseUntil
  );
}

function advanceTimeline() {
  if (!timelineShouldPause()) {
    timelinePosition += 1;
    const cycleWidth = timelineCycleWidth();

    if (timelinePosition >= cycleWidth) {
      timelinePosition -= cycleWidth;
    }

    timelineTrack.scrollLeft = timelinePosition;
  }
}

timelinePrevious.addEventListener("click", () => {
  temporarilyPauseTimeline();
  timelineTrack.scrollBy({ left: -timelineStep(), behavior: "smooth" });
});

timelineNext.addEventListener("click", () => {
  temporarilyPauseTimeline();
  timelineTrack.scrollBy({ left: timelineStep(), behavior: "smooth" });
});

timelineTrack.addEventListener("pointerdown", () => {
  timelineInteracting = true;
});
timelineTrack.addEventListener("pointerup", () => {
  timelineInteracting = false;
});
timelineTrack.addEventListener("pointercancel", () => {
  timelineInteracting = false;
});
timelineTrack.addEventListener(
  "scroll",
  () => {
    if (
      timelineInteracting ||
      timelineTrack.matches(":hover") ||
      timelineTrack.matches(":focus-within") ||
      Date.now() < timelinePauseUntil
    ) {
      timelinePosition = timelineTrack.scrollLeft;
    }
    updateTimelineProgress();
  },
  { passive: true },
);
window.addEventListener("resize", updateTimelineProgress);
updateTimelineProgress();
window.setInterval(advanceTimeline, 28);

const journeyVideos = document.querySelectorAll(".journey-video-frame video");
const videoObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const video = entry.target;

      if (entry.isIntersecting) {
        video.play().catch(() => {
          // Controls remain available if a browser declines autoplay.
        });
      } else {
        video.pause();
      }
    });
  },
  { threshold: 0.45 },
);

journeyVideos.forEach((video) => {
  video.muted = true;
  videoObserver.observe(video);
});

const cakeButton = document.querySelector("#cakeButton");
const cakeHint = document.querySelector("#cakeHint");
const wishOverlay = document.querySelector("#wishOverlay");

cakeButton.addEventListener("click", () => {
  if (cakeButton.classList.contains("is-blown")) return;

  cakeButton.classList.add("is-blown");
  cakeHint.textContent = "Your wish has been made";

  const rect = cakeButton.getBoundingClientRect();
  createBurst(rect.left + rect.width / 2, rect.top + 60, 72);

  window.setTimeout(() => {
    wishOverlay.classList.add("is-visible");
    wishOverlay.setAttribute("aria-hidden", "false");
  }, 650);

  window.setTimeout(() => {
    wishOverlay.classList.remove("is-visible");
    wishOverlay.setAttribute("aria-hidden", "true");
  }, 3600);
});
