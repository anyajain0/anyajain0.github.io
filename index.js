const projects = [
  {
    title: "path of hue",
    media: "poh.mov",
    type: "video",
    description:
      "A motion study about how color can behave like a route, a mood, and a tiny interface language. Built as a quick visual system for testing pacing, contrast, and soft transitions.",
    tools: "video, motion design, color systems",
    focus: "turning a visual experiment into a repeatable palette logic"
  },
  {
    title: "body of glass",
    media: "bog.mov",
    type: "video",
    description:
      "A material exploration for objects that feel delicate but engineered. The piece studies transparency, reflection, and how synthetic surfaces can still feel tactile.",
    tools: "material research, 3D form, visual prototyping",
    focus: "bridging object design with screen-based storytelling"
  },
  {
    title: "dream object radio",
    media: "dor.mov",
    type: "video",
    description:
      "A speculative music-technology project that imagines interfaces as emotional instruments. The expanded concept pairs listening rituals with playful controls and ambient feedback.",
    tools: "sound design, interaction sketches, media art",
    focus: "making music technology feel personal and strange"
  },
  {
    title: "house of diagrams",
    media: "hod.mov",
    type: "video",
    description:
      "A graphics engineering study using diagrams as a way to explain imaginary systems. It mixes precise layout thinking with expressive motion and modular composition.",
    tools: "graphics engineering, systems diagrams, animation",
    focus: "visual explanations that still leave room for curiosity"
  },
  {
    title: "pretty mug archive",
    media: "noback.gif",
    type: "image",
    description:
      "A growing catalog of small domestic objects, starting with mugs and vessels. The project treats everyday forms as tiny sculptures with memory, personality, and ritual.",
    tools: "object study, collection design, visual identity",
    focus: "finding design language in ordinary favorite things"
  }
];

const dialog = document.querySelector("#project-dialog");
const dialogMedia = document.querySelector("#dialog-media");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogTools = document.querySelector("#dialog-tools");
const dialogFocus = document.querySelector("#dialog-focus");
const closeDialog = document.querySelector(".close-dialog");
const portraitFrame = document.querySelector(".portrait-frame");

if (portraitFrame) {
  const moveGlass = (event) => {
    const rect = portraitFrame.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    portraitFrame.style.setProperty("--glass-x", `${x.toFixed(1)}%`);
    portraitFrame.style.setProperty("--glass-y", `${y.toFixed(1)}%`);
  };

  const resetGlass = () => {
    portraitFrame.style.setProperty("--glass-x", "72%");
    portraitFrame.style.setProperty("--glass-y", "28%");
  };

  portraitFrame.addEventListener("pointermove", moveGlass);
  portraitFrame.addEventListener("pointerleave", resetGlass);
}

document.querySelectorAll(".project-tile").forEach((tile) => {
  const video = tile.querySelector("video");

  tile.addEventListener("mouseenter", () => video?.play());
  tile.addEventListener("mouseleave", () => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  });

  tile.addEventListener("click", () => {
    openProject(projects[Number(tile.dataset.project)]);
  });
});

function openProject(project) {
  if (!dialog || !dialogMedia) return;

  dialogMedia.replaceChildren();

  const media = document.createElement(project.type === "video" ? "video" : "img");
  media.src = project.media;

  if (project.type === "video") {
    media.autoplay = true;
    media.loop = true;
    media.muted = true;
    media.playsInline = true;
    media.controls = true;
  } else {
    media.alt = project.title;
  }

  dialogMedia.append(media);
  dialogTitle.textContent = project.title;
  dialogDescription.textContent = project.description;
  dialogTools.textContent = project.tools;
  dialogFocus.textContent = project.focus;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeProject() {
  if (!dialog || !dialogMedia) return;

  dialogMedia.querySelector("video")?.pause();
  dialog.close();
}

closeDialog?.addEventListener("click", closeProject);

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeProject();
  }
});

dialog?.addEventListener("close", () => {
  dialogMedia.querySelector("video")?.pause();
});
