const rocket = document.getElementById("rocket");
const siteContent = document.querySelector(".site-content");
const animationContainer = document.querySelector(".animation-container");

// Ракета следует за мышкой по X
document.addEventListener("mousemove", (e) => {
  const x = e.clientX;
  rocket.style.transform = `translateX(${
    x - window.innerWidth / 2
  }px) rotate(15deg)`;
});

// Запускаем взлет и посадку
setTimeout(() => {
  rocket.style.transition = "5s ease-in-out";
  rocket.style.bottom = "60%";

  // Через 6 сек — посадка
  setTimeout(() => {
    rocket.style.bottom = "20%";
    rocket.style.transform = "translateX(-50%) rotate(0deg)";

    // Через 2 сек — показать сайт
    setTimeout(() => {
      animationContainer.style.display = "none";
      siteContent.classList.add("visible");
    }, 2000);
  }, 6000);
}, 1000);
