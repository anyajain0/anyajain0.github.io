const projects = [
  {
    title: "[Thomas Attractor]",
    media: "thomas-attractor-7x.mov",
    type: "video",
    description:
      "Learned how to visualize strange attractors by using GLSL to define the movement of points through a system of three ordinary differential equations to create the attractor shape, showing the path of a point simulation tracing out the Thomas strange attractor. GLSL code can be modified to visualize any strange attractor by changing the equations.",
    tools: "//made with TouchDesigner//"
  },
  {
    title: "body of glass",
    media: "bog.mov",
    type: "video",
    description:
      "A material exploration for objects that feel delicate but engineered. The piece studies transparency, reflection, and how synthetic surfaces can still feel tactile.",
    tools: "material research, 3D form, visual prototyping"
  },
  {
    title: "[Pinch-controlled 3D Particle System]",
    media: "pinchcon111.mp4",
    type: "video",
    description:
      "Tracking distance between index finger and thumb and storing it in a channel, then using this pinch-distance value to control turbulence and particle birth rate. The particle birth surface is a 2D file input, but particlesGPU simulates in 3D so forces apply in 3D.",
    tools: "//Made with TouchDesigner & MediaPipe Plugin//"
  },
  {
    title: "house of diagrams",
    media: "hod.mov",
    type: "video",
    description:
      "A graphics engineering study using diagrams as a way to explain imaginary systems. It mixes precise layout thinking with expressive motion and modular composition.",
    tools: "graphics engineering, systems diagrams, animation"
  },
  {
    title: "pretty mug archive",
    media: "noback.gif",
    type: "image",
    description:
      "A growing catalog of small domestic objects, starting with mugs and vessels. The project treats everyday forms as tiny sculptures with memory, personality, and ritual.",
    tools: "object study, collection design, visual identity"
  }
];

const dialog = document.querySelector("#project-dialog");
const dialogMedia = document.querySelector("#dialog-media");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogTools = document.querySelector("#dialog-tools");
const closeDialog = document.querySelector(".close-dialog");

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
