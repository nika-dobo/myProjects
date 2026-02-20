let content = document.querySelector("#input");
let button = document.querySelector("#Search");

button.addEventListener("click", function () {
  if (content.classList.contains("input-hidden")) {
    content.classList.remove("input-hidden");
    content.classList.add("input-view");
  } else {
    content.classList.remove("input-view");
    content.classList.add("input-hidden");
  }
});

const canvas = document.getElementById("dots-background");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
}

resizeCanvas();

const colors = ["#00ffff", "#ff00ff", "#00ff00", "#ff8800", "#ffffff"];
const dots = [];

for (let i = 0; i < 25; i++) {
  dots.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 4 + 2,
    dx: (Math.random() - 0.5) * 1.5,
    dy: (Math.random() - 0.5) * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)],
  });
}

function animate() {
  ctx.fillStyle = "rgba(3, 25, 48, 0.15)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  dots.forEach((dot) => {
    dot.x += dot.dx;
    dot.y += dot.dy;

    if (dot.x < 0 || dot.x > canvas.width) dot.dx *= -1;
    if (dot.y < 0 || dot.y > canvas.height) dot.dy *= -1;

    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
    ctx.fillStyle = dot.color;
    ctx.fill();
  });

  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", resizeCanvas);





