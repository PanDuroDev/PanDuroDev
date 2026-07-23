const header = document.querySelector("header");

const slideOrder = ["about-me", "my-skills", "current-projects", "contact"];

const sections = {
  "home": document.getElementById("about-me"),
  "about-me": document.getElementById("about-me"),
  "my-skills": document.getElementById("my-skills"),
  "current-projects": document.getElementById("current-projects"),
  "contact": document.querySelector(".contact-section"),
};

/* ── Mobile slide nav ── */

const slideDots = document.getElementById("slide-dots");
const slidePrev = document.getElementById("slide-prev");
const slideNext = document.getElementById("slide-next");

let currentSlideIdx = 0;

const updateDots = (id) => {
  currentSlideIdx = slideOrder.indexOf(id);
  if (currentSlideIdx < 0) currentSlideIdx = 0;
  document.querySelectorAll(".slide-dot").forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlideIdx);
  });
};

slideOrder.forEach((id) => {
  const dot = document.createElement("button");
  dot.className = "slide-dot";
  dot.setAttribute("aria-label", `Go to ${id}`);
  dot.addEventListener("click", () => switchSlide("#" + id));
  slideDots.appendChild(dot);
});

slidePrev.addEventListener("click", () => {
  const prev = (currentSlideIdx - 1 + slideOrder.length) % slideOrder.length;
  switchSlide("#" + slideOrder[prev]);
});

slideNext.addEventListener("click", () => {
  const next = (currentSlideIdx + 1) % slideOrder.length;
  switchSlide("#" + slideOrder[next]);
});

const switchSlide = (hash) => {
  const id = hash.replace("#", "");
  const target = sections[id];
  if (!target) return;
  document.querySelectorAll(".about-me, .my-skills, .current-projects, .contact-section")
    .forEach(s => s.classList.remove("active-slide"));
  target.classList.add("active-slide");
  history.replaceState(null, "", hash);
  updateDots(id);
};

/* ── Nav links (desktop) ── */

document.querySelectorAll("header > nav a").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    switchSlide(link.getAttribute("href"));
  });
});

/* ── Mobile drawer ── */

const menuToggle = document.getElementById("menu-toggle");

document.querySelectorAll('.nav-body a[href^="#"]').forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    menuToggle.checked = false;
    document.body.style.overflow = "";
    switchSlide(link.getAttribute("href"));
  });
});

menuToggle.addEventListener("change", () => {
  document.body.style.overflow = menuToggle.checked ? "hidden" : "";
});

window.addEventListener("hashchange", () => switchSlide(location.hash));
switchSlide(location.hash || "#home");

const audio = document.getElementById("bg-music");
const btn = document.getElementById("music-toggle");
const btnVideo = btn?.querySelector("video");
const aboutVideo = document.querySelector(".about-video");

audio.volume = 0.04;

const syncAllVideos = (t) => {
  if (btnVideo) btnVideo.currentTime = t;
};

const play = () => {
  const t = audio.currentTime;
  if (btnVideo) { btnVideo.currentTime = t; btnVideo.play().catch(() => {}); }
  audio.play().catch(() => {});
  btn.classList.remove("muted");
  btn.querySelector("i").className = "fa-solid fa-volume-high";
  btn.title = "إيقاف الموسيقى";
};
const pause = () => {
  audio.pause();
  btnVideo?.pause();
  btn.classList.add("muted");
  btn.querySelector("i").className = "fa-solid fa-volume-xmark";
  btn.title = "تشغيل الموسيقى";
};

const tryAutoplay = () => {
  audio.play().then(() => {
    const t = audio.currentTime;
    if (btnVideo) { btnVideo.currentTime = t; btnVideo.play().catch(() => {}); }
    btn.classList.remove("muted");
    btn.querySelector("i").className = "fa-solid fa-volume-high";
  }).catch(() => {
    btn.classList.add("muted");
    btn.querySelector("i").className = "fa-solid fa-volume-xmark";
  });
};
tryAutoplay();
document.addEventListener("click", tryAutoplay, { once: true });

