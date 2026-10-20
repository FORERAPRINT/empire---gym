import {useEffect,useRef,useState} from 'react'
import {motion,AnimatePresence,useAnimation,useScroll,useSpring,useTransform,useReducedMotion} from 'framer-motion'
import Embers from './Embers.jsx'
import {TRAINERS} from './data/trainers.js'
import {T} from './data/i18n.js'

/* ====== EDIT HERE ====== */
const LOGO='/logo.png'
const PHONE='015 00969988'
const WHATSAPP='201500969988'            // international format, digits only
const MAP_Q='Empire+Gym+El+Sayouf+Alexandria'
const MAP=`https://www.google.com/maps/search/?api=1&query=${MAP_Q}`
const MAP_EMBED=`https://www.google.com/maps?q=${MAP_Q}&output=embed`
const HOURS={en:'',ar:''}                // opening hours, e.g. {en:'Daily 8 AM – 12 AM',ar:'يوميًا 8 ص – 12 م'}. Leave empty to hide.
const INSTAGRAM='https://www.instagram.com/empiregym.eg/'
const TIKTOK='https://www.tiktok.com/@empiregym.official'
const FACEBOOK='https://www.facebook.com/1047548508445717'
const GALLERY=[1,2,3,4,5,6,7,8].map(i=>`/gym/${i}.png`)   // real gym photos; add more files to public/gym/
const TAPS=5
const DEV_EMAIL='adelwalid2222012@gmail.com'   // web developer contact shown in the footer
const PHYSIO_PHONES=['01500969988','01505214433']   // Dr. Ahmed Tantawy booking lines
const toIntl=n=>'2'+n.replace(/\D/g,'')            // 01500969988 -> 201500969988
/* ======================= */

const Dumbbell=()=>(<svg viewBox="0 0 300 120" width="100%" aria-hidden="true">
  <defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#777"/><stop offset=".5" stop-color="#f4f4f4"/><stop offset="1" stop-color="#555"/></linearGradient></defs>
  <rect x="60" y="53" width="180" height="14" rx="4" fill="url(#m)"/>
  <rect x="18" y="38" width="22" height="44" rx="5" fill="#8d0400"/><rect x="40" y="22" width="22" height="76" rx="5" fill="#e10600"/><rect x="62" y="40" width="10" height="40" rx="3" fill="#bbb"/>
  <rect x="260" y="38" width="22" height="44" rx="5" fill="#8d0400"/><rect x="238" y="22" width="22" height="76" rx="5" fill="#e10600"/><rect x="228" y="40" width="10" height="40" rx="3" fill="#bbb"/></svg>)

/* Lift figures: each pose is a set of paths with identical structure so Framer can morph between them */
const S={stroke:'#f4f4f4',strokeWidth:6,strokeLinecap:'round',strokeLinejoin:'round',fill:'none'}
const useT=()=>({duration:useReducedMotion()?0:.25})
const P=({d,red})=><motion.path {...S} stroke={red?'#e10600':S.stroke} initial={false} animate={{d}} transition={useT()}/>
const Head=({x,y})=><motion.circle r="9" fill="#f4f4f4" initial={false} animate={{cx:x,cy:y}} transition={useT()}/>
const Fig=({children})=><svg viewBox="0 0 300 130" width="100%" aria-hidden="true">{children}</svg>
const Floor=()=><line x1="10" y1="114" x2="290" y2="114" stroke="#8d0400" strokeWidth="4" strokeLinecap="round"/>
const PushUp=({up})=><Fig><Floor/><P d={up?'M40 106 L130 86 L215 72':'M40 106 L130 100 L215 96'}/><P d={up?'M215 72 L217 90 L218 108':'M215 96 L200 104 L218 108'}/><Head x={236} y={up?64:88}/></Fig>
const Squat=({up})=><Fig><Floor/><P d={up?'M155 58 L128 92':'M150 36 L150 70'}/><P d={up?'M128 92 L176 90 L150 112':'M150 70 L154 92 L150 112'}/><P red d={up?'M120 54 L190 54':'M118 38 L182 38'}/><Head x={up?158:150} y={up?44:22}/></Fig>
const PullUp=({up})=><Fig><P red d="M80 30 L220 30"/><P d={up?'M125 30 L122 48 L146 44':'M125 30 L135 52 L146 74'}/><P d={up?'M175 30 L178 48 L154 44':'M175 30 L165 52 L154 74'}/><P d={up?'M150 44 L150 70':'M150 74 L150 100'}/><P d={up?'M150 70 L142 96 M150 70 L158 96':'M150 100 L142 126 M150 100 L158 126'}/><Head x={150} y={up?26:62}/></Fig>
const Deadlift=({up})=><Fig><Floor/><P d={up?'M140 112 L140 90 L138 66':'M140 112 L150 92 L112 80'}/><P d={up?'M138 66 L140 40':'M112 80 L160 66'}/><P d={up?'M140 40 L146 70':'M160 66 L166 102'}/><motion.circle r="11" fill="#e10600" initial={false} animate={{cx:up?146:166,cy:up?70:102}} transition={useT()}/><Head x={up?142:176} y={up?26:60}/></Fig>
const ART={dumbbell:()=><Dumbbell/>,pushup:PushUp,squat:Squat,pullup:PullUp,deadlift:Deadlift}
const IDS=Object.keys(ART)
const reveal={initial:{opacity:0,y:40},whileInView:{opacity:1,y:0},viewport:{once:true,margin:'-80px'},transition:{duration:.7}}
const H2=({children})=><motion.h2 {...reveal} className="h2">{children}<motion.i className="uline" initial={{scaleX:0}} whileInView={{scaleX:1}} viewport={{once:true}} transition={{duration:.8,delay:.3}}/></motion.h2>

