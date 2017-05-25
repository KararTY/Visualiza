'use strict'
/* global p5, soundcloudURL, CLIENT_ID, SC */
// P5js (Processing in javascript)
let P5 = p5

// Debugging globals.
// song is the audio object. Use song.pause(), song.stop(), song.play().
let song
// Debug fft (Fast fourier transform).
let fft
// Debug amp (Amplitude).
let amp
// Peak detection for plexus.
let peakDetect

// Debug boolean - Make this true in browser console to see debug text on canvas.
let debug = false

// Plexus from https://www.openprocessing.org/sketch/155371 .
let p = []
let spring = 0.0000001

let number = 100
let lineAlpha = 0
let peakCounter = 0

// Input events.
let togglePlaybtn = document.getElementById('togglePlay')
let volSliderbtn = document.getElementById('vSlider')

// DOM's.
let songTitle = document.getElementById('title')
let loadingTitle = document.getElementById('loading')
let container = document.getElementById('visContainer')
let overlay = document.getElementById('overlay')
let purchaseUrl = document.getElementById('purchase_url')
let artworkUrl = document.getElementById('artwork_url')

container.style.visibility = 'hidden'

// P5js sketch
let sketch = (track) => {
  if (track) var streamUrl = track.stream_url + '?client_id=' + CLIENT_ID
  /** P5js instance (All P5 stuff run only in here so global isn't cluttered.
   *  Except those made global (amp, fft, song) */
  let vis = (vis) => {
    // Plexus Particle Class.
    class Particle {
      constructor (x, y, r) {
        this.x = x
        this.y = y
        this.r = r
        this.alpha = 0
      }
      display (alpha) {
        if (alpha) {
          this.alpha = alpha
          vis.fill(44, 62, 80, alpha)
        } else {
          this.alpha = 0
          vis.fill(44, 62, 80)
        }
        vis.noStroke()
        vis.ellipse(this.x, this.y, this.r, this.r)
      }
      move (vx, vy) {
        this.x += vx
        this.y += vy
      }
    }

    // Lines object.
    let springTo = (p1, p2, color) => {
      this.dx = p2.x - p1.x
      this.dy = p2.y - p1.y
      this.dist = Math.sqrt(this.dx * this.dx + this.dy * this.dy)
      if (this.dist < 100) {
        this.ax = this.dx * spring
        this.ay = this.dy * spring
        // this.alpha = 10 + (this.dist / 100) * 200

        p1.vx += this.ax
        p1.vy += this.ay
        p2.vx -= this.ax
        p2.vy -= this.ay
        vis.strokeWeight(1)
        vis.stroke(52, 73, 94, color)
        vis.line(p1.x, p1.y, p2.x, p2.y)
      }
    }

    // Preload song.
    vis.preload = () => {
      if (track) song = vis.loadSound(streamUrl)
      else song = vis.loadSound('/music/Karetus-Full_Flavor.mp3')
    }

    // Setup visuals.
    vis.setup = () => {
      vis.createCanvas(window.innerWidth, window.innerHeight - document.getElementsByClassName('hero')[0].offsetHeight)
      vis.colorMode(vis.RGB)
      // Basically the angle... I don't even.
      vis.angleMode(vis.DEGREES)
      // Create FFT object for display of the lines.
      fft = new P5.FFT(0.8, 1024)
      // Create AMP object for display of the dots.
      amp = new P5.Amplitude()
      peakDetect = new P5.PeakDetect(20, 20000, 0.35, 1)
      // Create plexuses.
      for (let i = 0; i < 100; i++) {
        p[i] = new Particle(vis.random(vis.width), vis.random(vis.height), 5)
        p[i].vx = vis.random(-3, 3)
        p[i].vy = vis.random(-3, 3)
      }
      // Play song.
      song.play()
      // Show play, volume buttons. TODO: If this list becomes more than 3, just make a loop.
      container.style.visibility = 'visible'
      volSliderbtn.style.visibility = 'visible'
      togglePlaybtn.style.visibility = 'visible'
      songTitle.style.visibility = 'visible'
      overlay.style.visibility = 'visible'
      loadingTitle.style.display = 'none'
      // Input handler for togglePlaybtn.
      togglePlaybtn.addEventListener('click', () => {
        if (song.isPlaying()) {
          togglePlaybtn.innerHTML = '<span class="icon"><i class="fa fa-play"></i></span>'
          song.pause()
        } else {
          togglePlaybtn.innerHTML = '<span class="icon"><i class="fa fa-pause"></i></span>'
          song.play()
        }
      })
    }

    // Draw TODO: Force 60 FPS?
    vis.draw = () => {
      // Make sure volume equal the slider thingy input on the DOM.
      song.setVolume(Number(volSliderbtn.value))
      // Spectrum, just analyze the fft object.
      let spectrum = fft.analyze()
      // Get the current amp level.
      let level = amp.getLevel()
      // Peak detection.
      peakDetect.update(fft)
      // White background.
      vis.background(255, 255, 255)
      // Depending on peakDetection, do alpha stuff.
      if (peakDetect.isDetected) {
        // triggered = true
        peakCounter++
        number = 100
      } else {
        if (number > 1) {
          number -= 6
          lineAlpha = number
        }
      }
      // Dots.
      for (let i = 0; i < p.length; i++) {
        p[i].x += p[i].vx
        p[i].y += p[i].vy
        if (p[i].x < 0) p[i].x = vis.width
        else if (p[i].x > vis.width) p[i].x = 0
        if (p[i].y < 0) p[i].y = vis.height
        else if (p[i].y > vis.height) p[i].y = 0
        // We don't need to draw anything unless alpha is above 0.
        if (lineAlpha > 0) {
          // Display lines.
          for (let j = i + 1; j < p.length; j++) {
            springTo(p[i], p[j], lineAlpha)
          }
        }
        // Display dots.
        if (((level * 180) + 10) > 11) {
          p[i].display((level * 180) + 10)
        }
      }
      if (debug) {
        // Fill for text.
        vis.fill(52, 73, 94)
        vis.text('Peaks: ' + peakCounter, 10, 30)
        vis.text('Volume: ' + level, 10, 50) // Display amp level.
        vis.text((level * 180) + 10, 10, 70) // Display opacity for the dots. 100 means fully visible.
        vis.text(lineAlpha, 10, 90)
        vis.text(number, 10, 110)
      }
      // Fill
      vis.fill(52, 73, 94)
      // Start shape.
      vis.beginShape()
      // Translate (resize) the object to canvas height/width divided by 2.
      vis.translate(vis.width / 2, vis.height / 2)
      // Skips really loud stuff in the beginning.
      let skip = Math.round(spectrum.length / 64)
      // Start the shape. We're not drawing individual lines, but the whole shape.
      // Loopedi-loop-de-do.
      for (let i = skip; i < spectrum.length; i++) {
        let e = i
        let angle = vis.map(e, 0, spectrum.length - skip, 0, 360)
        if (i > (spectrum.length / 2) + skip) e = vis.map(spectrum.length - i, spectrum.length / 2, 0, 0, spectrum.length / 2)
        let fftAmp = spectrum[e]
        let r = vis.map(fftAmp, 0, spectrum.length, 120, 300)
        let x = r * vis.cos(angle)
        let y = r * vis.sin(angle)
        vis.vertex(x, y)
      }
      vis.endShape()
      // End shape.
    }
  }

  // Put it in the div in the div div.
  let visContainer = new P5(vis, 'visContainer')
}

/** Check if user requested an external song or otherwise just
 *  load sketch with empty track (From static file-serve). */
if (soundcloudURL) {
  // SoundCloud object.
  let sc = SC
  sc.initialize({
    client_id: CLIENT_ID // Is sent from the server. TODO: Hide it from client somehow?
  })

  // Resolve track url using SoundCloud API
  sc.resolve(soundcloudURL).then(track => {
    if (track.errors) return console.log(track.errors)
    // title
    songTitle.innerHTML = `<a href="${track.permalink_url}">(${track.user.username}) ${track.title}</a>`
    // purchase_url
    if (track.purchase_url) purchaseUrl.href = track.purchase_url
    else purchaseUrl.style.visibility = 'hidden'
    // artwork_url
    if (track.artwork_url) artworkUrl.src = track.artwork_url
    else artworkUrl.style.visibility = 'hidden'
    console.log('Type "debug = true" to show debug.')
    return sketch(track)
  }).catch(err => {
    loadingTitle.innerHTML = `<h1>Soundcloud API replied with an error</h1><p>${JSON.stringify(err)}</p>`
  })
} else {
  songTitle.innerText = `(Karetus) Full Flavor`
  console.log('Type "debug = true" to show debug.')
  sketch()
}
