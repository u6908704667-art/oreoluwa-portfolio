/* ===== Oreoluwa Adedeji — abstract 3D motion bg + crisp floating portrait (optimized) ===== */
document.getElementById('yr').textContent = new Date().getFullYear();
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

/* ---------- custom cursor ---------- */
(function(){
  const c=document.querySelector('.cursor'),d=document.querySelector('.cursor-dot');
  if(!c) return;
  let cx=innerWidth/2,cy=innerHeight/2,tx=cx,ty=cy;
  addEventListener('mousemove',e=>{tx=e.clientX;ty=e.clientY;d.style.transform=`translate(${e.clientX}px,${e.clientY}px) translate(-50%,-50%)`;});
  (function loop(){cx+=(tx-cx)*.15;cy+=(ty-cy)*.15;c.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;requestAnimationFrame(loop);})();
  document.querySelectorAll('[data-cursor]').forEach(el=>{el.addEventListener('mouseenter',()=>c.classList.add('hover'));el.addEventListener('mouseleave',()=>c.classList.remove('hover'));});
})();

function showFallback(){ const cv=document.getElementById('scene'); if(cv) cv.style.display='none'; }
function perfTier(){
  const m=navigator.deviceMemory||4, c=navigator.hardwareConcurrency||4;
  if(MOBILE||m<=4||c<=4) return {detail:2, stars:600, dpr:1.0};
  if(m<=8||c<=8)        return {detail:3, stars:1100,dpr:1.2};
  return {detail:4, stars:1700, dpr:1.35};
}

/* ---------- portrait parallax (HTML img, independent of WebGL) ---------- */
(function(){
  const wrap=document.querySelector('.portrait-wrap'); if(!wrap||REDUCED) return;
  let tx=0,ty=0,x=0,y=0;
  addEventListener('pointermove',e=>{tx=(e.clientX/innerWidth-0.5);ty=(e.clientY/innerHeight-0.5);},{passive:true});
  (function loop(){x+=(tx-x)*.06;y+=(ty-y)*.06;wrap.style.transform=`translate(-50%,-50%) translate(${x*26}px,${y*18}px)`;requestAnimationFrame(loop);})();
})();

/* ---------- abstract 3D motion background ---------- */
function makeOrb(radius,detail,color,opacity){
  const geo=new THREE.IcosahedronGeometry(radius,detail);
  const mat=new THREE.ShaderMaterial({
    wireframe:true, transparent:true, depthWrite:false,
    uniforms:{uTime:{value:0},uColor:{value:new THREE.Color(color)},uOpacity:{value:opacity},uAmp:{value:radius*0.16}},
    vertexShader:`uniform float uTime,uAmp; varying float vN;
      void main(){
        vec3 p=position; vec3 n=normalize(position);
        float w=sin(p.x*1.4+uTime)+sin(p.y*1.6+uTime*1.12)+sin(p.z*1.25+uTime*0.9);
        vN=w; p+=n*w*uAmp*0.33;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);
      }`,
    fragmentShader:`uniform vec3 uColor; uniform float uOpacity; varying float vN;
      void main(){ float g=0.6+0.4*sin(vN); gl_FragColor=vec4(uColor*(0.7+0.5*g),uOpacity); }`
  });
  return new THREE.Mesh(geo,mat);
}
function makeField(count){
  const g=new THREE.BufferGeometry(),pos=new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r=3+Math.random()*7,th=Math.random()*6.283,ph=Math.acos(2*Math.random()-1);
    pos[i*3]=r*Math.sin(ph)*Math.cos(th); pos[i*3+1]=r*Math.sin(ph)*Math.sin(th); pos[i*3+2]=r*Math.cos(ph)-2;
  }
  g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const m=new THREE.PointsMaterial({color:0xc9a55e,size:0.03,sizeAttenuation:true,transparent:true,opacity:0.7,depthWrite:false});
  return new THREE.Points(g,m);
}

function initHero(){
  const canvas=document.getElementById('scene');
  if(REDUCED || !canvas || !window.THREE){ showFallback(); return; }
  let renderer;
  try{ renderer=new THREE.WebGLRenderer({canvas,antialias:!MOBILE,alpha:true,powerPreference:'high-performance'}); }
  catch(e){ showFallback(); return; }
  const tier=perfTier();
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,tier.dpr));
  renderer.setSize(innerWidth,innerHeight,false);
  renderer.setClearColor(0x000000,0);

  const scene=new THREE.Scene();
  const cam=new THREE.PerspectiveCamera(55,innerWidth/innerHeight,0.1,100);
  cam.position.set(0,0,6.2);
  const group=new THREE.Group(); scene.add(group);

  const orb1=makeOrb(2.9,tier.detail,0xe9a23b,0.26);
  const orb2=makeOrb(1.7,Math.max(1,tier.detail-1),0xff7a2b,0.16); orb2.position.set(1.6,-0.6,1.2);
  const field=makeField(tier.stars);
  group.add(orb1,orb2,field);
  const mats=[orb1.material,orb2.material];

  let tmx=0,tmy=0,mx=0,my=0;
  addEventListener('pointermove',e=>{tmx=e.clientX/innerWidth-0.5;tmy=e.clientY/innerHeight-0.5;},{passive:true});
  addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight,false);});

  let visible=true;
  if('IntersectionObserver' in window){ new IntersectionObserver(es=>visible=es[0].isIntersecting,{threshold:0.01}).observe(canvas); }
  let hidden=false; addEventListener('visibilitychange',()=>hidden=document.hidden);

  let last=performance.now(),acc=0,frames=0,low=0,stage=0;
  function frame(now){
    requestAnimationFrame(frame);
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    if(!visible||hidden) return;
    const t=now/1000;
    mats[0].uniforms.uTime.value=t; mats[1].uniforms.uTime.value=t*1.15;
    mx+=(tmx-mx)*0.04; my+=(tmy-my)*0.04;
    orb1.rotation.y+=dt*0.12; orb1.rotation.x+=dt*0.05;
    orb2.rotation.y-=dt*0.18; orb2.rotation.z+=dt*0.06;
    field.rotation.y+=dt*0.015;
    group.rotation.y=mx*0.5; group.rotation.x=my*0.4;
    cam.position.x=mx*1.1; cam.position.y=-my*0.8; cam.lookAt(0,0,0);
    renderer.render(scene,cam);
    acc+=dt; frames++;
    if(acc>=1.0){ const fps=frames/acc; acc=0; frames=0;
      if(fps<46) low++; else low=Math.max(0,low-1);
      if(low>=2&&stage<1){ stage=1; renderer.setPixelRatio(1.0); renderer.setSize(innerWidth,innerHeight,false); }
      else if(low>=4&&stage<2){ stage=2; showFallback(); }
    }
  }
  requestAnimationFrame(frame);
}

