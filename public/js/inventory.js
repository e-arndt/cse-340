// public/js/inventory.js

// ------------------
// Add Vehicle Inputs
// ------------------
const classificationSelect = document.getElementById("classification_id");
const makeInput  = document.getElementById("inv_make");
const modelInput = document.getElementById("inv_model");
const yearInput  = document.getElementById("inv_year");
const priceInput = document.getElementById("inv_price");
const milesInput = document.getElementById("inv_miles");
const colorInput = document.getElementById("inv_color");
const descInput  = document.getElementById("inv_description");
const imgInput   = document.getElementById("inv_image");
const thumbInput = document.getElementById("inv_thumbnail");


// Regex patterns
const makeRegex   = /^[A-Za-z]{2,}$/;               // ≥2 letters
const modelRegex  = /^[A-Za-z0-9]{2,}$/;            // ≥2 letters/numbers
const yearRegex   = /^[12][0-9]{3}$/;               // 4 digits starting with 1 or 2
const priceRegex  = /^[0-9]{3,7}(\.[0-9]{1,2})?$/;  // 3–7 digits, up to 2 digits after
const milesRegex  = /^[0-9]{2,7}$/;                 // 2–7 digits, no . or ,
const colorRegex  = /^[A-Za-z ]{3,24}$/;            // 3–24 letters and apaces
const descRegex   = /^.{4,}$/;                      // at least 4 characters, allows letters/numbers/symbols
const imgRegex    = /^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/;
const thumbRegex  = /^\/images\/vehicles\/[a-zA-Z0-9_-]+-tn\.(png|jpg|webp)$/;


// Shared validator
function liveValidate(input, regex) {
  input.addEventListener("input", () => {
    if (!input.value) {
      input.classList.remove("valid", "invalid"); // empty is fine
    } else if (regex.test(input.value)) {
      input.classList.add("valid");
      input.classList.remove("invalid");
    } else {
      input.classList.add("invalid");
      input.classList.remove("valid");
    }
  });
}


// Special validator for classification dropdown
if (classificationSelect) {
  classificationSelect.addEventListener("change", () => {
    if (classificationSelect.value) {
      classificationSelect.classList.add("valid");
      classificationSelect.classList.remove("invalid");
    } else {
      classificationSelect.classList.add("invalid");
      classificationSelect.classList.remove("valid");
    }
  });
}

// Apply validators — Add Vehicle
if (makeInput)  liveValidate(makeInput, makeRegex);
if (modelInput) liveValidate(modelInput, modelRegex);
if (yearInput)  liveValidate(yearInput, yearRegex);
if (priceInput) liveValidate(priceInput, priceRegex);
if (milesInput) liveValidate(milesInput, milesRegex);
if (colorInput) liveValidate(colorInput, colorRegex);
if (descInput)  liveValidate(descInput, descRegex);
if (imgInput)   liveValidate(imgInput, imgRegex);
if (thumbInput) liveValidate(thumbInput, thumbRegex);