function Challenge({t}){
  const [n,setN]=useState(0),[e,setE]=useState(0),c=useAnimation(),done=n>=TAPS,id=IDS[e],Art=ART[id]
  const pick=i=>{setE(i);setN(0)}
  const tap=ev=>{if(done)return
    const r=ev.currentTarget.getBoundingClientRect()
    dispatchEvent(new CustomEvent('burst',{detail:{cx:r.left+r.width/2,cy:r.top+r.height/2}}))
    const k=n+1;setN(k)
    c.start({rotate:[0,-10,8,-4,0],scale:[1,1.1+k*.03,1],transition:{duration:.35}})
    if(k>=TAPS)for(let i=0;i<4;i++)setTimeout(()=>dispatchEvent(new CustomEvent('burst',{detail:{cx:r.left+r.width/2,cy:r.top+r.height/2}})),i*150)}
  return(<section className="sec challenge" id="challenge"><div className="smoke"/><Embers count={30}/>
    <div className="ch-in">
      <motion.h2 {...reveal}>{t.chH}</motion.h2>
      <div className="exs" role="group" aria-label={t.chGroup}>{IDS.map((x,i)=><button key={x} aria-pressed={i===e} onClick={()=>pick(i)}>{t.ex[x][0]}</button>)}</div>
      <p className="hint">{done?t.ready:`${t.ex[id][1]} ${t.more(TAPS-n)}`}</p>
      <AnimatePresence mode="wait">
        {done?<motion.div key="p" initial={{scale:.3,opacity:0}} animate={{scale:1,opacity:1}} transition={{type:'spring',stiffness:200,damping:12}}><h3 className="perfect">{t.perfect}</h3><div className="row center"><a className="btn" href="#contact">{t.join}</a><button className="btn ghost" onClick={()=>setN(0)}>{t.again}</button></div></motion.div>
        :<motion.button key={'d'+e} className="dumbbell" onClick={tap} animate={c} exit={{opacity:0,scale:.6}} aria-label={t.ex[id][1]}><Art up={n%2===1}/></motion.button>}
      </AnimatePresence>
      <div className="dots">{Array.from({length:TAPS}).map((_,i)=><i key={i} className={i<n?'on':''}/>)}</div>
    </div></section>)
}

/* ===== Splash: small logo, then the site opens right away ===== */
function Splash({done}){
  useEffect(()=>{const id=setTimeout(done,1100);return()=>clearTimeout(id)},[])
  return(<motion.div className="splash" onClick={done} exit={{opacity:0}} transition={{duration:.45}} aria-hidden="true">
    <motion.div className="splash-logo" initial={{scale:.5,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.5,ease:[.2,.8,.2,1]}}>
      <i className="ring"/><img src={LOGO} alt=""/></motion.div>
    <motion.i className="splash-bar" initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:1,ease:'easeInOut'}}/></motion.div>)
}

