let img = document.getElementById("img");
let button = document.getElementById("button");

let imgUrs = [
  "imgs/dice-six-faces-one.svg",
  "imgs/dice-six-faces-two.svg",
  "imgs/dice-six-faces-three.svg",
  "imgs/dice-six-faces-four.svg",
  "imgs/dice-six-faces-five.svg",
  "imgs/dice-six-faces-six.svg",
];

let num = 0;

button.addEventListener("click", function () {
  let random = Math.floor(Math.random() * 6);
  img.src = imgUrs[random];
  num += 1;

  let div = document.createElement("div");
  div.classList = "info";

  let h2 = document.createElement("h2");
  h2.textContent = `Roll ${num}:`;

  let img2 = document.createElement("img");
  img2.src = imgUrs[random];

  div.appendChild(h2);
  div.appendChild(img2);

  document.body.appendChild(div);
});
