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
const classificationList = document.querySelector("#classification_id");

if (classificationList) {
  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value;
    const inventoryDisplay = document.getElementById("inventoryDisplay");

    console.log(`classification_id changed to: ${classification_id}`);

    // Case 1: No classification selected — clear table
    if (!classification_id) {
      inventoryDisplay.innerHTML = `
        <tr>
          <td colspan="3" class="no-vehicles-msg">
            Please select a classification to view vehicles.
          </td>
        </tr>
      `;
      return; // stop here
    }

    // Case 2: Valid classification — fetch vehicles
    const classIdURL = "/inv/getInventory/" + classification_id;

    // Clear existing content while loading
    inventoryDisplay.innerHTML = `
      <tr>
        <td colspan="3" class="no-vehicles-msg">Loading vehicles...</td>
      </tr>
    `;

    fetch(classIdURL)
      .then(response => {
        if (response.ok) return response.json();
        throw new Error("Network response was not OK");
      })
      .then(data => {
        console.log("Fetched data:", data);
        buildInventoryList(data);
      })
      .catch(error => {
        console.error("There was a problem:", error.message);
        inventoryDisplay.innerHTML = `
          <tr>
            <td colspan="3" class="no-vehicles-msg">
              Error loading inventory. Please try again.
            </td>
          </tr>
        `;
      });
  });
}


// -----------------------------
// Build inventory items into HTML table
// -----------------------------
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay");

  // Always reset table
  inventoryDisplay.classList.add("mgmt-table");
  inventoryDisplay.innerHTML = ""; // clear old content

  // Case: Classification has no vehicles
  if (!data || data.length === 0) {
    console.log("No vehicles found for this classification.");
    inventoryDisplay.innerHTML = `
      <tr>
        <td colspan="3" class="no-vehicles-msg">
          This classification currently has no vehicles.<br>
          <button id="deleteClassBtn" class="delete-class-btn">
            Delete Classification
          </button>
        </td>
      </tr>
    `;

    const deleteBtn = document.getElementById("deleteClassBtn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        const classId = document.querySelector("#classification_id").value;
        // Redirect directly to the server-side confirmation page
        window.location.href = `/inv/delete-classification/${classId}`;
      });
    }
    return;
  }

  // Case: Vehicles exist — build table normally
  let dataTable = `
    <thead>
      <tr><th>Vehicle Name</th><th>Modify</th><th>Delete</th></tr>
    </thead>
    <tbody>
  `;

  data.forEach(element => {
    dataTable += `
      <tr>
        <td>${element.inv_make} ${element.inv_model}</td>
        <td><a href='/inv/edit/${element.inv_id}' class='mgmt-btn modify-btn' title='Click to update'>Modify</a></td>
        <td><a href='/inv/delete/${element.inv_id}' class='mgmt-btn delete-btn' title='Click to delete'>Delete</a></td>
      </tr>`;
  });

  dataTable += "</tbody>";
  inventoryDisplay.innerHTML = dataTable;
}



