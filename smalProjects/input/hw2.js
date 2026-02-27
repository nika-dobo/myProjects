let input = document.getElementById("input");
let Total = document.getElementById("Total");
let Remaining = document.getElementById("Remaining");

let totalNum = 0;
let remainingNum = 50;
Total.textContent = totalNum;
Remaining.textContent = remainingNum;

input.addEventListener("input", function (e) {
  let InputLength = e.target.value.length;
  
  if (InputLength <= 50) {
    totalNum += 1;
    remainingNum -= 1;
    Total.textContent = totalNum;
    Remaining.textContent = remainingNum;
  }
});
