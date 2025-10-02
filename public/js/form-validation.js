document.addEventListener("DOMContentLoaded", () => {
  const forms = document.querySelectorAll("form");

  forms.forEach(form => {
    const inputs = form.querySelectorAll("input, textarea, select");

    inputs.forEach(input => {
      const applyValidation = () => {
        if (input.checkValidity()) {
          input.classList.add("valid");
          input.classList.remove("invalid");
        } else if (input.value.trim() !== "") {
          input.classList.add("invalid");
          input.classList.remove("valid");
        } else {
          input.classList.remove("valid", "invalid"); // empty field = neutral
        }
      };

      // Run once on page load
      applyValidation();

      // Run on change/typing
      input.addEventListener("input", applyValidation);
    });
  });
});