const overlay = document.getElementById("video-overlay");
const overlayVideo = overlay?.querySelector("video");
if (overlayVideo) overlayVideo.volume = 0.3;
const closeBtn = document.getElementById("video-close");

const syncVideos = () => {
  if (audio.paused || overlay.classList.contains("open")) return;
  const t = audio.currentTime;
  if (btnVideo && Math.abs(btnVideo.currentTime - t) > 0.3) btnVideo.currentTime = t;
};
audio.addEventListener("timeupdate", syncVideos);
audio.addEventListener("seeked", () => syncAllVideos(audio.currentTime));

let pressTimer = null;
const LONG_PRESS = 400;

const startPress = (e) => {
  e.preventDefault();
  pressTimer = setTimeout(() => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    btnVideo?.pause();
    if (overlayVideo) {
      const sync = () => { overlayVideo.currentTime = audio.currentTime; };
      if (overlayVideo.readyState >= 1) sync();
      else overlayVideo.addEventListener("loadedmetadata", sync, { once: true });
    }
    overlayVideo?.play().then(() => {
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      bigPlay?.classList.add("hidden");
    }).catch(() => {
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      bigPlay?.classList.remove("hidden");
    });
    controls?.classList.remove("hidden");
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => controls?.classList.add("hidden"), HIDE_DELAY);
    if (!audio.paused) {
      audio.pause();
      overlay.dataset.wasPlaying = "true";
    } else {
      overlay.dataset.wasPlaying = "";
    }
  }, LONG_PRESS);
};
const endPress = () => {
  if (pressTimer) {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (!overlay.classList.contains("open")) {
      if (audio.paused) play();
      else pause();
    }
  }
};

btn.addEventListener("mousedown", startPress);
btn.addEventListener("mouseup", endPress);
btn.addEventListener("mouseleave", endPress);
btn.addEventListener("touchstart", startPress, { passive: false });
btn.addEventListener("touchend", endPress);
btn.addEventListener("touchcancel", endPress);

const closeOverlay = () => {
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  overlayVideo?.pause();
  if (overlayVideo) {
    const t = overlayVideo.currentTime;
    audio.currentTime = t;
    syncAllVideos(t);
    if (aboutVideo) aboutVideo.currentTime = t;
  }
  if (overlay.dataset.wasPlaying === "true") {
    play();
    overlay.dataset.wasPlaying = "";
  }
};
closeBtn?.addEventListener("click", closeOverlay);
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) closeOverlay();
});

const playBtn = document.getElementById("vid-play");
const progress = document.getElementById("vid-progress");
const timeDisplay = document.getElementById("vid-time");
let isSeeking = false;

const fmt = (s) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const updateControls = () => {
  if (!overlayVideo || isSeeking) return;
  const paused = overlayVideo.paused;
  playBtn.innerHTML = paused
    ? '<i class="fa-solid fa-play"></i>'
    : '<i class="fa-solid fa-pause"></i>';
  bigPlay?.classList.toggle("hidden", !paused);
  if (overlayVideo.duration) {
    progress.max = overlayVideo.duration;
    progress.value = overlayVideo.currentTime;
    const pct = (overlayVideo.currentTime / overlayVideo.duration) * 100;
    progress.style.background = `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,.15) ${pct}%)`;
    timeDisplay.textContent = `${fmt(overlayVideo.currentTime)} / ${fmt(overlayVideo.duration)}`;
  }
};

playBtn?.addEventListener("click", () => {
  if (overlayVideo.paused) overlayVideo.play();
  else overlayVideo.pause();
});

const bigPlay = document.getElementById("vid-big-play");
bigPlay?.addEventListener("click", () => overlayVideo?.play());

progress?.addEventListener("input", () => {
  isSeeking = true;
  overlayVideo.currentTime = progress.value;
  const pct = (progress.value / progress.max) * 100;
  progress.style.background = `linear-gradient(to right, var(--accent) ${pct}%, rgba(255,255,255,.15) ${pct}%)`;
  timeDisplay.textContent = `${fmt(progress.value)} / ${fmt(overlayVideo.duration || 0)}`;
});

progress?.addEventListener("change", () => {
  isSeeking = false;
});

