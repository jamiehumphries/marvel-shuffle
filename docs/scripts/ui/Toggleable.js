export class Toggleable {
  show() {
    this.toggleVisibility(true);
  }

  hide() {
    this.toggleVisibility(false);
  }

  toggleVisibility(value) {
    this.root.classList.toggle("hidden", !value);
    this.childSection?.toggleVisibility(value);
  }
}
