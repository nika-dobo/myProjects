// Matrix Background
const canvas = document.getElementById("matrixCanvas");
const ctx = canvas.getContext("2d");

canvas.height = window.innerHeight;
canvas.width = window.innerWidth;

const letters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-[]{}|;:,.<>?";
const fontSize = 12;
const columns = canvas.width / fontSize;

const drops = [];
for (let i = 0; i < columns; i++) {
  drops[i] = Math.random() * canvas.height;
}

function drawMatrix() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#4de3ec";
  ctx.font = fontSize + "px monospace";

  for (let i = 0; i < drops.length; i++) {
    const text = letters[Math.floor(Math.random() * letters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

setInterval(drawMatrix, 50);

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});




// Text Animation
const texts = [
  { elementId: "h1", finalText: "Hello" },
  { elementId: "p", finalText: "Welcome \n to a programing language website!!" },
  { elementId: "button", finalText: "Go to website" },
];

const animateLetters =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-[]{}|;:,.<>?";
const interval = 50;

function animateText(elementId, finalText, callback) {
  const element = document.getElementById(elementId);
  let iterations = 0;

  element.style.opacity = 1;
  let displayed = "";

  function update() {
    displayed = "";
    for (let i = 0; i < finalText.length; i++) {
      if (i < iterations) {
        displayed += finalText[i];
      } else {
        const char = finalText[i];
        displayed +=
          char === " " || char === "\n"
            ? char
            : animateLetters[Math.floor(Math.random() * animateLetters.length)];
      }
    }

    element.textContent = displayed;

    if (iterations < finalText.length) {
      iterations++;
      setTimeout(update, interval);
    } else if (callback) {
      setTimeout(callback, 500);
    }
  }

  update();
}

animateText("h1", texts[0].finalText, () => {
  const h1 = document.getElementById("h1");
  h1.style.transform = "translateY(-100px)";

  animateText("p", texts[1].finalText, () => {
    const p = document.getElementById("p");
    p.style.opacity = 1;
    p.style.transform = "translateY(-50px)";

    animateText("button", texts[2].finalText);
  });
});
