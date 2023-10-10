const tracker = document.getElementById("tracker");

window.addEventListener("keydown", (event) => {
  document.body.classList.add("keyboard-nav");
  if (tracker && tracker.contains(document.activeElement)) {
    handleTrackerNavigation(event);
  }
});

window.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-nav");
});

function handleTrackerNavigation(event) {
  switch (event.key) {
    case "ArrowLeft":
      moveCell(event, -1, 0);
      break;
    case "ArrowRight":
      moveCell(event, +1, 0);
      break;
    case "ArrowUp":
      moveCell(event, 0, -1);
      break;
    case "ArrowDown":
      moveCell(event, 0, +1);
      break;
  }
}

function moveCell(event, dx, dy) {
  const input = document.activeElement;
  if (!input || input.tagName !== "INPUT") {
    return;
  }

  const td = input.closest("td");
  const tr = input.closest("tr");
  const tbody = input.closest("tbody");
  const x = [...tr.children].indexOf(td);
  const y = [...tbody.children].indexOf(tr);

  const next = tbody.children[y + dy]?.children[x + dx]?.querySelector("input");
  if (!next) {
    return;
  }

  event.preventDefault();
  next.focus();
}
