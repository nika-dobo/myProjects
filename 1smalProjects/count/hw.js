const body = document.body;

const bkDiv = document.createElement("div");
bkDiv.className = "bk-div";

const main = document.createElement("div");
main.className = "main";

const number = document.createElement("p");
number.textContent = 0;

const container = document.createElement("div");
container.className = "container";

const plues = document.createElement("button");
plues.textContent = "+";
plues.className = "plues";

const minuce = document.createElement("button");
minuce.textContent = "-";
minuce.className = "minuce";

const refresh = document.createElement("button");
refresh.textContent = "⟳";
refresh.className = "refresh";

let count = 0;

function changeTxt(btn) {
  if (btn.className == "plues") {
    count++;
  } else if (btn.className == "minuce") {
    count--;
  } else if (btn.className == "refresh") {
    count = 0;
  }

  number.textContent = count;
}

function changeCollor() {
  if (count === 0) {
    number.style.color = "white";
  } else if (count > 0) {
    number.style.color = "#0fde00";
  } else if (count < 0) {
    number.style.color = "#ff0000";
  }
}

plues.addEventListener("click", function () {
  changeTxt(plues);
  changeCollor();
  cool();
});
minuce.addEventListener("click", function () {
  changeTxt(minuce);
  changeCollor();
  cool();
});
refresh.addEventListener("click", function () {
  changeTxt(refresh);
  changeCollor();
});

body.appendChild(bkDiv);

main.appendChild(number);

container.appendChild(minuce);
container.appendChild(refresh);
container.appendChild(plues);
main.appendChild(container);

body.appendChild(main);



























const img = document.createElement("img");
img.src = "hq720.jpg";
img.style.display = "none";
const audio = document.createElement("audio");
audio.src = "audio.mp3";
audio.hidden = true;

function cool() {
  if (count >= 50 || count <= -50) {
    img.style.display = "block";
    audio.play().catch((err) => console.log(err));
  }
}

body.appendChild(img);
body.appendChild(audio);
