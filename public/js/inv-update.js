const form = document.querySelector("#editVehicleForm")

if (form) {
  form.addEventListener("change", function () {
    const updateBtn = form.querySelector("button[type='submit']")
    if (updateBtn) {
      updateBtn.removeAttribute("disabled")
    }
  })
}
