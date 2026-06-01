const projects = [
  {
    slug: "thomas-attractor",
    title: "[Thomas Attractor]",
    media: "thomas-attractor-7x.mov",
    type: "video",
    description:
      "Learned how to visualize strange attractors by using GLSL to define the movement of points through a system of three ordinary differential equations to create the attractor shape, showing the path of a point simulation tracing out the Thomas strange attractor. GLSL code can be modified to visualize any strange attractor by changing the equations.",
    tools: "//Made with TouchDesigner//"
  },
  {
    slug: "conceptual-3d-models",
    title: "[Conceptual 3D Models]",
    media: "conceptual-3d-models.png",
    type: "image",
    description: "",
    tools: "//Designed and rendered from scratch using Shapr3D//"
  },
  {
    slug: "pinch-controlled-3d-particle-system",
    title: "[Pinch-controlled 3D Particle System]",
    media: "pinchcon111.mp4",
    type: "video",
    description:
      "Tracking distance between index finger and thumb and storing it in a channel, then using this pinch-distance value to control turbulence and particle birth rate. The particle birth surface is a 2D file input, but particlesGPU simulates in 3D so forces apply in 3D.",
    tools: "//Made with TouchDesigner & MediaPipe Plugin//"
  },
  {
    slug: "mixed-media-works",
    title: "[Mixed Media Works]",
    type: "gallery",
    mediaItems: [
      {
        src: "mixed-media-emperor-penguin.png",
        alt: "Emperor Penguin mixed media artwork"
      },
      {
        src: "mixed-media-polar-bear.jpg",
        alt: "Polar Bear mixed media artwork"
      },
      {
        src: "mixed-media-snow-leopard.jpg",
        alt: "Snow Leopard mixed media artwork"
      }
    ],
    description: "",
    tools: "//Digital Art, Photography, Photoshop//"
  },
  {
    slug: "persian-rugs-fractals-based-graphics",
    title: "[Persian Rugs - Fractals-Based Graphics]",
    media: "persian-rugs-fractals.png",
    type: "image",
    description:
      "The goals of this project were to emulate the look of Persian rugs using recursively-defined shapes and parameterize geometric patterns.\n\nSlider tools control shape parameters--recursion depth (complexity) and number of sides (roundness)--to form different \"rugs.\"\n\nUsed shapes based on Koch Snowflakes and Sierpinski Triangles to create geometric motifs with a traditional medallion-style rug layout.\n\nModified Deterministic Fractals, creating unique patterns:\n\n-Koch: Retained the fractal generator of the snowflake (equilateral triangle) but defined the initiator shape as a parameter\n-Sierpinski: Fixed the scaling factor at 0.5 for all n-flakes; child shape centered at vertex",
    tools: "//Coded in Python on Visual Studio Code//\nhttps://github.com/anyajain0/persianrugfractals\n//Complexity capped at 5 and Roundness capped at 7 because of Turtle graphics rendering limitations//"
  }
];

const dialog = document.querySelector("#project-dialog");
const dialogMedia = document.querySelector("#dialog-media");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogTools = document.querySelector("#dialog-tools");
const closeDialog = document.querySelector(".close-dialog");
const projectMap = new Map(projects.map((project) => [project.slug, project]));

document.querySelectorAll(".project-tile").forEach((tile) => {
  const video = tile.querySelector("video");

  tile.addEventListener("mouseenter", () => video?.play());
  tile.addEventListener("mouseleave", () => {
    if (!video) return;
    video.pause();
    video.currentTime = 0;
  });

  tile.addEventListener("click", (event) => {
    event.preventDefault();
    openProject(projects[Number(tile.dataset.project)]);
  });
});

function openProject(project, options = {}) {
  const { updateUrl = true } = options;

  if (!dialog || !dialogMedia) return;

  dialogMedia.replaceChildren();
  renderProjectMedia(project);
  dialogTitle.textContent = project.title;
  dialogDescription.textContent = project.description;
  dialogTools.textContent = project.tools;

  if (typeof dialog.showModal === "function") {
    if (!dialog.open) {
      try {
        dialog.showModal();
      } catch {
        dialog.setAttribute("open", "");
      }
    }
  } else {
    dialog.setAttribute("open", "");
  }

  if (updateUrl) {
    setProjectUrl(project.slug);
  }
}

function closeProject(options = {}) {
  const { updateUrl = true } = options;

  if (!dialog || !dialogMedia) return;

  dialogMedia.querySelectorAll("video").forEach((video) => video.pause());

  if (updateUrl) {
    clearProjectUrl();
  }

  if (typeof dialog.close === "function" && dialog.open) {
    try {
      dialog.close();
    } catch {
      dialog.removeAttribute("open");
    }
  } else {
    dialog.removeAttribute("open");
  }
}

function renderProjectMedia(project) {
  if (project.type === "gallery" && Array.isArray(project.mediaItems)) {
    renderGallery(project);
    return;
  }

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
}

function renderGallery(project) {
  let currentIndex = 0;

  const carousel = document.createElement("div");
  carousel.className = "media-carousel";

  const track = document.createElement("div");
  track.className = "media-carousel-track";

  const counter = document.createElement("p");
  counter.className = "media-carousel-count";

  const prevButton = document.createElement("button");
  prevButton.className = "media-carousel-nav media-carousel-nav-prev";
  prevButton.type = "button";
  prevButton.setAttribute("aria-label", "Previous artwork");
  prevButton.textContent = "←";

  const nextButton = document.createElement("button");
  nextButton.className = "media-carousel-nav media-carousel-nav-next";
  nextButton.type = "button";
  nextButton.setAttribute("aria-label", "Next artwork");
  nextButton.textContent = "→";

  project.mediaItems.forEach((item, index) => {
    const slide = document.createElement("figure");
    slide.className = "media-carousel-slide";
    slide.hidden = index !== 0;

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;

    slide.append(image);
    track.append(slide);
  });

  function updateGallery(nextIndex) {
    currentIndex = (nextIndex + project.mediaItems.length) % project.mediaItems.length;

    Array.from(track.children).forEach((slide, index) => {
      slide.hidden = index !== currentIndex;
    });

    counter.textContent = `${currentIndex + 1} / ${project.mediaItems.length}`;
  }

  prevButton.addEventListener("click", () => updateGallery(currentIndex - 1));
  nextButton.addEventListener("click", () => updateGallery(currentIndex + 1));

  carousel.append(prevButton, track, nextButton, counter);
  dialogMedia.append(carousel);
  updateGallery(0);
}

function setProjectUrl(slug) {
  const url = new URL(window.location.href);
  url.searchParams.set("project", slug);
  window.history.pushState({ project: slug }, "", url);
}

function clearProjectUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("project");
  window.history.pushState({}, "", url);
}

function syncProjectFromUrl() {
  const slug = new URLSearchParams(window.location.search).get("project");
  const project = slug ? projectMap.get(slug) : null;

  if (project) {
    openProject(project, { updateUrl: false });
    return;
  }

  if (dialog?.open) {
    closeProject({ updateUrl: false });
  }
}

closeDialog?.addEventListener("click", () => closeProject());

dialog?.addEventListener("click", (event) => {
  if (event.target === dialog) {
    closeProject();
  }
});

dialog?.addEventListener("close", () => {
  dialogMedia.querySelectorAll("video").forEach((video) => video.pause());
});

window.addEventListener("popstate", syncProjectFromUrl);
syncProjectFromUrl();
