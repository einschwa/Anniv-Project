/* Shared script for anniversary site */
document.addEventListener('DOMContentLoaded',()=>{
  // Projector intro
  const projector = document.querySelector('.projector')
  const beam = document.querySelector('.projector .beam')
  const title = document.querySelector('.projector .title')
  const audio = document.getElementById('proj-audio')
  let introDone=false
  function playIntro(){
    if(introDone) return
    introDone=true
    projector.classList.remove('hidden')
    // animate beam and title
    requestAnimationFrame(()=>{
      beam.style.opacity=1;beam.style.transform='scale(1) rotate(0)'
      title.style.opacity=1;title.style.transform='translateY(0)'
    })
    if(audio){audio.play().catch(()=>{/*autoplay may be blocked*/})}
    setTimeout(()=>{projector.classList.add('hidden')},4200)
  }
  // small button to start intro if user clicks anywhere
  document.body.addEventListener('click',playIntro,{once:true})

  // Polaroid modal
  document.querySelectorAll('.polaroid').forEach(p=>{
    p.addEventListener('click',()=>{
      const src=p.dataset.src
      const caption=p.dataset.caption||''
      const modal=document.getElementById('photo-modal')
      modal.querySelector('img').src=src
      modal.querySelector('.caption').textContent=caption
      modal.classList.add('open')
      // animate little shake
      modal.querySelector('.photo').animate([{transform:'translateY(0)'},{transform:'translateY(-6px)'},{transform:'translateY(0)'}],{duration:380})
    })
  })
  document.querySelectorAll('.modal .close').forEach(b=>b.addEventListener('click',()=>b.closest('.modal').classList.remove('open')))

  // envelope open
  const env = document.querySelector('.envelope')
  if(env){
    env.addEventListener('click',()=>{
      env.classList.add('open')
      const flap = env.querySelector('.flap')
      flap.style.transform = 'translateY(-50%) rotateX(-130deg)'
      setTimeout(()=>{
        const modal=document.getElementById('letter-modal')
        modal.classList.add('open')
      },620)
    })
  }

  // simple quiz
  const quiz = document.getElementById('quiz')
  if(quiz){
    quiz.addEventListener('submit',e=>{
      e.preventDefault()
      const correct=Array.from(quiz.querySelectorAll('input[data-correct="true"]')).map(i=>i.value)
      let score=0
      quiz.querySelectorAll('input[type=radio]:checked').forEach(r=>{ if(r.dataset.correct==='true') score++ })
      const out=quiz.querySelector('.result')
      out.textContent=`Skor: ${score}/${quiz.dataset.total}`
      // little reward animation
      const heart=document.createElement('div')
      heart.textContent='❤️'
      heart.style.position='fixed';heart.style.left='50%';heart.style.top='20%';heart.style.transform='translateX(-50%)';heart.style.fontSize='32px';heart.style.zIndex=100
      document.body.appendChild(heart)
      heart.animate([{opacity:1,transform:'translateY(0)'},{opacity:0,transform:'translateY(-120px)'}],{duration:1200}).onfinish=()=>heart.remove()
    })
  }

  // mini puzzle (drag to reorder simple)
  const puzzle = document.getElementById('puzzle')
  if(puzzle){
    // very small swap puzzle
    puzzle.querySelectorAll('.piece').forEach(piece=>{
      piece.draggable=true
      piece.addEventListener('dragstart',e=>{ e.dataTransfer.setData('text/plain',piece.dataset.idx) })
    })
    puzzle.addEventListener('dragover',e=>e.preventDefault())
    puzzle.addEventListener('drop',e=>{
      e.preventDefault();
      const from = e.dataTransfer.getData('text/plain')
      const toEl = e.target.closest('.piece')
      if(!toEl) return
      const to = toEl.dataset.idx
      const fromEl = puzzle.querySelector(`.piece[data-idx="${from}"]`)
      // swap images
      const tmp = fromEl.innerHTML
      fromEl.innerHTML = toEl.innerHTML
      toEl.innerHTML = tmp
      checkPuzzle()
    })
    function checkPuzzle(){
      const ok = Array.from(puzzle.querySelectorAll('.piece')).every((ps,i)=>ps.dataset.correct===ps.dataset.idx)
      if(ok){
        const msg=document.createElement('div');msg.textContent='Berhasil!';msg.style.position='fixed';msg.style.left='50%';msg.style.top='40%';msg.style.transform='translateX(-50%)';msg.style.zIndex=110;msg.style.padding='12px 18px';msg.style.borderRadius='8px';msg.style.background='rgba(255,255,255,0.06)'
        document.body.appendChild(msg)
        setTimeout(()=>msg.remove(),1800)
      }
    }
  }

  // Login page handling
  const loginForm = document.getElementById('login-form')
  if(loginForm){
    loginForm.addEventListener('submit',e=>{
      e.preventDefault()
      const pw = loginForm.querySelector('input[name=password]').value.trim()
      if(pw==='21/10/23'){
        localStorage.setItem('anniv-unlocked','true')
        window.location.href='locked.html'
      } else if(pw==='Wyn'){
        localStorage.setItem('anniv-unlocked','true')
        localStorage.setItem('anniv-unlocked-time','true')
        window.location.href='ref.html'
      } else {
        alert('Kata sandi salah. Coba lagi :)')
      }
    })
  }

  // Locked page: countdown (read target from data-target DD/MM/YY, interpret as 20YY and set timezone to GMT+7)
  const cdEl = document.getElementById('countdown')
  const lockedPage = document.getElementById('locked-page')
  let targetDate = null
  if(lockedPage){
    const t = lockedPage.dataset.target || '21/10/25'
    const parts = t.split('/')
    // parts: DD,MM,YY -> build ISO string with +07:00
    if(parts.length===3){
      const dd = parts[0].padStart(2,'0')
      const mm = parts[1].padStart(2,'0')
      const yy = parts[2].length===2?('20'+parts[2]):parts[2]
      // Build a Date in timezone +07:00 by using UTC with offset
      // 21/10/25 00:00 WIB -> 2025-10-20T17:00:00Z (UTC)
      // create Date using Date.UTC for UTC and then subtract timezone offset
      // Simpler: create ISO string with timezone +07:00
      const iso = `${yy}-${mm}-${dd}T00:00:00+07:00`
      targetDate = new Date(iso)
    }
  }
  if(!targetDate) targetDate = new Date('2025-10-21T00:00:00+07:00')
  function updateCountdown(){
    const now = new Date()
    const diff = targetDate - now
    if(diff<=0){
      // unlocked -> show fireworks with a slight delay for smooth transition
      if(cdEl) cdEl.textContent='00:00:00:00'
      localStorage.setItem('anniv-unlocked-time','true')
      
      // Add a small delay before starting fireworks
      setTimeout(() => {
        // Unhide fireworks canvas and timer, start fireworks sequence
        const c = document.getElementById('fireworks'); if(c) c.classList.remove('hidden')
        const ft = document.getElementById('firework-timer'); if(ft) ft.classList.remove('hidden')
        // start fireworks for 30 seconds and show small countdown
        runFireworksWithTimer(30)
      }, 500) // 500ms delay
      
      // reveal link to site at end of fireworks (handled in runFireworksWithTimer)
      clearInterval(cdTimer)
      return
    }
    const days = Math.floor(diff / (1000*60*60*24))
    const hours = Math.floor((diff%(1000*60*60*24))/(1000*60*60))
    const mins = Math.floor((diff%(1000*60*60))/(1000*60))
    const secs = Math.floor((diff%(1000*60))/1000)
    if(cdEl) cdEl.textContent = `${String(days).padStart(2,'0')}:${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
  }
  let cdTimer = null
  if(document.getElementById('locked-page')){
    updateCountdown(); cdTimer=setInterval(updateCountdown,1000)
  }
  // Run fireworks for a given duration (seconds) with small timer and then transition to ref.html
  // Declare control flag early so other code can't access it before initialization
  let fireworksRunning = false
  function runFireworksWithTimer(seconds){
    console.log('Running fireworks timer...')
    if(fireworksRunning) {
      console.log('Fireworks timer already running')
      return
    }
    fireworksRunning=true
    
    const canvas = document.getElementById('fireworks')
    const timerEl = document.getElementById('firework-timer')
    
    if(!canvas) {
      console.error('Fireworks canvas element not found!')
      return
    }
    
    if(!timerEl) {
      console.error('Timer element not found!')
    }
    
    // Force display properties
    canvas.classList.remove('hidden')
    canvas.style.display = 'block'
    
    if(timerEl){
      timerEl.classList.remove('hidden')
      timerEl.style.display = 'block'
      timerEl.textContent = String(seconds)
    }
    
    // start fireworks engine
    console.log('Starting fireworks engine...')
    startFireworks()
    let remaining = seconds
    const tId = setInterval(()=>{
      remaining--
      if(timerEl) timerEl.textContent = String(remaining)
      if(remaining<=0){
        clearInterval(tId)
        // stop fireworks: hide canvas gradually and transition
        stopFireworks()
        const overlay = document.getElementById('fade-overlay')
        if(overlay) overlay.classList.add('show')
        // small delay to let fade play
        setTimeout(()=>{
          // redirect to landing (ref.html)
          window.location.href = 'ref.html'
        },1200)
      }
    },1000)
  }

  // IntersectionObserver reveal for .reveal elements
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ e.target.classList.add('visible'); observer.unobserve(e.target) }
    })
  },{threshold:0.2})
  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el))

  // Handwriting SVG animate when in view
  const hw = document.querySelector('.handwriting')
  if(hw){
    const ob2 = new IntersectionObserver((entries)=>{ if(entries[0].isIntersecting){ hw.classList.add('visible'); ob2.disconnect() } },{threshold:0.3})
    ob2.observe(hw)
  }

  // music toggle
  const musicToggle = document.createElement('button')
  musicToggle.className='music-toggle'
  musicToggle.textContent='♪'
  document.body.appendChild(musicToggle)
  let musicOn=false
  musicToggle.addEventListener('click',()=>{
    if(!audio) return
    if(musicOn){ audio.pause(); musicOn=false; musicToggle.style.opacity=0.7 }
    else { audio.play().catch(()=>{}); musicOn=true; musicToggle.style.opacity=1 }
  })

  // SFX toggle (for fireworks)
  const sfxToggle = document.createElement('button')
  sfxToggle.className='sfx-toggle'
  sfxToggle.textContent='SFX'
  sfxToggle.title = 'Toggle sound effects'
  document.body.appendChild(sfxToggle)
  let sfxOn = true
  sfxToggle.addEventListener('click',()=>{ sfxOn = !sfxOn; sfxToggle.classList.toggle('off', !sfxOn) })

  // WebAudio context and simple explosion synth
  let audioCtx = null
  function ensureAudioCtx(){ if(!audioCtx){ audioCtx = new (window.AudioContext||window.webkitAudioContext)() } return audioCtx }
  function playExplosion(time, xRatio){
    if(!sfxOn) return
    const ctx = ensureAudioCtx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.setValueAtTime(200 + Math.random()*800, time)
    o.frequency.exponentialRampToValueAtTime(40, time+0.6)
    g.gain.setValueAtTime(0.0001, time)
    g.gain.exponentialRampToValueAtTime(0.6, time+0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, time+0.9)
    const pan = ctx.createStereoPanner()
    pan.pan.value = (xRatio-0.5)*2
    o.connect(g); g.connect(pan); pan.connect(ctx.destination)
    o.start(time); o.stop(time+1.2)
  }

  // fireworks
  // Improved fireworks engine: rockets -> bursts with trails + glow
  let fireworksActive = false
  function startFireworks(){
    console.log('Starting fireworks...')
    if(fireworksActive) {
      console.log('Fireworks already active')
      return
    }
    
    const c = document.getElementById('fireworks')
    if(!c) {
      console.error('Fireworks canvas not found!')
      return
    }
    
    // Force canvas to be visible
    c.classList.remove('hidden')
    c.style.display = 'block'
    
    fireworksActive = true
    const ctx = c.getContext('2d')
    if(!ctx) {
      console.error('Could not get canvas context!')
      return
    }
    
    // Force canvas size update
    let W = c.width = window.innerWidth
    let H = c.height = window.innerHeight
    console.log(`Canvas size set to: ${W}x${H}`)
    
    function onResize(){ 
      W = c.width = window.innerWidth
      H = c.height = window.innerHeight
      console.log(`Canvas resized to: ${W}x${H}`)
    }
    window.addEventListener('resize', onResize)

    const rockets = []
    const particles = []
    function rand(a,b){return a+Math.random()*(b-a)}

    function spawnRocket(){
      const x = rand(W*0.2, W*0.8) // More centered spawning
      const hue = rand(0,360)
      const brightness = rand(50,80) // Variable brightness
      rockets.push({
        x, 
        y:H+10, 
        vx:rand(-1,1), 
        vy:rand(-15,-12), // Faster rockets
        life:0, 
        hue,
        brightness,
        size: rand(2,4) // Variable size
      })
    }

    function explode(x,y,hue){
      const count = (rand(100,200)|0) // More particles
      const particleHues = []
      // Create complementary colors
      for(let i=0; i<count; i++){
        particleHues.push(
          Math.random() < 0.5 ? 
          hue + rand(-15,15) : // Similar hue
          (hue + 180 + rand(-15,15)) % 360 // Complementary hue
        )
      }
      
      // Multiple explosion patterns
      const pattern = Math.random()
      for(let i=0;i<count;i++){
        let angle, speed
        if(pattern < 0.3){ // Circle
          angle = (i/count)*Math.PI*2
          speed = rand(3,7)
        } else if(pattern < 0.6){ // Double spiral
          angle = (i/count)*Math.PI*4 + Math.sin(i*0.1)
          speed = rand(2,6)
        } else { // Random scatter
          angle = Math.random()*Math.PI*2
          speed = rand(2,8)
        }
        
        particles.push({
          x, y,
          vx: Math.cos(angle)*speed,
          vy: Math.sin(angle)*speed,
          life: rand(60,140)|0, // Longer life
          age: 0,
          hue: particleHues[i],
          alpha: 1,
          size: rand(1.5,3.5), // Larger particles
          decay: rand(0.015,0.03) // Variable fade rate
        })
      }
      // play explosion sound
      try{ playExplosion(ensureAudioCtx().currentTime+0.02, x/W) } catch(e){}
    }

    function loop(){
      if(!fireworksActive){ 
        console.log('Fireworks stopped')
        ctx.clearRect(0,0,W,H)
        window.removeEventListener('resize', onResize)
        return 
      }

      // Clear and draw debug frame if no particles
      ctx.clearRect(0,0,W,H)
      if(rockets.length === 0 && particles.length === 0) {
        // Draw debug frame to ensure canvas is working
        ctx.strokeStyle = 'rgba(255,0,0,0.5)'
        ctx.strokeRect(0, 0, W, H)
      }
      // draw subtle background fade for motion trails
      ctx.fillStyle='rgba(0,0,0,0.18)'
      ctx.fillRect(0,0,W,H)

      // Draw background with fade effect
      ctx.fillStyle = 'rgba(0,0,0,0.15)' // Softer fade
      ctx.fillRect(0,0,W,H)

      // rockets
      if(Math.random()<0.1) spawnRocket() // Slightly more frequent
      for(let i=rockets.length-1;i>=0;i--){
        const r = rockets[i]
        r.vy += 0.12
        r.x += r.vx
        r.y += r.vy
        r.life++
        
        // Draw rocket glow
        const gradient = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.size * 4)
        gradient.addColorStop(0, `hsla(${r.hue},100%,${r.brightness}%,0.3)`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.size * 4, 0, Math.PI*2)
        ctx.fill()
        
        // Draw rocket core
        ctx.beginPath()
        ctx.fillStyle = `hsl(${r.hue},100%,${r.brightness}%)`
        ctx.arc(r.x, r.y, r.size, 0, Math.PI*2)
        ctx.fill()
        
        // Enhanced trail
        ctx.strokeStyle = `hsla(${r.hue},100%,${r.brightness}%,0.1)`
        ctx.lineWidth = r.size
        ctx.beginPath()
        ctx.moveTo(r.x - r.vx*5, r.y - r.vy*5)
        ctx.lineTo(r.x, r.y)
        ctx.stroke()
        
        if(r.vy > -2){ // explode when slowing
          explode(r.x, r.y, r.hue)
          rockets.splice(i,1)
        }
      }

      // particles
      ctx.globalCompositeOperation = 'lighter'
      for(let i=particles.length-1;i>=0;i--){
        const p = particles[i]
        p.age++
        p.vy += 0.02 // gravity
        p.x += p.vx
        p.y += p.vy
        p.vx *= 0.995
        p.vy *= 0.998
        p.alpha = Math.max(0, p.alpha - (p.decay || 0.02))
        
        // Particle glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
        gradient.addColorStop(0, `hsla(${p.hue},100%,70%,${p.alpha})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI*2)
        ctx.fill()
        
        // Particle core
        ctx.fillStyle = `hsla(${p.hue},100%,60%,${p.alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI*2)
        ctx.fill()
        
        // Sparkle effect
        if(Math.random() < 0.05 && p.alpha > 0.2){
          ctx.fillStyle = `rgba(255,255,255,${p.alpha * 0.3})`
          ctx.fillRect(p.x + rand(-2,2), p.y + rand(-2,2), 1, 1)
        }
        
        if(p.age > p.life || p.alpha <= 0) particles.splice(i,1)
      }

      ctx.globalCompositeOperation = 'source-over'
      requestAnimationFrame(loop)
    }
    loop()
  }
  function stopFireworks(){
    fireworksActive = false
  }

  // Expose test helper in console: runFireworksTest(seconds)
  window.runFireworksTest = function(seconds=6){
    setTimeout(() => {
      const ft = document.getElementById('firework-timer')
      if(ft){ ft.classList.remove('hidden'); ft.textContent = String(seconds) }
      const c = document.getElementById('fireworks'); if(c) c.classList.remove('hidden')
      runFireworksWithTimer(seconds)
    }, 500) // Same 500ms delay as the main implementation
  }

})
