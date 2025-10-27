// Імпорт іменованого та дефолтних модулів
import { fetchData } from "./modules/api.js";
import validateForm from "./modules/form-validation.js";
import Modal from "./modules/modal.js";
import Slider from "./modules/slider.js";

// 1. Ініціалізація модального вікна
const modal = new Modal("#modal");
document.querySelector("[data-modal-open]")?.addEventListener("click", () => modal.show());

// 2. Слайдер
const slider = new Slider(".slider", 4000);
slider.start();

// 3. Валідація форми
const form = document.querySelector("form");
form?.addEventListener("submit", e => {
  if (!validateForm(form)) {
    e.preventDefault();
    alert("Будь ласка, заповніть усі обов’язкові поля");
  }
});

// 4. Приклад використання fetchData
fetchData("https://jsonplaceholder.typicode.com/posts/1").then(data => {
  console.log("API результат:", data);
});
