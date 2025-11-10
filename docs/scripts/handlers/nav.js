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

  event.preventDefault();

  const stopOnBreak = event.ctrlKey ? (dx === 0 ? "row" : "col") : null;
  const next = getNextInput(input, dx, dy, stopOnBreak);
  if (next === input) {
    return;
  }

  const td = next.closest("td");
  if (getComputedStyle(td).visibility === "hidden") {
    td.classList.add("visible");
  }

  next.focus();
}

function getNextInput(input, dx, dy, stopOnBreak) {
  const td = input.closest("td");
  const tr = input.closest("tr");
  const tbody = input.closest("tbody");

  const maxX = tr.children.length - 1;
  const maxY = tbody.children.length - 1;

  let x = [...tr.children].indexOf(td);
  let y = [...tbody.children].indexOf(tr);

  let next = input;
  do {
    x += dx;
    y += dy;
    if (x < 0 || x > maxX || y < 0 || y > maxY) {
      break;
    }
    next = tbody.children[y].children[x].querySelector("input");
  } while (stopOnBreak && !next.closest(`.${stopOnBreak}-break`));

  return next;
}
