export default function validateForm(form) {
  const fields = form.querySelectorAll("input, textarea, select");
  let isValid = true;

  fields.forEach(field => {
    if (field.required && !field.value.trim()) {
      field.classList.add("error");
      isValid = false;
    } else {
      field.classList.remove("error");
    }
  });

  return isValid;
}
