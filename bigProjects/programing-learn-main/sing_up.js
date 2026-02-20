document
  .getElementById("signup-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    const response = await fetch("/register", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = "/web/accaunt.html";
    } else {
      alert("Registration failed: " + result.message);
    }
  });
