const video=document.querySelector('video.motion');
const toggleButton=document.querySelector('#video-toggle'),progress=document.querySelector('#video-progress');
const soundButton=document.querySelector('#video-sound');
video.controls=false;video.removeAttribute('controls');video.muted=true;
function syncSound(){
 const enabled=!video.muted&&video.volume>0;
 soundButton.classList.toggle('is-audible',enabled);
 soundButton.setAttribute('aria-label',enabled?'Mute video':'Unmute video');
 soundButton.setAttribute('aria-pressed',String(enabled));
 soundButton.title=enabled?'Turn sound off':'Turn sound on';
}
soundButton.addEventListener('click',()=>{video.muted=!video.muted;if(!video.muted&&video.volume===0)video.volume=1;syncSound()});
video.addEventListener('volumechange',syncSound);syncSound();
function formatTime(seconds){const n=Math.floor(Number.isFinite(seconds)?seconds:0);return `${Math.floor(n/60)}:${String(n%60).padStart(2,'0')}`}
function syncPlayback(){
 const playing=!video.paused&&!video.ended;
 toggleButton.classList.toggle('is-playing',playing);
 toggleButton.setAttribute('aria-label',playing?'Pause video':'Play video');
 toggleButton.title=playing?'Pause video':'Play video';
}
function syncProgress(){
 const duration=video.duration;
 if(!Number.isFinite(duration)||duration<=0)return;
 progress.disabled=false;progress.max=String(duration);progress.value=String(video.currentTime);
 progress.style.setProperty('--progress',`${video.currentTime/duration*100}%`);
 progress.setAttribute('aria-valuetext',`${formatTime(video.currentTime)} of ${formatTime(duration)}`);
}
function togglePlayback(){if(video.paused){if(video.ended)video.currentTime=0;video.play().catch(syncPlayback)}else video.pause()}
toggleButton.addEventListener('click',togglePlayback);toggleButton.disabled=false;
progress.addEventListener('input',()=>{video.currentTime=Number(progress.value);syncProgress()});
video.addEventListener('play',syncPlayback);video.addEventListener('pause',syncPlayback);video.addEventListener('ended',syncPlayback);
video.addEventListener('timeupdate',syncProgress);video.addEventListener('loadedmetadata',syncProgress);video.addEventListener('durationchange',syncProgress);
video.addEventListener('keydown',event=>{if(event.code==='Space'||event.code==='KeyK'){event.preventDefault();togglePlayback()}});
syncPlayback();syncProgress();video.play().catch(syncPlayback);
const tooltip=document.querySelector('.piece-tooltip');
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const imageSamples=new WeakMap(),videoCanvases=new WeakMap();
let tooltipFrame=0,pointer=null;
function hideTooltip(){
 if(tooltipFrame)cancelAnimationFrame(tooltipFrame);
 tooltipFrame=0;pointer=null;tooltip.hidden=true;
}
function backgroundColor(target){
 let color=[255,255,255],layers=[];
 for(let el=target;el;el=el.parentElement){
  const c=getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
  if(!c||c.length<3)continue;
  const a=c.length>3?Number(c[3]):1;
  if(a>0)layers.push([Number(c[0]),Number(c[1]),Number(c[2]),a]);
  if(a===1)break;
 }
 for(let i=layers.length-1;i>=0;i--){const c=layers[i];color=color.map((v,k)=>Math.round(c[k]*c[3]+v*(1-c[3])))}
 return `rgb(${color.join(' ')})`;
}
function sampleMedia(media,x,y,fallback){
 const isVideo=media.tagName==='VIDEO';
 const nw=isVideo?media.videoWidth:media.naturalWidth,nh=isVideo?media.videoHeight:media.naturalHeight;
 if(!nw||!nh||(isVideo&&media.readyState<2))return fallback;
 try{
  let data;
  if(isVideo){
   let entry=videoCanvases.get(media);
   if(!entry){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;entry=canvas.getContext('2d',{willReadFrequently:true});videoCanvases.set(media,entry)}
   entry.drawImage(media,0,0,128,128);data=entry.getImageData(0,0,128,128).data;
  }else{
   data=imageSamples.get(media);
   // GIFs need a fresh sample because their visible frame changes.
   if(!data||media.currentSrc.endsWith('.gif')){const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(media,0,0,128,128);data=ctx.getImageData(0,0,128,128).data;imageSamples.set(media,data)}
  }
  const b=media.getBoundingClientRect(),ratio=nw/nh,fit=getComputedStyle(media).objectFit;
  let width=b.width,height=b.height;
  if(fit==='cover'){width=Math.max(b.width,b.height*ratio);height=width/ratio}
  else if(fit==='contain'){width=Math.min(b.width,b.height*ratio);height=width/ratio}
  const u=(x-b.left-(b.width-width)/2)/width,v=(y-b.top-(b.height-height)/2)/height;
  if(u<0||u>1||v<0||v>1)return fallback;
  const i=(Math.min(127,Math.floor(v*128))*128+Math.min(127,Math.floor(u*128)))*4;
  if(data[i+3]<100)return fallback;
  return `rgb(${data[i]} ${data[i+1]} ${data[i+2]})`;
 }catch{return fallback}
}
function positionTooltip(x,y){
 const w=tooltip.offsetWidth,h=tooltip.offsetHeight;
 let left=x+24,top=y+20;
 if(left+w>innerWidth-12)left=x-w-24;
 if(top+h>innerHeight-12)top=y-h-20;
 tooltip.style.left=`${Math.max(12,left)}px`;tooltip.style.top=`${Math.max(12,top)}px`;
}
function paintTooltip(){
 tooltipFrame=0;if(!pointer||!finePointer.matches)return;
 const {x,y}=pointer,target=document.elementFromPoint(x,y);
 const piece=target?.closest('.home [data-piece-title]');
 if(!piece?.dataset.pieceNote.trim()){tooltip.hidden=true;return}
 const background=backgroundColor(target),media=target.closest('img,video');
 const color=media?sampleMedia(media,x,y,background):background;
 tooltip.querySelector('strong').textContent=piece.dataset.pieceTitle;
 tooltip.querySelector('p').textContent=piece.dataset.pieceNote;
 tooltip.style.setProperty('--picked-color',color);tooltip.hidden=false;positionTooltip(x,y);
}
document.addEventListener('pointermove',event=>{
 if(event.pointerType!=='mouse'||!finePointer.matches)return;
 pointer={x:event.clientX,y:event.clientY};if(!tooltipFrame)tooltipFrame=requestAnimationFrame(paintTooltip);
},{passive:true});
document.documentElement.addEventListener('pointerleave',hideTooltip);
document.addEventListener('keydown',event=>{if(event.key==='Escape'||event.key==='Tab')hideTooltip()});
addEventListener('blur',hideTooltip);addEventListener('scroll',hideTooltip,{passive:true});addEventListener('resize',hideTooltip);
// No asset navigation, native drag ghost, image context menu or copy interaction.
document.addEventListener('dragstart',event=>{if(event.target.closest('.home'))event.preventDefault()});
document.addEventListener('contextmenu',event=>{if(event.target.closest('.art,video.motion'))event.preventDefault()});
