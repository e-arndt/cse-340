// update-account.js
// ------------------------------------------------------
// Handles unique UX logic for the Account Update form
// (relies on account.js for all validation and password toggle)
// ------------------------------------------------------

// Only run if the form exists on the current page
const updateForm = document.getElementById("updateAccountForm");
if (updateForm) {
  const updateBtn = updateForm.querySelector("button[type='submit']");
  const inputs = updateForm.querySelectorAll("input[type='text'], input[type='email']");

  // Store the initial input values for comparison
  const initialValues = {};
  inputs.forEach(input => {
    initialValues[input.name] = input.value;
  });

  // Watch for changes to enable or disable the Update button
  updateForm.addEventListener("input", () => {
    const hasChanges = Array.from(inputs).some(
      input => input.value.trim() !== initialValues[input.name].trim()
    );
    updateBtn.disabled = !hasChanges;
    updateBtn.classList.toggle("active", hasChanges);
  });
}