/* ===== Home video (hero) ===== */
function HeroVideo({t}){
  const v=useRef(),[muted,setMuted]=useState(true)
  const toggle=()=>{const el=v.current;if(!el)return;el.muted=!el.muted;setMuted(el.muted);if(!el.muted)el.play().catch(()=>{})}
  return(<motion.div className="hero-video" initial={{opacity:0,scale:.9,rotate:2}} animate={{opacity:1,scale:1,rotate:0}} transition={{duration:.9,delay:.5}}>
    <video ref={v} src="/video/intro.mp4" poster="/video/intro-poster.jpg" autoPlay muted loop playsInline preload="auto" aria-label={t.videoLabel}/>
    <button className="intro-btn" onClick={toggle} aria-label={muted?t.soundOn:t.soundOff}>{muted?t.soundOn:t.soundOff}</button>
  </motion.div>)
}

const ABOUT_SRC=[['/about/team.png','wide'],['/about/jacuzzi.png',''],['/about/spa.png','']]

function Lightbox({i,set,t}){
  useEffect(()=>{if(i==null)return
    const k=e=>{if(e.key==='Escape')set(null);if(e.key==='ArrowRight')set((i+1)%GALLERY.length);if(e.key==='ArrowLeft')set((i-1+GALLERY.length)%GALLERY.length)}
    addEventListener('keydown',k);return()=>removeEventListener('keydown',k)},[i])
  return(<AnimatePresence>{i!=null&&<motion.div className="lb" role="dialog" aria-modal="true" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>set(null)}>
    <motion.img key={i} src={GALLERY[i]} alt={t.galAlt} initial={{scale:.92,opacity:0}} animate={{scale:1,opacity:1}} onClick={e=>e.stopPropagation()}/>
    <button className="lb-x" onClick={()=>set(null)} aria-label={t.close}>✕</button>
    <button className="lb-n prev" onClick={e=>{e.stopPropagation();set((i-1+GALLERY.length)%GALLERY.length)}} aria-label={t.prev}>‹</button>
    <button className="lb-n next" onClick={e=>{e.stopPropagation();set((i+1)%GALLERY.length)}} aria-label={t.next}>›</button></motion.div>}</AnimatePresence>)
}

function Bmi({t}){
  const [h,setH]=useState(''),[w,setW]=useState('')
  const b=h>0&&w>0?w/((h/100)**2):0,cat=b<18.5?0:b<25?1:b<30?2:3,pos=Math.min(Math.max((b-15)/25,0),1)*100
  return(<section className="sec bmi" id="bmi"><H2>{t.bmiH}</H2>
    <div className="bmi-box"><div className="bmi-in"><input type="number" inputMode="decimal" min="0" placeholder={t.height} aria-label={t.height} value={h} onChange={e=>setH(e.target.value)}/><input type="number" inputMode="decimal" min="0" placeholder={t.weight} aria-label={t.weight} value={w} onChange={e=>setW(e.target.value)}/></div>
      <div className="bmi-bar"><motion.span animate={{insetInlineStart:b?pos+'%':'0%'}} transition={{type:'spring',stiffness:120,damping:16}} style={{opacity:b?1:0}}/></div>
      <p className="bmi-res" aria-live="polite">{b?<>{t.bmiRes}: <b>{b.toFixed(1)}</b> · {t.bmiCat[cat]}</>:'\u00a0'}</p><p className="note-s">{t.bmiNote}</p></div></section>)
}

