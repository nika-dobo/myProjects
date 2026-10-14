document.addEventListener("DOMContentLoaded", function () {
  const result = document.getElementById("res");
  const numbers = document.querySelectorAll(".num");
  const operations = document.querySelectorAll(".operation");
  const delBtn = document.getElementById("del");
  const resetBtn = document.getElementById("reset");
  const equalBtn = document.getElementById("equal");
  const toggleTrack = document.getElementById("bk");
  const themeSpans = document.querySelectorAll(".theme-labels span");

  let expression = "";

  // ===== Theme Switcher =====
  const savedTheme = localStorage.getItem("calculator_theme") || "1";
  setTheme(savedTheme);

  function setTheme(themeNumber) {
    document.body.classList.remove("theme-1", "theme-2", "theme-3");
    document.body.classList.add(`theme-${themeNumber}`);
    localStorage.setItem("calculator_theme", themeNumber);
  }

  function getNextTheme() {
    if (document.body.classList.contains("theme-1")) return "2";
    if (document.body.classList.contains("theme-2")) return "3";
    return "1";
  }

  if (toggleTrack) {
    toggleTrack.addEventListener("click", function () {
      setTheme(getNextTheme());
    });
  }

  themeSpans.forEach((span) => {
    span.addEventListener("click", function () {
      const themeVal = this.getAttribute("data-theme");
      if (themeVal) setTheme(themeVal);
    });
  });

  // ===== Calculator Input Logic =====
  const opSymbols = ["+", "-", "*", "/"];

  function updateDisplay() {
    if (expression === "") {
      result.textContent = "0";
      return;
    }
    result.textContent = expression;
  }

  updateDisplay();

  numbers.forEach((numBtn) => {
    numBtn.addEventListener("click", function () {
      const val = this.textContent.trim();
      if (expression === "0" && val !== ".") {
        expression = val;
      } else {
        expression += val;
      }
      updateDisplay();
    });
  });

  operations.forEach((opBtn) => {
    opBtn.addEventListener("click", function () {
      const op = this.textContent.trim();
      if (op === ".") {
        // Find last number chunk
        const lastPart = expression.split(/[\+\-\*\/]/).pop();
        if (lastPart && lastPart.includes(".")) return;
        if (expression === "" || opSymbols.includes(expression.slice(-1))) {
          expression += "0.";
        } else {
          expression += ".";
        }
        updateDisplay();
        return;
      }

      if (expression === "") {
        if (op === "-") {
          expression = "-";
          updateDisplay();
        }
        return;
      }

      const lastChar = expression.slice(-1);
      if (opSymbols.includes(lastChar)) {
        expression = expression.slice(0, -1) + op;
      } else {
        expression += op;
      }
      updateDisplay();
    });
  });

  delBtn.addEventListener("click", function () {
    if (expression.length > 0) {
      expression = expression.slice(0, -1);
      updateDisplay();
    }
  });

  resetBtn.addEventListener("click", function () {
    expression = "";
    updateDisplay();
  });

  equalBtn.addEventListener("click", calculateResult);

  function calculateResult() {
    if (!expression) return;
    try {
      // Clean trailing operators
      let sanitized = expression;
      while (sanitized.length > 0 && opSymbols.includes(sanitized.slice(-1))) {
        sanitized = sanitized.slice(0, -1);
      }
      if (!sanitized) return;

      // Safe evaluation of mathematical tokens
      // Disallow anything other than digits, operators, dots, parens
      if (/[^0-9\+\-\*\/\.\s]/.test(sanitized)) {
        result.textContent = "Error";
        expression = "";
        return;
      }

      const computed = Function(`'use strict'; return (${sanitized})`)();
      if (!isFinite(computed)) {
        result.textContent = "Error";
        expression = "";
        return;
      }

      // Format nicely (trim floating precision noise)
      let formatted = parseFloat(computed.toFixed(8)).toString();
      expression = formatted;
      result.textContent = formatted;
    } catch (err) {
      result.textContent = "Error";
      expression = "";
    }
  }

  // Keyboard support
  document.addEventListener("keydown", function (e) {
    if ((e.key >= "0" && e.key <= "9") || opSymbols.includes(e.key)) {
      if (expression === "0" && e.key >= "0" && e.key <= "9") {
        expression = e.key;
      } else {
        const lastChar = expression.slice(-1);
        if (opSymbols.includes(e.key) && opSymbols.includes(lastChar)) {
          expression = expression.slice(0, -1) + e.key;
        } else {
          expression += e.key;
        }
      }
      updateDisplay();
    } else if (e.key === ".") {
      const lastPart = expression.split(/[\+\-\*\/]/).pop();
      if (!lastPart.includes(".")) {
        expression += expression === "" || opSymbols.includes(expression.slice(-1)) ? "0." : ".";
        updateDisplay();
      }
    } else if (e.key === "Backspace") {
      expression = expression.slice(0, -1);
      updateDisplay();
    } else if (e.key === "Escape") {
      expression = "";
      updateDisplay();
    } else if (e.key === "Enter" || e.key === "=") {
      calculateResult();
    }
  });
});
