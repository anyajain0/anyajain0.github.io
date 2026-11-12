const track = document.querySelector('.scroll-track');
const viewport = document.querySelector('.viewport');
const board = document.querySelector('.artboard');
const layers = [...board.querySelectorAll('[data-motion]')].map(element => {
  const keyframes = element.dataset.motion.split('|').map(box => box.split(',').map(Number));
  const [, , width, height] = keyframes[0];
  const fixedSize = keyframes.every(box => box[2] === width && box[3] === height);
  return {element, keyframes, fixedSize, last: []};
});
const phases = [...board.querySelectorAll('[data-phase]')];
const videoLayer = board.querySelector('.video-layer');
const videoKeyframes = layers.find(({element}) => element === videoLayer).keyframes;
const videoControls = videoLayer.querySelector('.video-controls');
const coutureReveal = board.querySelector('.couture-reveal');
const preference = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = value => Math.max(0, Math.min(1, value));
const blend = (progress, start, end) => {
  const ratio = clamp((progress - start) / (end - start));
  return ratio * ratio * (3 - 2 * ratio);
};

// Bounds in the Figma coordinate system, including notes and open panels.
const drawerBounds = [[97, 492], [292, 670], [475, 1044], [682, 1060]];
const drawerCount = drawerBounds.length;
const fullyOpenAt = .36;
const closeAfter = 1 - fullyOpenAt;
const boxProperties = ['left', 'top', 'width', 'height'];

let viewportWidth = 1280;
let viewportHeight = 0;
let travel = 1;
let frame = 0;
let drawnScroll = 0;
let previousTime = null;

function render(scroll) {
  const position = scroll * drawerCount;
  const drawer = Math.min(Math.floor(position), drawerCount - 1);
  const distance = position - drawer;
  const reducedMotion = preference.matches;
  const lastDrawer = drawer === drawerCount - 1;
  const open = reducedMotion
    ? Number(scroll > 0)
    : blend(distance, 0, fullyOpenAt)
      * (lastDrawer ? 1 : 1 - blend(distance, closeAfter, 1));
  const openings = Array(drawerCount + 1).fill(0);
  openings[0] = 1 - open;
  openings[drawer + 1] = open;
  const weighted = values =>
    values.reduce((sum, value, index) => sum + value * openings[index], 0);

  const fit = index => {
    const widthScale = viewportWidth / 1280;
    if (index < 0) return [widthScale, 0];
    const [top, bottom] = drawerBounds[index];
    const scale = Math.min(widthScale, Math.max(1, viewportHeight - 32) / (bottom - top));
    return [scale, Math.min(0, (viewportHeight - (top + bottom) * scale) / 2)];
  };
  const [focusedScale, focusedOffset] = fit(drawer);
  const leaving = !lastDrawer && distance > closeAfter;
  const [adjacentScale, adjacentOffset] = fit(drawer + (leaving ? 1 : -1));
  // A handoff is one camera move, spanning the outgoing close and incoming open.
  let camera = 0;
  if (!reducedMotion) {
    if (leaving) {
      camera = blend(distance, closeAfter, 1 + fullyOpenAt);
    } else if (drawer === 0) {
      camera = 1 - blend(distance, 0, fullyOpenAt);
    } else {
      camera = 1 - blend(distance + 1, closeAfter, 1 + fullyOpenAt);
    }
  }
  const scale = focusedScale + (adjacentScale - focusedScale) * camera;
  const offset = focusedOffset + (adjacentOffset - focusedOffset) * camera;
  board.style.setProperty('--scale', scale);
  board.style.setProperty('--offset-x', `${(viewportWidth - 1280 * scale) / 2}px`);
  board.style.setProperty('--offset', `${reducedMotion && scroll === 0 ? 0 : offset}px`);

  const [, videoOpen, jaliOpen, coutureOpen, mixedOpen] = openings;
  const videoTopProgress = blend(videoOpen, 0, .4);
  const closedVideoTop = videoKeyframes[0][1];
  const videoTop = closedVideoTop + (videoKeyframes[1][1] - closedVideoTop) * videoTopProgress;
  const controlsBottom = videoTop + weighted(videoKeyframes.map(box => box[3])) + videoControls.offsetHeight;
  for (const {element, keyframes, fixedSize, last} of layers) {
    const dimensions = fixedSize ? 2 : boxProperties.length;
    for (let index = 0; index < dimensions; index++) {
      // Lower the video beneath the heading before its right edge reaches it.
      let position = element === videoLayer && boxProperties[index] === 'top'
        ? videoTop
        : weighted(keyframes.map(box => box[index]));
      if (element.dataset.phase === 'expand' && boxProperties[index] === 'height') {
        const drawerTop = weighted(keyframes.map(box => box[1]));
        position = Math.max(position, controlsBottom + 2 - drawerTop);
      }
      const value = Math.round(position * 1000) / 1000;
      if (last[index] === value) continue;
      last[index] = value;
      if (!fixedSize) element.style[boxProperties[index]] = `${value}px`;
    }
    if (fixedSize) {
      const translate = `${last[0] - keyframes[0][0]}px ${last[1] - keyframes[0][1]}px`;
      if (element.style.translate !== translate) element.style.translate = translate;
    }
  }

  const visibility = {expand: videoOpen, jali: jaliOpen, couture: coutureOpen, mixed: mixedOpen};
  // The opening aperture starts at the pink strip and grows with its mockups.
  const clipTop = 514 - 39 * coutureOpen;
  const clipBottom = 630 + 394 * coutureOpen;
  const clipLeft = 641 - 10 * coutureOpen;
  const clipRight = 22 - 10 * coutureOpen;
  coutureReveal.style.clipPath = coutureOpen === 1
    ? 'none'
    : `inset(${clipTop}px ${clipRight}px calc(100% - ${clipBottom}px) ${clipLeft}px)`;
  for (const layer of phases) {
    layer.hidden = visibility[layer.dataset.phase] === 0;
  }
}

