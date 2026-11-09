// Each individual image owns its own easing, position and scale state.
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');
const items=[...document.querySelectorAll('.art,.motion')].map(element=>({element,video:element.tagName==='VIDEO',x:0,y:0,scale:1,tx:0,ty:0,ts:1,focused:false}));
let frame=0;
function animate(){
 frame=0;let moving=false;
 for(const item of items){
  item.x+=(item.tx-item.x)*.105;item.y+=(item.ty-item.y)*.105;item.scale+=(item.ts-item.scale)*.105;
  const unsettled=Math.abs(item.x-item.tx)+Math.abs(item.y-item.ty)+Math.abs(item.scale-item.ts)*100>.01;
  moving=moving||unsettled;
  item.element.style.setProperty('--px',`${item.x.toFixed(3)}px`);
  item.element.style.setProperty('--py',`${item.y.toFixed(3)}px`);
  item.element.style.setProperty('--scale',item.scale.toFixed(5));
  if(!unsettled&&item.ts===1)item.element.style.willChange='auto';
 }
 if(moving)frame=requestAnimationFrame(animate);
}
function schedule(){if(!reduceMotion.matches&&!frame)frame=requestAnimationFrame(animate)}
function activate(item){if(reduceMotion.matches)return;item.ts=item.video?1.012:item.element.classList.contains('style-card')?1.018:1.028;item.element.style.willChange='transform';schedule()}
function reset(item){item.tx=item.ty=0;item.ts=item.focused?(item.video?1.012:item.element.classList.contains('style-card')?1.018:1.028):1;schedule()}
for(const item of items){
 item.element.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')activate(item)});
 item.element.addEventListener('pointermove',event=>{
  if(event.pointerType!=='mouse'||reduceMotion.matches)return;
  const b=item.element.getBoundingClientRect(),amount=item.video?1:3;
  item.tx=((event.clientX-b.left)/b.width-.5)*amount*2;
  item.ty=((event.clientY-b.top)/b.height-.5)*amount*2;
  activate(item);
 });
 item.element.addEventListener('pointerleave',()=>reset(item));
 item.element.addEventListener('focus',()=>{item.focused=true;activate(item)});
 item.element.addEventListener('blur',()=>{item.focused=false;reset(item)});
}
reduceMotion.addEventListener('change',()=>{
 if(!reduceMotion.matches)return;
 if(frame)cancelAnimationFrame(frame);frame=0;
 for(const item of items){item.x=item.y=item.tx=item.ty=0;item.scale=item.ts=1;for(const name of ['--px','--py','--scale'])item.element.style.removeProperty(name);item.element.style.willChange='auto'}
});
