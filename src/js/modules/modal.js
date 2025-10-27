export default class Modal {
  constructor(selector) {
    this.modal = document.querySelector(selector);
    this.closeBtn = this.modal?.querySelector(".modal-close");
    this.init();
  }

  init() {
    if (!this.modal) return;
    this.closeBtn?.addEventListener("click", () => this.hide());
  }

  show() {
    this.modal?.classList.add("is-visible");
  }

  hide() {
    this.modal?.classList.remove("is-visible");
  }
}
