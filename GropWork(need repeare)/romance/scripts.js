let content = document.querySelector(".info1");
let strry1_button1 = document.querySelector("#story1");
let strry1_button2 = document.querySelector("#story1-close");

strry1_button1.addEventListener("click", function (evt) {
  evt.preventDefault();
  content.classList.remove("info1-hidden");
  content.classList.add("info1-View");
});

strry1_button2.addEventListener("click", function (evt) {
  evt.preventDefault();
  content.classList.remove("info1-View");
  content.classList.add("info1-hidden");
});

let content2 = document.querySelector(".info2");
let strry2_button1 = document.querySelector("#story2");
let strry2_button2 = document.querySelector("#story2-close");

strry2_button1.addEventListener("click", function (evt) {
  evt.preventDefault();
  content2.classList.remove("info2-hidden");
  content2.classList.add("info2-View");
});

strry2_button2.addEventListener("click", function (evt) {
  evt.preventDefault();
  content2.classList.remove("info2-View");
  content2.classList.add("info2-hidden");
});

let content3 = document.querySelector(".info3");
let strry3_button1 = document.querySelector("#story3");
let strry3_button2 = document.querySelector("#story3-close");

strry3_button1.addEventListener("click", function (evt) {
  evt.preventDefault();
  content3.classList.remove("info3-hidden");
  content3.classList.add("info3-View");
});

strry3_button2.addEventListener("click", function (evt) {
  evt.preventDefault();
  content3.classList.remove("info3-View");
  content3.classList.add("info3-hidden");
});

let content4 = document.querySelector(".info4");
let strry4_button1 = document.querySelector("#story4");
let strry4_button2 = document.querySelector("#story4-close");

strry4_button1.addEventListener("click", function (evt) {
  evt.preventDefault();
  content4.classList.remove("info4-hidden");
  content4.classList.add("info4-View");
});

strry4_button2.addEventListener("click", function (evt) {
  evt.preventDefault();
  content4.classList.remove("info4-View");
  content4.classList.add("info4-hidden");
});

let content5 = document.querySelector(".info5");
let strry5_button1 = document.querySelector("#story5");
let strry5_button2 = document.querySelector("#story5-close");

strry5_button1.addEventListener("click", function (evt) {
  evt.preventDefault();
  content5.classList.remove("info5-hidden");
  content5.classList.add("info5-View");
});

strry5_button2.addEventListener("click", function (evt) {
  evt.preventDefault();
  content5.classList.remove("info5-View");
  content5.classList.add("info5-hidden");
});

let content6 = document.querySelector(".info6");
let strry6_button1 = document.querySelector("#story6");
let strry6_button2 = document.querySelector("#story6-close");

strry6_button1.addEventListener("click", function (evt) {
  evt.preventDefault();
  content6.classList.remove("info6-hidden");
  content6.classList.add("info6-View");
});

strry6_button2.addEventListener("click", function (evt) {
  evt.preventDefault();
  content6.classList.remove("info6-View");
  content6.classList.add("info6-hidden");
});
