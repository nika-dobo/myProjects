setTimeout(() => {
  const videoOverlay = document.getElementById("video-overlay");
  videoOverlay.classList.add("fade-out");

  setTimeout(() => {
    videoOverlay.style.display = "none";

    const mainContent = document.getElementById("main-content");
    mainContent.style.display = "block";
  }, 1000);
}, 3000);
