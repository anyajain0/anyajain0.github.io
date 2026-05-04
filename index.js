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
    title: "[Conceptual 3D Models]",
    media: "conceptual-3d-models.png",
    type: "image",
    description: "",
    tools: "//Designed and rendered from scratch using Shapr3D//"
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
    title: "[Persian Rugs - Fractals-Based Graphics]",
    media: "persian-rugs-fractals.png",
    type: "image",
    description:
      "The goals of this project were to emulate the look of Persian rugs using recursively-defined shapes and parameterize geometric patterns.\n\nSlider tools control shape parameters--recursion depth (complexity) and number of sides (roundness)--to form different \"rugs\".\n\nUsed shapes based on Koch Snowflakes and Sierpinski Triangles to create geometric motifs with traditional medallion-style rug layout.\n\nModified Deterministic Fractals, creating unique patterns:\n\n-Koch: retained fractal generator of the snowflake (equilateral triangle) but defined the initiator shape as a parameter\n-Sierpinski: Fixed scaling factor of 0.5 for all n-flakes; child shape centered at vertex",
    tools: "//coded in Python on Visual Studio Code//\nhttps://github.com/anyajain0/persianrugfractals\n//complexity capped at 5 and roundness capped at 7 because of turtle graphics rendering limitations//"
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
