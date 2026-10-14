document.addEventListener("DOMContentLoaded", function () {
  // ===== 1. Starfield Canvas =====
  const canvas = document.getElementById("starfield");
  const ctx = canvas.getContext("2d");

  let stars = [];
  let shootingStars = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
  }

  function initStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 3000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
      });
    }
  }

  function addShootingStar() {
    if (shootingStars.length < 2 && Math.random() < 0.015) {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.8,
        y: Math.random() * canvas.height * 0.4,
        length: Math.random() * 80 + 40,
        speed: Math.random() * 10 + 12,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
        opacity: 1,
      });
    }
  }

  function drawStarfield() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Subtle cosmic nebula glow
    const grad1 = ctx.createRadialGradient(
      canvas.width * 0.2, canvas.height * 0.8, 50,
      canvas.width * 0.2, canvas.height * 0.8, 400
    );
    grad1.addColorStop(0, "rgba(75, 0, 130, 0.08)");
    grad1.addColorStop(1, "transparent");
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const grad2 = ctx.createRadialGradient(
      canvas.width * 0.8, canvas.height * 0.2, 50,
      canvas.width * 0.8, canvas.height * 0.2, 500
    );
    grad2.addColorStop(0, "rgba(0, 102, 204, 0.07)");
    grad2.addColorStop(1, "transparent");
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    stars.forEach((star) => {
      star.alpha += star.twinkleSpeed;
      if (star.alpha > 1 || star.alpha < 0.2) {
        star.twinkleSpeed = -star.twinkleSpeed;
      }
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.abs(star.alpha)})`;
      ctx.fill();
    });

    // Shooting Stars
    addShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const s = shootingStars[i];
      const endX = s.x - Math.cos(s.angle) * s.length;
      const endY = s.y - Math.sin(s.angle) * s.length;

      const grad = ctx.createLinearGradient(s.x, s.y, endX, endY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
      grad.addColorStop(1, `rgba(255, 255, 255, 0)`);

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      s.x += Math.cos(s.angle) * s.speed;
      s.y += Math.sin(s.angle) * s.speed;
      s.opacity -= 0.02;

      if (s.opacity <= 0 || s.x > canvas.width || s.y > canvas.height) {
        shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(drawStarfield);
  }

  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();
  drawStarfield();

  // ===== 2. Solar System Controls & Speeds =====
  const orbitRings = document.querySelectorAll(".orbit-ring");
  const baseDurations = [6, 10, 15, 22, 38, 54, 72, 90]; // seconds for 1x speed

  let currentSpeed = 1;
  let isPaused = false;

  function updateSpeeds(multiplier) {
    currentSpeed = multiplier;
    orbitRings.forEach((ring, idx) => {
      const newDuration = baseDurations[idx] / multiplier;
      ring.style.animationDuration = `${newDuration}s`;
    });
  }

  const speedButtons = document.querySelectorAll(".speed-btn");
  speedButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      speedButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const speed = parseFloat(this.getAttribute("data-speed"));
      updateSpeeds(speed);
      if (isPaused) {
        togglePause();
      }
    });
  });

  const pauseBtn = document.getElementById("pause-btn");
  function togglePause() {
    isPaused = !isPaused;
    orbitRings.forEach((ring) => {
      ring.style.animationPlayState = isPaused ? "paused" : "running";
    });
    pauseBtn.textContent = isPaused ? "▶ Resume" : "⏸ Pause";
    pauseBtn.classList.toggle("active-toggle", isPaused);
  }
  pauseBtn.addEventListener("click", togglePause);

  // Toggle Orbits visibility
  const toggleOrbitsBtn = document.getElementById("toggle-orbits");
  toggleOrbitsBtn.addEventListener("click", function () {
    const isHidden = document.body.classList.toggle("hide-orbits");
    this.classList.toggle("active-toggle", !isHidden);
  });

  // Toggle Labels visibility
  const toggleLabelsBtn = document.getElementById("toggle-labels");
  toggleLabelsBtn.addEventListener("click", function () {
    const isHidden = document.body.classList.toggle("hide-labels");
    this.classList.toggle("active-toggle", !isHidden);
  });

  // ===== 3. Planet Knowledge Base =====
  const planetData = {
    sun: {
      name: "The Sun",
      type: "Yellow Dwarf Star (G2V)",
      icon: "☀️",
      distance: "0 km (Center)",
      period: "230M Years (Galactic)",
      diameter: "1,392,700 km",
      moons: "8 Planets, 5 Dwarfs",
      desc: "The heart of our Solar System, containing 99.86% of all mass in the system. Its core temperature reaches over 15 million degrees Celsius."
    },
    mercury: {
      name: "Mercury",
      type: "Terrestrial Planet",
      icon: "⚪",
      distance: "57.9M km",
      period: "88 Days",
      diameter: "4,879 km",
      moons: "0",
      desc: "The smallest planet and closest to the Sun. It experiences extreme temperature swings from 430°C by day down to -180°C at night."
    },
    venus: {
      name: "Venus",
      type: "Terrestrial Planet",
      icon: "🟡",
      distance: "108.2M km",
      period: "225 Days",
      diameter: "12,104 km",
      moons: "0",
      desc: "Earth's 'twin' in size, but enveloped in a crushing atmosphere of carbon dioxide and sulfuric acid clouds with a surface hot enough to melt lead."
    },
    earth: {
      name: "Earth",
      type: "Terrestrial Planet",
      icon: "🌍",
      distance: "149.6M km",
      period: "365.25 Days",
      diameter: "12,742 km",
      moons: "1 (The Moon)",
      desc: "The vibrant blue oasis of our system, with liquid water oceans, dynamic plate tectonics, and a protective magnetic shield nurturing all known life."
    },
    mars: {
      name: "Mars",
      type: "Terrestrial Planet",
      icon: "🔴",
      distance: "227.9M km",
      period: "687 Days",
      diameter: "6,779 km",
      moons: "2 (Phobos, Deimos)",
      desc: "The Red Planet gets its iconic hue from oxidized iron dust. Home to Olympus Mons, the largest volcano in the entire solar system."
    },
    jupiter: {
      name: "Jupiter",
      type: "Gas Giant",
      icon: "🪐",
      distance: "778.5M km",
      period: "11.86 Years",
      diameter: "139,820 km",
      moons: "95 Known",
      desc: "A massive gas giant more than twice as massive as all other planets combined. Its legendary Great Red Spot is a storm that has raged for centuries."
    },
    saturn: {
      name: "Saturn",
      type: "Gas Giant",
      icon: "🪐",
      distance: "1.43B km",
      period: "29.45 Years",
      diameter: "116,460 km",
      moons: "146 Known",
      desc: "Famous for its majestic, dazzling ring system made of billions of chunks of ice and rock. It is so light that it would float in a giant bathtub of water!"
    },
    uranus: {
      name: "Uranus",
      type: "Ice Giant",
      icon: "🌐",
      distance: "2.87B km",
      period: "84 Years",
      diameter: "50,724 km",
      moons: "28 Known",
      desc: "An ice giant with a pale cyan atmosphere rich in methane. It rotates on its side with an axial tilt of 98 degrees, rolling through its orbit."
    },
    neptune: {
      name: "Neptune",
      type: "Ice Giant",
      icon: "🔵",
      distance: "4.50B km",
      period: "164.8 Years",
      diameter: "49,244 km",
      moons: "16 Known",
      desc: "The outermost major planet, bathed in deep cosmic blue. Neptune whips up the solar system's fastest winds, exceeding supersonic speeds of 2,100 km/h."
    }
  };

  // ===== 4. Interactive Info Card Display =====
  const card = document.getElementById("planet-card");
  const cardIcon = document.getElementById("card-icon");
  const cardTitle = document.getElementById("card-title");
  const cardType = document.getElementById("card-type");
  const cardDistance = document.getElementById("card-distance");
  const cardPeriod = document.getElementById("card-period");
  const cardDiameter = document.getElementById("card-diameter");
  const cardMoons = document.getElementById("card-moons");
  const cardDesc = document.getElementById("card-desc");
  const closeCardBtn = document.getElementById("close-card");

  function showPlanetInfo(key) {
    const data = planetData[key];
    if (!data) return;

    cardIcon.textContent = data.icon;
    cardTitle.textContent = data.name;
    cardType.textContent = data.type;
    cardDistance.textContent = data.distance;
    cardPeriod.textContent = data.period;
    cardDiameter.textContent = data.diameter;
    cardMoons.textContent = data.moons;
    cardDesc.textContent = data.desc;

    card.classList.remove("hidden");
  }

  closeCardBtn.addEventListener("click", () => {
    card.classList.add("hidden");
  });

  // Attach click & hover events to planets
  document.querySelectorAll("[data-planet]").forEach((el) => {
    el.addEventListener("click", function (e) {
      e.stopPropagation();
      const pKey = this.getAttribute("data-planet");
      showPlanetInfo(pKey);
    });
  });

  const sunWrapper = document.querySelector(".sun-wrapper");
  if (sunWrapper) {
    sunWrapper.addEventListener("click", function (e) {
      e.stopPropagation();
      showPlanetInfo("sun");
    });
  }

  // Show Earth by default for a warm first impression
  showPlanetInfo("earth");
});