/* ---------- preloader ---------- */
function runPreloader(){
  const count=document.querySelector('.pl-count'),bar=document.querySelector('.pl-bar span'),o={v:0};
  gsap.to(o,{v:100,duration:1.2,ease:'power2.inOut',onUpdate(){count.textContent=Math.round(o.v);bar.style.width=o.v+'%';},onComplete(){
    gsap.to('.preloader',{yPercent:-100,duration:.9,ease:'power4.inOut',onComplete(){document.querySelector('.preloader').style.display='none';document.body.classList.remove('loading');}});
  }});
}

/* ---------- animations ---------- */
function initAnimations(){
  gsap.registerPlugin(ScrollTrigger);
  let lenis;
  if(window.Lenis && !REDUCED){lenis=new Lenis({lerp:.09,smoothWheel:true});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const id=a.getAttribute('href');if(id.length>1){e.preventDefault();const el=document.querySelector(id);if(el){lenis?lenis.scrollTo(el):el.scrollIntoView({behavior:'smooth'});}}}));

  const tl=gsap.timeline({defaults:{ease:'power4.out'}});
  tl.from('.hero .pill',{y:-16,opacity:0,duration:.7},.1)
    .from('.hero .eyebrow',{y:14,opacity:0,duration:.8},.2)
    .to('.hero h1 .line span',{y:0,duration:1.1,stagger:.12},.3)
    .from('.hero .tagline > div',{y:20,opacity:0,duration:.8,stagger:.1},.9)
    .from('.scroll-cue',{opacity:0,duration:.8},1.2);

  gsap.utils.toArray('.reveal').forEach(el=>{if(el.classList.contains('batch'))return;gsap.from(el,{y:46,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});});
  if(REDUCED){gsap.set('.batch',{opacity:1,y:0});}else{
    gsap.set('.batch',{y:58,opacity:0});
    ScrollTrigger.batch('.batch',{start:'top 90%',onEnter:b=>gsap.to(b,{y:0,opacity:1,duration:.9,ease:'power3.out',stagger:.12,overwrite:true})});
    gsap.utils.toArray('[data-parallax]').forEach(el=>{const amt=parseFloat(el.dataset.parallax)||-14;gsap.to(el,{yPercent:amt,ease:'none',scrollTrigger:{trigger:el.closest('.sec')||el,start:'top bottom',end:'bottom top',scrub:.5}});});
  }
  gsap.to('.marquee .track',{xPercent:-50,duration:22,ease:'none',repeat:-1});
  gsap.utils.toArray('[data-count]').forEach(el=>{const target=parseFloat(el.dataset.count),suf=el.dataset.suffix||'',o={v:0};ScrollTrigger.create({trigger:el,start:'top 88%',once:true,onEnter(){gsap.to(o,{v:target,duration:1.8,ease:'power2.out',onUpdate(){el.textContent=Math.round(o.v).toLocaleString()+suf;}});}});});
  gsap.to('.scrollbar',{width:'100%',ease:'none',scrollTrigger:{trigger:document.body,start:'top top',end:'bottom bottom',scrub:.3}});

  document.querySelectorAll('[data-tilt]').forEach(card=>{
    card.addEventListener('mousemove',e=>{const r=card.getBoundingClientRect();const px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;card.style.setProperty('--mx',px*100+'%');card.style.setProperty('--my',py*100+'%');card.style.transform=`perspective(800px) rotateX(${(py-.5)*-7}deg) rotateY(${(px-.5)*7}deg) translateY(-4px)`;});
    card.addEventListener('mouseleave',()=>card.style.transform='perspective(800px) rotateX(0) rotateY(0)');
  });
  document.querySelectorAll('.hero h1 .line span').forEach(sp=>{
    sp.addEventListener('mousemove',e=>{const r=sp.getBoundingClientRect();sp.style.setProperty('--sx',(e.clientX-r.left)+'px');sp.style.setProperty('--sy',(e.clientY-r.top)+'px');});
    sp.addEventListener('mouseleave',()=>{sp.style.setProperty('--sx','-999px');sp.style.setProperty('--sy','-999px');});
  });
  ScrollTrigger.refresh();
}

addEventListener('load',()=>{ initHero(); runPreloader(); initAnimations(); });