overlayVideo?.addEventListener("timeupdate", updateControls);
overlayVideo?.addEventListener("play", updateControls);
overlayVideo?.addEventListener("pause", updateControls);
overlayVideo?.addEventListener("loadedmetadata", updateControls);

const controls = document.getElementById("video-controls");
let hideTimer = null;
const HIDE_DELAY = 1200;

const showControls = () => {
  controls?.classList.remove("hidden");
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => controls?.classList.add("hidden"), HIDE_DELAY);
};

overlay?.addEventListener("mousemove", showControls);
overlay?.addEventListener("mouseenter", showControls);
overlay?.addEventListener("touchstart", showControls, { passive: true });

const ctxMenu = document.getElementById("ctx-menu");
const ctxItems = document.getElementById("ctx-items");
let ctxIndex = -1;
const ctxBtns = [];

const closeCtx = () => {
  ctxMenu.classList.remove("open");
  ctxIndex = -1;
  ctxBtns.length = 0;
};
const focusCtx = (i) => {
  ctxBtns.forEach((b, idx) => {
    if (!b) return;
    b.classList.toggle("ctx-focus", idx === i);
    if (idx === i) b.focus();
  });
};

document.addEventListener("contextmenu", e => {
  e.preventDefault();
  closeCtx();
  ctxItems.innerHTML = "";

  const target = e.target;
  const link = target.closest("a");
  const video = target.closest("video");
  const img = target.closest("img");
  const btnEl = target.closest("button");
  const text = window.getSelection().toString().trim();

  const items = [];

  if (link?.href) {
    items.push({ label: "Open link", icon: "fa-solid fa-arrow-up-right-from-square", action: () => window.open(link.href, "_blank") });
    items.push({ label: "Copy link", icon: "fa-solid fa-link", action: () => navigator.clipboard?.writeText(link.href) });
    items.push("divider");
  }

  const isOverlayCtrl = target.closest("#video-overlay, .music-btn, .video-controls, .vid-progress");

  if (video && !isOverlayCtrl) {
    items.push({ label: video.paused ? "Play" : "Pause", icon: video.paused ? "fa-solid fa-play" : "fa-solid fa-pause", action: () => video.paused ? video.play() : video.pause() });
    items.push({ label: video.muted ? "Unmute" : "Mute", icon: video.muted ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high", action: () => { video.muted = !video.muted; } });
    items.push("divider");
    items.push({ label: "Restart", icon: "fa-solid fa-rotate-left", action: () => { video.currentTime = 0; video.play(); } });
    items.push({ label: video.loop ? "Loop: on" : "Loop: off", icon: "fa-solid fa-rotate", action: () => { video.loop = !video.loop; }, state: video.loop });
    items.push({ label: "Fullscreen", icon: "fa-solid fa-expand", action: () => video.requestFullscreen?.() });
    items.push({ label: "Download", icon: "fa-solid fa-download", action: () => {
      const a = document.createElement("a");
      a.href = video.currentSrc || video.src;
      a.download = video.currentSrc?.split("/").pop() || "video.mp4";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } });
    items.push("divider");
    items.push({ label: "Speed 0.5x", icon: "fa-solid fa-gauge", action: () => { video.playbackRate = 0.5; } });
    items.push({ label: "Speed 1x", icon: "fa-solid fa-gauge", action: () => { video.playbackRate = 1; } });
    items.push({ label: "Speed 1.5x", icon: "fa-solid fa-gauge", action: () => { video.playbackRate = 1.5; } });
    items.push({ label: "Speed 2x", icon: "fa-solid fa-gauge", action: () => { video.playbackRate = 2; } });
  }

  if (btnEl && !isOverlayCtrl) {
    items.push({ label: "Click button", icon: "fa-solid fa-hand-pointer", action: () => btnEl.click() });
  }

  if (img?.src) {
    items.push({ label: "Copy image URL", icon: "fa-solid fa-image", action: () => navigator.clipboard?.writeText(img.src) });
  }

  if (text) {
    items.push({ label: "Copy text", icon: "fa-solid fa-copy", action: () => navigator.clipboard?.writeText(text) });
  }

  items.push("divider");
  items.push({ label: "Show tour guide", icon: "fa-solid fa-map", action: () => openTour() });

  if (!items.length) {
    items.push({ label: "Nothing available", icon: null, class: "disabled" });
  }

  while (items.length && items[items.length - 1] === "divider") items.pop();

  const addItem = (item) => {
    if (item === "divider") {
      const div = document.createElement("div");
      div.className = "ctx-divider";
      ctxItems.appendChild(div);
      ctxBtns.push(null);
      return;
    }

    const btn = document.createElement("button");
    btn.className = `ctx-item${item.class ? " " + item.class : ""}${item.state !== undefined ? " ctx-has-state" : ""}`;
    btn.tabIndex = -1;

    if (item.icon) {
      const i = document.createElement("i");
      i.className = item.icon;
      btn.appendChild(i);
    }
    btn.appendChild(document.createTextNode(" " + item.label));

    const idx = ctxBtns.length;
    ctxBtns.push(btn);

    btn.addEventListener("mouseenter", () => focusCtx(idx));
    btn.addEventListener("click", () => { closeCtx(); item.action?.(); });
    ctxItems.appendChild(btn);
  };

  items.forEach(addItem);
  ctxBtns.forEach((b, i) => {
    if (b && ctxIndex === -1) { ctxIndex = i; b.classList.add("ctx-focus"); }
  });
  if (ctxIndex >= 0) focusCtx(ctxIndex);

  ctxMenu.classList.add("open");
  void ctxMenu.offsetWidth;
  let left = e.clientX;
  let top = e.clientY;
  const mw = ctxMenu.offsetWidth;
  const mh = ctxMenu.offsetHeight;
  if (left + mw > window.innerWidth - 4) left = window.innerWidth - mw - 4;
  if (top + mh > window.innerHeight - 4) top = window.innerHeight - mh - 4;
  ctxMenu.style.left = Math.max(4, left) + "px";
  ctxMenu.style.top = Math.max(4, top) + "px";
});

document.addEventListener("keydown", e => {
  if (!ctxMenu.classList.contains("open")) return;
  if (e.key === "Escape") { closeCtx(); e.preventDefault(); }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    let next = (ctxIndex + 1) % ctxBtns.length;
    while (!ctxBtns[next] && next !== ctxIndex) next = (next + 1) % ctxBtns.length;
    if (ctxBtns[next]) { ctxIndex = next; focusCtx(ctxIndex); }
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    let prev = (ctxIndex - 1 + ctxBtns.length) % ctxBtns.length;
    while (!ctxBtns[prev] && prev !== ctxIndex) prev = (prev - 1 + ctxBtns.length) % ctxBtns.length;
    if (ctxBtns[prev]) { ctxIndex = prev; focusCtx(ctxIndex); }
  }
  if (e.key === "Enter") {
    e.preventDefault();
    const active = ctxBtns[ctxIndex];
    if (active && !active.classList.contains("disabled")) {
      closeCtx();
      active.click();
    }
  }
});

document.addEventListener("click", closeCtx);

/* ── Tour Guide ── */

const TOUR_KEY = "dbd_tour_v2";
localStorage.removeItem("dbd_tour_done");
const tourOverlay = document.getElementById("tour-overlay");
const tourHighlight = document.getElementById("tour-highlight");
const tourBox = document.getElementById("tour-box");
const tourConnector = document.getElementById("tour-connector");
const tourTitle = document.getElementById("tour-title");
const tourDesc = document.getElementById("tour-desc");
const tourStep = document.getElementById("tour-step");
const tourPrev = document.getElementById("tour-prev");
const tourNext = document.getElementById("tour-next");
const tourSkip = document.getElementById("tour-skip");

const tourSteps = [
  {
    target: null,
    title: "! أهلاً بك",
    desc: "هذا دليل سريع لمساعدتك في التنقل في الموقع. اضغط على <b>التالي</b> للمتابعة.",
    pos: "center",
  },
  {
    target: "#music-toggle",
    title: "زر الموسيقى",
    desc: 'اضغط <b>ضغطة قصيرة</b> لتشغيل / إيقاف الموسيقى.<br><br>اضغط <b>ضغطة طويلة</b> (400ms) لفتح مشغل الفيديو كامل الشاشة مع عناصر تحكم مخصصة.',
    pos: "bottom",
  },
  {
    target: "header > nav",
    title: "التنقل",
    desc: 'استخدم روابط التنقل في الأعلى للانتقال بين الأقسام.<br><br>في الجوال، افتح القائمة من أيقونة الخطوط الثلاثة (☰).<br><br>يمكنك أيضاً استخدام الأسهم ∞ والنقاط في الأسفل.',
    pos: "bottom",
  },
  {
    target: null,
    title: "! انتهينا",
    desc: "يمكنك فتح هذا الدليل مرة أخرى من قائمة الزر الأيمن (Context Menu) في أي وقت.",
    pos: "center",
  },
];

let tourStepIdx = 0;

const showTourStep = (idx) => {
  const step = tourSteps[idx];
  tourTitle.innerHTML = step.title;
  tourDesc.innerHTML = step.desc;
  tourStep.textContent = `${idx + 1} / ${tourSteps.length}`;
  tourPrev.classList.toggle("hidden", idx === 0);
  tourNext.textContent = idx === tourSteps.length - 1 ? "تم" : "التالي";

  tourHighlight.classList.remove("visible");
  tourConnector.className = "tour-connector";
  tourBox.style.left = "";
  tourBox.style.top = "";
  tourBox.style.transform = "";

  clearConnector();

  if (step.target) {
    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      tourHighlight.style.left = rect.left - 8 + "px";
      tourHighlight.style.top = rect.top - 8 + "px";
      tourHighlight.style.width = rect.width + 16 + "px";
      tourHighlight.style.height = rect.height + 16 + "px";
      tourHighlight.classList.add("visible");

      if (step.pos === "bottom") {
        tourBox.style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 340)) + "px";
        tourBox.style.top = rect.bottom + 28 + "px";
        showConnector("top", rect.bottom + 8, rect.left + rect.width / 2);
      } else if (step.pos === "top") {
        const boxH = tourBox.offsetHeight || 200;
        tourBox.style.left = Math.max(16, Math.min(rect.left + rect.width / 2 - 160, window.innerWidth - 340)) + "px";
        tourBox.style.top = rect.top - 28 - boxH + "px";
        showConnector("bottom", rect.top - 8, rect.left + rect.width / 2);
      }
    }
  } else {
    tourBox.style.left = "50%";
    tourBox.style.top = "50%";
    tourBox.style.transform = "translate(-50%, -50%)";
  }
};

