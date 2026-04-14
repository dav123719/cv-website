const yearNode = document.getElementById("year");
const printButton = document.getElementById("printButton");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

if (printButton) {
  printButton.addEventListener("click", () => {
    window.print();
  });
}
