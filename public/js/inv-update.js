const form = document.querySelector("#editVehicleForm")

if (form) {
  const updateBtn = form.querySelector("button[type='submit']")
  const hint = document.querySelector("#update-hint")

  form.addEventListener("change", function () {
    if (updateBtn) {
      updateBtn.removeAttribute("disabled")
      updateBtn.classList.add("active")
    }
    if (hint) {
      hint.classList.add("hidden")
    }
  })
}