function renderScroll(now) {
  frame = 0;
  const target = Math.max(0, Math.min(window.scrollY, travel));
  const remaining = target - drawnScroll;
  if (preference.matches || Math.abs(remaining) < .4) {
    drawnScroll = target;
    previousTime = null;
  } else {
    const elapsed = previousTime === null ? 16 : Math.min(now - previousTime, 40);
    drawnScroll += remaining * (1 - Math.exp(-elapsed / 56));
    previousTime = now;
    scheduleRender();
  }
  render(clamp(drawnScroll / travel));
}

function scheduleRender() {
  if (!frame) frame = requestAnimationFrame(renderScroll);
}

function resize() {
  viewportHeight = viewport.clientHeight;
  viewportWidth = viewport.clientWidth;
  travel = Math.max(1, track.offsetHeight - viewport.offsetHeight);
  drawnScroll = Math.max(0, Math.min(window.scrollY, travel));
  scheduleRender();
}

window.addEventListener('scroll', scheduleRender, {passive: true});
window.addEventListener('resize', resize);
preference.addEventListener('change', scheduleRender);
resize();

const video = document.querySelector('#uproar');
const playback = document.querySelector('.playback');
const audio = document.querySelector('.audio');
const seek = document.querySelector('.seek');
const status = document.querySelector('.video-status');

function syncPlayback() {
  const playing = !video.paused && !video.ended;
  playback.toggleAttribute('data-playing', playing);
  playback.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');
}
function syncAudio() {
  audio.toggleAttribute('data-audible', !video.muted);
  audio.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
}
function syncTime() {
  const ready = Number.isFinite(video.duration) && video.duration > 0;
  seek.disabled = !ready;
  seek.value = ready ? 100 * video.currentTime / video.duration : 0;
  seek.style.setProperty('--progress', seek.value + '%');
}
function showError() {
  status.textContent = 'Video unavailable. Press Play to retry.';
  status.hidden = false;
}
playback.addEventListener('click', async () => {
  if (!video.paused && !video.ended) {
    video.pause();
    return;
  }
  if (video.error || video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) video.load();
  try {
    await video.play();
  } catch {
    showError();
  }
});
audio.addEventListener('click', () => { video.muted = !video.muted; });
seek.addEventListener('input', () => {
  video.currentTime = Number(seek.value) * video.duration / 100;
  seek.style.setProperty('--progress', seek.value + '%');
});
for (const event of ['play', 'pause', 'ended', 'error']) video.addEventListener(event, syncPlayback);
for (const event of ['loadedmetadata', 'durationchange', 'timeupdate', 'emptied']) video.addEventListener(event, syncTime);
video.addEventListener('volumechange', syncAudio);
video.addEventListener('playing', () => { status.hidden = true; });
video.addEventListener('error', showError);
video.lastElementChild.addEventListener('error', showError);
syncPlayback();
syncAudio();
syncTime();
