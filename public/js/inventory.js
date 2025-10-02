'use strict'

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
const makeRegex   = /^[A-Za-z]{2,}$/;
const modelRegex  = /^[A-Za-z0-9]{2,}$/;
const yearRegex   = /^[12][0-9]{3}$/;
const priceRegex  = /^[0-9]{3,7}(\.[0-9]{1,2})?$/;
const milesRegex  = /^[0-9]{2,7}$/;
const colorRegex  = /^[A-Za-z ]{3,24}$/;
const descRegex   = /^.{4,}$/;
const imgRegex    = /^\/images\/vehicles\/[a-zA-Z0-9_-]+\.(png|jpg|webp)$/;
const thumbRegex  = /^\/images\/vehicles\/[a-zA-Z0-9_-]+-tn\.(png|jpg|webp)$/;

// Shared validator
function liveValidate(input, regex) {
  input.addEventListener("input", () => {
    if (!input.value) {
      input.classList.remove("valid", "invalid"); // empty is OK
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


// -----------------------------
// Inventory Management (AJAX)
// -----------------------------
const classificationList = document.querySelector("#classificationList");

if (classificationList) {
  classificationList.addEventListener("change", function () {
    let classification_id = classificationList.value;
    console.log(`classification_id is: ${classification_id}`);
    let classIdURL = "/inv/getInventory/" + classification_id;

    fetch(classIdURL)
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
        throw Error("Network response was not OK");
      })
      .then(function (data) {
        console.log(data);
        buildInventoryList(data);
      })
      .catch(function (error) {
        console.log("There was a problem: ", error.message);
      });
  });
}

// Build inventory items into HTML table components and inject into DOM
function buildInventoryList(data) {
  let inventoryDisplay = document.getElementById("inventoryDisplay");

  // Set up the table labels
  let dataTable = "<thead>";
  dataTable += "<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</td></tr>";
  dataTable += "</thead>";

  // Set up the table body
  dataTable += "<tbody>";

  // Iterate over all vehicles in the array and put each in a row
  data.forEach(function (element) {
    console.log(element.inv_id + ", " + element.inv_model);
    dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
    dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
    dataTable += `<td><a href='/inv/delete/${element.inv_id}' title='Click to delete'>Delete</a></td></tr>`;
  });

  dataTable += "</tbody>";

  // Display the contents in the Inventory Management view
  inventoryDisplay.innerHTML = dataTable;
}