const showConnector = (dir, y, x) => {
  tourConnector.className = `tour-connector ${dir}`;
  tourConnector.style.display = "block";
  if (dir === "top") {
    tourConnector.style.left = x + "px";
    tourConnector.style.top = y + "px";
  } else if (dir === "bottom") {
    tourConnector.style.left = x + "px";
    tourConnector.style.top = y + "px";
  }
};
const clearConnector = () => {
  tourConnector.style.display = "none";
};

tourNext.addEventListener("click", () => {
  if (tourStepIdx === tourSteps.length - 1) {
    closeTour();
    return;
  }
  tourStepIdx++;
  showTourStep(tourStepIdx);
});
tourPrev.addEventListener("click", () => {
  if (tourStepIdx === 0) return;
  tourStepIdx--;
  showTourStep(tourStepIdx);
});
tourSkip.addEventListener("click", closeTour);

const closeTour = () => {
  tourOverlay.classList.remove("open");
  tourHighlight.classList.remove("visible");
  clearConnector();
  localStorage.setItem(TOUR_KEY, "1");
};

const openTour = () => {
  tourStepIdx = 0;
  tourOverlay.classList.add("open");
  showTourStep(0);
};

document.getElementById("tour-trigger")?.addEventListener("click", openTour);

if (!localStorage.getItem(TOUR_KEY)) {
  setTimeout(openTour, 600);
}

tourOverlay.addEventListener("click", (e) => {
  if (e.target.closest(".tour-box")) return;
  closeTour();
});
