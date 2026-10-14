for (let i = 1; i <= 6; i++) {
  const content = document.querySelector(`.info${i}`);
  const openBtn = document.querySelector(`#story${i}`);
  const closeBtn = document.querySelector(`#story${i}-close`);

  if (openBtn && content) {
    openBtn.addEventListener("click", function (evt) {
      evt.preventDefault();
      content.classList.remove(`info${i}-hidden`);
      content.classList.add(`info${i}-View`);
      document.body.style.overflow = "hidden";
    });
  }

  if (closeBtn && content) {
    closeBtn.addEventListener("click", function (evt) {
      evt.preventDefault();
      content.classList.remove(`info${i}-View`);
      content.classList.add(`info${i}-hidden`);
      document.body.style.overflow = "auto";
    });
  }

  if (content) {
    content.addEventListener("click", function (evt) {
      if (evt.target === content) {
        content.classList.remove(`info${i}-View`);
        content.classList.add(`info${i}-hidden`);
        document.body.style.overflow = "auto";
      }
    });
  }
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    for (let i = 1; i <= 6; i++) {
      const content = document.querySelector(`.info${i}`);
      if (content) {
        content.classList.remove(`info${i}-View`);
        content.classList.add(`info${i}-hidden`);
      }
    }
    document.body.style.overflow = "auto";
  }
});
