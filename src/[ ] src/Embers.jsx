import {useEffect,useRef} from 'react'
export default function Embers({count=70,className=''}){
  const ref=useRef()
  useEffect(()=>{
    const cv=ref.current,x=cv.getContext('2d');let w,h,raf
    const size=()=>{w=cv.width=cv.offsetWidth;h=cv.height=cv.offsetHeight};size();addEventListener('resize',size)
    const mk=(y)=>({x:Math.random()*w,y:y??h+Math.random()*h,r:Math.random()*2.2+.6,v:Math.random()*1+.4,d:Math.random()*2-1,a:Math.random()*.7+.3})
    let ps=Array.from({length:count},()=>mk(Math.random()*h))
    const burst=e=>{const r=cv.getBoundingClientRect(),cx=e.detail.cx-r.left,cy=e.detail.cy-r.top;for(let k=0;k<40;k++){const a=Math.random()*6.28,s=Math.random()*5+2;ps.push({x:cx,y:cy,r:Math.random()*2.5+1,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,a:1,life:1})}}
    addEventListener('burst',burst)
    const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches
    const tick=()=>{x.clearRect(0,0,w,h)
      ps=ps.filter(p=>!p.life||p.life>0)
      for(const p of ps){
        if(p.life){p.x+=p.vx;p.y+=p.vy;p.vy+=.12;p.life-=.02;p.a=p.life}else{p.y-=p.v;p.x+=p.d*.4;if(p.y<-10)Object.assign(p,mk())}
        x.beginPath();x.fillStyle=`rgba(${p.life?255:225},${p.life?120:30},0,${Math.max(p.a,0)})`;x.shadowColor='#e10600';x.shadowBlur=10;x.arc(p.x,p.y,p.r,0,6.28);x.fill()}
      if(!reduce)raf=requestAnimationFrame(tick)}
    tick()
    return()=>{cancelAnimationFrame(raf);removeEventListener('resize',size);removeEventListener('burst',burst)}
  },[count])
  return <canvas ref={ref} className={'embers '+className} aria-hidden="true"/>
}
