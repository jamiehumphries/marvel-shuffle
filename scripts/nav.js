window.addEventListener("keydown", () => {
  document.body.classList.add("keyboard-nav");
});

window.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-nav");
});
