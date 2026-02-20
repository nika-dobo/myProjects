const form = document.getElementById("form");

form.addEventListener("submit", function (e) {
  e.preventDefault();
  let finish = [];

  function errorInput(input) {
    input.value = "";
    input.style.borderColor = "red";
    input.style.borderWidth = "2px";
  }

  function clearError(input) {
    input.style.borderColor = "";
  }

  function checkName() {
    const name = document.getElementById("name");
    const display = document.getElementById("card-name");
    clearError(name);
    finish.push(true);

    display.textContent = name.value;

    let hasNumber = false;

    for (let i = 0; i < name.value.length; i++) {
      if (
        name.value[i] >= "0" &&
        name.value[i] <= "9" &&
        name.value[i] !== " "
      ) {
        hasNumber = true;
        break;
      }
    }

    if (name.value.length < 3 || hasNumber) {
      errorInput(name);
      display.textContent = "Jane Appleseed";

      finish.push(false);
    }
  }

  function checkCard() {
    const card = document.getElementById("card-id");
    const display = document.getElementById("id");
    clearError(card);
    finish.push(true);

    display.textContent = card.value;

    if (card.value.length !== 16 || isNaN(card.value)) {
      errorInput(card);
      display.textContent = "0000 0000 0000 0000";

      finish.push(false);
    }
  }

  function checkMonth() {
    const mm = document.getElementById("mm");
    const display = document.getElementById("ma");
    clearError(mm);
    finish.push(true);

    display.textContent = mm.value;

    if (
      mm.value.length !== 2 ||
      isNaN(mm.value) ||
      parseInt(mm.value) < 1 ||
      parseInt(mm.value) > 12
    ) {
      errorInput(mm);
      display.textContent = "00";

      finish.push(false);
    }
  }

  function checkYear() {
    const yy = document.getElementById("yy");
    const display = document.getElementById("yr");
    clearError(yy);
    finish.push(true);

    display.textContent = yy.value;

    if (yy.value.length !== 2 || isNaN(yy.value)) {
      errorInput(yy);
      display.textContent = "00";

      finish.push(false);
    }
  }

  function checkCVC() {
    const cvc = document.getElementById("cvc");
    const display = document.getElementById("cvv");
    clearError(cvc);
    finish.push(true);

    display.textContent = cvc.value;

    if (cvc.value.length !== 3 || isNaN(cvc.value)) {
      errorInput(cvc);
      display.textContent = "000";

      finish.push(false);
    }
  }

  checkName();
  checkCard();
  checkMonth();
  checkYear();
  checkCVC();

  function regComplited() {
    done = document.getElementById("after-reg");
    if (finish.length == 5) {
      form.style.display = "none";
      done.style.display = "flex";
    }
  }
  regComplited();
});

document.getElementById("fin").addEventListener("click", function () {
  document.getElementById("scam").style.display = "flex";
});
