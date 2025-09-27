 // Apply "valid" flag on pattern matches for CSS Styling

// Get inputs
const firstName = document.getElementById("account_firstname");
const lastName  = document.getElementById("account_lastname");
const email     = document.getElementById("account_email");
const password  = document.getElementById("account_password");
const classNameInput = document.getElementById("classification_name");

// Regex patterns
const fnRegex    = /^[A-Za-z]{1,}$/;                   // ≥1 letter
const lnRegex    = /^[A-Za-z]{2,}$/;                   // ≥2 letters
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const pswdRegex  = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?=\S+$).{12,}$/;
const classRegex = /^[A-Za-z]{3,10}$/;

// Shared validator
function liveValidate(input, regex) {
  input.addEventListener("input", () => {
    if (regex.test(input.value)) {
      input.classList.add("valid");
      input.classList.remove("invalid");
    } else {
      input.classList.add("invalid");
      input.classList.remove("valid");
    }
  });
}

// Apply to each field
if (firstName) liveValidate(firstName, fnRegex);
if (lastName)  liveValidate(lastName, lnRegex);
if (email)     liveValidate(email, emailRegex);
if (password)  liveValidate(password, pswdRegex);
if (classNameInput) liveValidate(classNameInput, classRegex);


// Toggle password visibility
const pswdBtn = document.querySelector("#pswdBtn");
if (pswdBtn) {
  pswdBtn.addEventListener("click", () => {
    const type = password.getAttribute("type");
    if (type === "password") {
      password.setAttribute("type", "text");
      pswdBtn.textContent = "Hide Password";
    } else {
      password.setAttribute("type", "password");
      pswdBtn.textContent = "Show Password";
    }
  });
}