function Site({lang,setLang}){
  const t=T[lang],hero=useRef(),{scrollYProgress:p}=useScroll({target:hero,offset:['start start','end start']}),{scrollYProgress:all}=useScroll(),bar=useSpring(all,{stiffness:120,damping:24})
  const yText=useTransform(p,[0,1],[0,160]),yMark=useTransform(p,[0,1],[0,-120]),op=useTransform(p,[0,.8],[1,0])
  const [f,setF]=useState({name:'',phone:'',plan:0}),[lb,setLb]=useState(null)
  const send=e=>{e.preventDefault()
    const m=`${t.waMsg}%0A${t.waName}: ${encodeURIComponent(f.name)}%0A${t.waPhone}: ${encodeURIComponent(f.phone)}%0A${t.waPlan}: ${encodeURIComponent(t.plans[f.plan][0])}`
    window.open(`https://wa.me/${WHATSAPP}?text=${m}`,'_blank')}
  const socials=[['Instagram',INSTAGRAM],['TikTok',TIKTOK],['Facebook',FACEBOOK]].filter(s=>s[1])
  const hours=HOURS[lang]
  const nav=['about','classes','trainers','physio','plans','gallery','contact']
  return(<>
    <motion.i className="progress" style={{scaleX:bar}}/>
    <header className="nav"><a href="#top" className="brand"><img src={LOGO} alt=""/><span>EMPIRE GYM</span></a>
      <nav>{nav.map(k=><a key={k} href={'#'+k}>{t.nav[k]}</a>)}</nav>
      <button className="lang" onClick={()=>setLang(lang==='en'?'ar':'en')} aria-label={t.langLabel}>{t.langBtn}</button></header>
    <section className="hero" id="top" ref={hero}>
      <div className="smoke"/><Embers count={60}/>
      <motion.img src={LOGO} alt="" className="watermark" style={{y:yMark}}/>
      <motion.div style={{y:yText,opacity:op}} className="hero-in">
        <h1>{t.h1.map((line,li)=><span className={'ln'+(li?' red':'')} key={li}>{line.split(' ').map((w,i)=><span className="wm" key={i}><motion.span className="w" initial={{y:'115%'}} animate={{y:0}} transition={{duration:.85,delay:.15+li*.25+i*.1,ease:[.2,.8,.2,1]}}>{w}</motion.span></span>)}</span>)}</h1>
        <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.7}}>{t.p1}</motion.p>
        <motion.p className="legacy" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.85}}>{t.legacy}</motion.p>
        <motion.div className="row" initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:1}}><a className="btn" href="#contact">{t.join}</a><a className="btn ghost" href="#plans">{t.see}</a></motion.div>
      </motion.div>
      <HeroVideo t={t}/></section>
    <div className="marquee" aria-hidden="true"><div>{Array(6).fill(t.marquee).join('')}</div></div>

    <section id="about" className="sec"><H2>{t.aboutH}</H2>
      <div className="about">
        <div className="about-copy">
          <motion.p {...reveal} className="lead">{t.lead}</motion.p>
          <div className="benefits">{t.benefits.map(([ti,d],i)=><motion.div {...reveal} transition={{duration:.6,delay:i*.06}} className="benefit" key={ti}><span className="num">{String(i+1).padStart(2,'0')}</span><div><h3>{ti}</h3><p>{d}</p></div></motion.div>)}</div>
        </div>
        <div className="about-photos">{ABOUT_SRC.map(([src,cls],i)=><motion.div {...reveal} className={'zoom '+cls} key={src}><img src={src} alt={t.photos[i]} loading="lazy"/></motion.div>)}</div>
      </div></section>

    <Challenge t={t}/>

    <section id="services" className="sec"><H2>{t.svcH}</H2>
      <div className="grid">{t.svc.map(([ti,d],i)=><motion.div {...reveal} transition={{duration:.6,delay:i*.08}} className="card" key={ti}><h3>{ti}</h3><p>{d}</p></motion.div>)}</div></section>

    <section id="classes" className="sec alt"><H2>{t.clsH}</H2>
      <div className="grid three">{t.cls.map((c,i)=><motion.div {...reveal} transition={{duration:.6,delay:i*.1}} className="card cls" key={c.n}><h3>{c.n}</h3>
        <p><b>{t.with}</b> {c.c}</p><p><b>{t.days}</b> {c.d}</p><p><b>{t.time}</b> {c.t}</p>{c.note&&<em className="tag">{c.note}</em>}</motion.div>)}</div></section>

    <section id="trainers" className="sec alt"><H2>{t.trH}</H2>
      <div className="grid trainers">{TRAINERS.map((c,i)=><motion.figure {...reveal} transition={{duration:.6,delay:(i%4)*.08}} className="trainer" key={c.name}>
        {c.photo?<img src={c.photo} alt={c.name} loading="lazy"/>:<div className="avatar" aria-hidden="true"><img src={LOGO} alt=""/><b>{c.name.replace('C. ','')[0]}</b></div>}
        <figcaption><span className="tname">{c.name}</span>{c.role&&<span className="role">{t.roles[c.role]}</span>}</figcaption></motion.figure>)}</div></section>

    <section id="physio" className="sec"><H2>{t.phH}</H2>
      <div className="physio">
        <motion.img {...reveal} src="/about/physio.png" alt={t.phName} loading="lazy"/>
        <motion.div {...reveal} className="physio-txt">
          <h3>{t.phName}</h3>
          <p className="sub">{t.phSub}</p>
          <p className="lbl">{t.phLbl}</p>
          <ul>{t.phList.map(x=><li key={x}>{x}</li>)}</ul>
          <p className="book">{t.phBook}</p>
          <p className="lbl">{t.phCall}</p>
          <div className="phones">{PHYSIO_PHONES.map(n=><a key={n} className="tel sm" dir="ltr" href={`tel:+${toIntl(n)}`}>{n}</a>)}</div>
          <a className="btn" href={`https://wa.me/${toIntl(PHYSIO_PHONES[0])}?text=${encodeURIComponent(t.phMsg)}`} target="_blank" rel="noreferrer">{t.phWa}</a>
        </motion.div>
      </div></section>

    <section id="plans" className="sec alt"><H2>{t.plH}</H2>
      <div className="grid three">{t.plans.map(([ti,d],i)=><motion.div {...reveal} transition={{duration:.6,delay:i*.1}} className={'card plan'+(i===1?' hot':'')} key={ti}><h3>{ti}</h3><p>{d}</p><strong>{t.price}</strong><a className="btn small" href="#contact" onClick={()=>setF(x=>({...x,plan:i}))}>{t.choose} {ti}</a></motion.div>)}</div></section>

    <section id="gallery" className="sec"><H2>{t.galH}</H2>
      <div className="gal">{GALLERY.map((s,i)=><motion.button {...reveal} transition={{duration:.6,delay:(i%4)*.07}} key={s} className="zoom gbtn" onClick={()=>setLb(i)} aria-label={`${t.galAlt} ${i+1}`}><img src={s} alt={t.galAlt} loading="lazy"/></motion.button>)}</div>
      <Lightbox i={lb} set={setLb} t={t}/></section>

    <Bmi t={t}/>

    <section id="contact" className="sec alt"><H2>{t.ctH}</H2>
      <div className="contact">
        <div><p className="addr">{t.addr}</p><p><a className="tel" dir="ltr" href={`tel:+${WHATSAPP}`}>{PHONE}</a></p>
          {hours&&<p className="addr"><b>{t.hours}:</b> {hours}</p>}
          <a className="btn small ghost" href={MAP} target="_blank" rel="noreferrer">{t.maps}</a>
          <p>{socials.map(([n,u])=><a key={n} className="soc" href={u} target="_blank" rel="noreferrer">{n}</a>)}</p></div>
        <form onSubmit={send}>
          <input required placeholder={t.name} value={f.name} onChange={e=>setF({...f,name:e.target.value})}/>
          <input required placeholder={t.phone} inputMode="tel" value={f.phone} onChange={e=>setF({...f,phone:e.target.value})}/>
          <select value={f.plan} onChange={e=>setF({...f,plan:+e.target.value})}>{t.plans.map(([ti],i)=><option key={ti} value={i}>{ti}</option>)}</select>
          <button className="btn">{t.sendWa}</button></form></div>
      <motion.div {...reveal} className="map"><iframe title="Empire Gym map" src={MAP_EMBED} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen/></motion.div></section>
    <footer><img src={LOGO} alt=""/><span>{t.foot}</span><span className="dev">{t.dev} <a href={`mailto:${DEV_EMAIL}`}>{DEV_EMAIL}</a></span></footer>
    <a className="wa-float" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label={t.waFloat}><svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M16 4a12 12 0 0 0-10.3 18L4 28l6.2-1.6A12 12 0 1 0 16 4z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round"/><path d="M12.200 10c-.7 0-1.500.900-1.500 2.100 0 3.600 4.800 8.300 8.600 8.300 1.100 0 2-.8 2-1.500l-2.300-1.300-1.300 1.100c-1.700-.6-3-1.900-3.600-3.600l1.100-1.300z" fill="#fff"/></svg></a>
  </>)
}

export default function App(){
  const [lang,setLang]=useState(()=>{try{return localStorage.getItem('lang')||((navigator.language||'').slice(0,2)==='ar'?'ar':'en')}catch{return 'en'}})
  const [go,setGo]=useState(false)
  useEffect(()=>{const t=T[lang];document.documentElement.lang=t.lang;document.documentElement.dir=t.dir;try{localStorage.setItem('lang',lang)}catch{}},[lang])
  return(<><AnimatePresence>{!go&&<Splash key="s" done={()=>setGo(true)}/>}</AnimatePresence>{go&&<Site lang={lang} setLang={setLang}/>}</>)
}
