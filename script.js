var filteredData;
let selectedStudents = new Set();
const selectedIdsSet = new Set();

document.addEventListener("DOMContentLoaded", () => {
  // Replace this with your published Google Sheets CSV link
  const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTSz-qn6FZy2h5LONgavxoAg53ZSZVNAup9mLTbOiODMuYemVEpXVKP1k5oK5olweQemxvg1FoCCKui/pub?output=csv";

  Papa.parse(sheetURL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const data = results.data.map(row => {
        // Optional: trim Name and normalize fields here if needed
        return {
          ...row,
          Name: row.Name?.trim(),
          "Areas Interested": row["Areas Interested"]?.toLowerCase()
        };
      });

      window.originalData = data;
      populateFilters(data);
      applyFilters();
    },
    error: function (err) {
      console.error("Error fetching Google Sheet:", err);
    }
  });

  const filters = [
    "cgpaFilter", "gradYearFilter", "interestFilter", "gradFilter",
    "marks10Filter", "marks12Filter", "ugFilter", "workExFilter", "gradStreamFilter"
  ];
  filters.forEach(id => document.getElementById(id)?.addEventListener("change", applyFilters));

 document.getElementById("clearFiltersButton").addEventListener("click", () => {
  const filterIds = [
    "cgpaFilter", "gradYearFilter", "interestFilter", "gradFilter",
    "marks10Filter", "marks12Filter", "ugFilter", "workExFilter", "gradStreamFilter"
  ];
filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = ""; // Reset each filter
  });


  applyFilters(); // Re-apply filters

  // Optional: clear selected students if you want reset behavior
  // selectedStudents.clear();
  // updateSelectionUI();
});

  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";  // Reset dropdowns to default (first option)
  });

  applyFilters();  // Re-apply filters to show all students
});

  document.getElementById("selectAllCheckbox").addEventListener("change", function () {
  const checkboxes = document.querySelectorAll(".student-select-checkbox");
  checkboxes.forEach(cb => {
    const id = cb.dataset.id;
    if (this.checked) {
      selectedStudents.add(id);
    } else {
      selectedStudents.delete(id);
    }
  });
  updateSelectionUI();
});

function clearAllFilters() {
  document.getElementById("cgpaFilter").value = "";
  document.getElementById("gradYearFilter").value = "";
  document.getElementById("gradFilter").value = "";
  document.getElementById("gradStreamFilter").value = "";
  document.getElementById("interestFilter").value = "";
  document.getElementById("marks10Filter").value = "";
  document.getElementById("marks12Filter").value = "";
  document.getElementById("ugFilter").value = "";
  document.getElementById("workExFilter").value = "";

  applyFilters(); // Re-run filtering after reset
}
document.addEventListener("DOMContentLoaded", () => {
  const clearBtn = document.getElementById("clearFiltersBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearAllFilters);
  }

  const clearBtnAlt = document.querySelector(".clearFiltersButton");
  if (clearBtnAlt) {
    clearBtnAlt.addEventListener("click", clearAllFilters);
  }
});
// document.addEventListener("DOMContentLoaded", () => {
//   fetch("data/students.xlsx")
  
//     .then(res => res.arrayBuffer())
//     .then(ab => {
//       const wb = XLSX.read(ab, { type: "array" });
//       const ws = wb.Sheets[wb.SheetNames[0]];
//       const data = XLSX.utils.sheet_to_json(ws);
//       window.originalData = data;
//       populateFilters(data);
//       renderGrid(data);
//     });

//   const filters = [
//     "cgpaFilter", "gradYearFilter", "interestFilter", "gradFilter",
//     "marks10Filter", "marks12Filter", "ugFilter", "workExFilter", "gradStreamFilter"

//   ];
//   filters.forEach(id => document.getElementById(id).addEventListener("change", applyFilters));
// });


// function populateFilters(data) {
//   const setDropdown = (id, values, label) => {
//     const select = document.getElementById(id);
//     select.innerHTML = "";

//     const defaultOption = document.createElement("option");
//     defaultOption.value = "";
//     defaultOption.textContent = label;
//     defaultOption.disabled = true;
//     defaultOption.selected = true;
//     select.appendChild(defaultOption);

//     const allOption = document.createElement("option");
//     allOption.value = "";
//     allOption.textContent = "All";
//     select.appendChild(allOption);

//     values.forEach(v => {
//       const opt = document.createElement("option");
//       opt.value = v;
//       opt.textContent = v;
//       select.appendChild(opt);
//     });
//   };

//   // Graduation dropdown
//   const gradValues = [...new Set(data.map(row => row["Graduation"]))].sort();
//   setDropdown("gradFilter", gradValues, "Graduation");

//   // Graduation Stream dropdown
//   setDropdown("gradStreamFilter", row => row["Graduation Stream Category"]);


//   // Graduation Year dropdown
//   const gradYearValues = [...new Set(data.map(row => row["Graduation Year"]))].sort();
//   setDropdown("gradYearFilter", gradYearValues, "Graduation Year");

//   // Areas Interested dropdown (fixed list)
//   const allAreas = [
//     "Marketing", "Consulting", "Analytics", "Sales", "Operations", "Finance", "HR"
//   ];
//   setDropdown("interestFilter", allAreas, "Areas Interested");
// }
function populateFilters(data) {
  // Helper to set dropdown by unique values
  const setDropdown = (id, values, defaultOption) => {
    const select = document.getElementById(id);
    select.innerHTML = ""; // clear existing
    // Add default option
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = defaultOption || "No Filter";
    select.appendChild(defaultOpt);
    // Add unique values
    values.forEach(v => {
      if (v) {  // skip empty/null
        const opt = document.createElement("option");
        opt.value = v;
        opt.textContent = v;
        select.appendChild(opt);
      }
    });
  };

  // Graduation dropdown
  const gradValues = [...new Set(data.map(row => row["Graduation"]))].sort();
  setDropdown("gradFilter", gradValues, "Graduation");

  // Graduation Stream Category dropdown
  const streamCatValues = [...new Set(data.map(row => row["Graduation Stream Category"]))].sort();
  setDropdown("gradStreamFilter", streamCatValues, "Graduation Stream Category");

  // Graduation Year dropdown
  const gradYearValues = [...new Set(data.map(row => row["Graduation Year"]))].sort();
  setDropdown("gradYearFilter", gradYearValues, "Graduation Year");

  // Areas Interested dropdown (fixed list)
  const allAreas = ["Marketing", "Consulting", "Analytics", "Sales", "Operations", "Finance", "HR"];
  setDropdown("interestFilter", allAreas, "Areas Interested");
}


  function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}


// function applyFilters() {
//   const cgpaVal = parseFloat(document.getElementById("cgpaFilter").value) || 0;
//   const gradYear = document.getElementById("gradYearFilter").value;
//   const areaInt = document.getElementById("interestFilter").value;
//   const m10 = parseFloat(document.getElementById("marks10Filter").value) || 0;
//   const m12 = parseFloat(document.getElementById("marks12Filter").value) || 0;
//   const ug = parseFloat(document.getElementById("ugFilter").value) || 0;
//   const workEx = document.getElementById("workExFilter").value;
//   const streamCheck = stream ? row["Graduation Stream Category"] === stream : true;


//   const grad = document.getElementById("gradFilter").value;


//   let filtered = window.originalData.filter(row => {
//     const cgpaCheck = parseFloat(row["Current Aggregate CGPA"] || 0) >= cgpaVal;
//     const m10Check = parseFloat(row["10th Marks"] || 0) >= m10;
//     const m12Check = parseFloat(row["12th Marks"] || 0) >= m12;
//     const ugCheck = parseFloat(row["Graduation Percentage"] || 0) >= ug;
//     const gradCheck = gradYear ? row["Graduation Year"] === gradYear : true;
//     let intCheck = true;
//     if (areaInt) {
//       const interests = (row["Areas Interested"] || "")
//         .toLowerCase()
//         .split(",")
//         .map(s => s.trim());
//       intCheck = interests.includes(areaInt.toLowerCase());
//     }
//     const streamCheck = stream ? row["Graduation Stream"] === stream : true;
//     const graduationCheck = grad ? row["Graduation"] === grad : true;

//     let workCheck = true;
//     const wex = parseInt(row["Work -Ex (in Months)"] || 0);
//     if (workEx === "0") workCheck = wex === 0;
//     else if (workEx === "< 12") workCheck = wex >= 1 && wex <= 12;
//     else if (workEx === "> 12") workCheck = wex >= 13 ;
//     else if (workEx === "> 24") workCheck = wex >= 25 ;
//     else if (workEx === "> 36") workCheck = wex > 36;

//     return cgpaCheck && m10Check && m12Check && ugCheck && gradCheck && intCheck && workCheck && streamCheck && graduationCheck;
//   });

//   renderGrid(filtered);
//   filteredData = filtered;
// }
function applyFilters() {
  const urlParams = new URLSearchParams(window.location.search);
  const recruiterCompany = urlParams.get("company")?.toLowerCase();

  const cgpaVal = parseFloat(document.getElementById("cgpaFilter").value) || 0;
  const gradYear = document.getElementById("gradYearFilter").value;
  const areaInt = document.getElementById("interestFilter").value;
  const m10 = parseFloat(document.getElementById("marks10Filter").value) || 0;
  const m12 = parseFloat(document.getElementById("marks12Filter").value) || 0;
  const ug = parseFloat(document.getElementById("ugFilter").value) || 0;
  const workEx = document.getElementById("workExFilter").value;
  const grad = document.getElementById("gradFilter").value;
  const stream = document.getElementById("gradStreamFilter").value;

  let filtered = window.originalData.filter(row => {
    const cgpaCheck = parseFloat(row["Current Aggregate CGPA"] || 0) >= cgpaVal;
    const m10Check = parseFloat(row["10th Marks"] || 0) >= m10;
    const m12Check = parseFloat(row["12th Marks"] || 0) >= m12;
    const ugCheck = parseFloat(row["Graduation Percentage"] || 0) >= ug;
    const gradCheck = gradYear ? row["Graduation Year"] === gradYear : true;
    const streamCheck = stream ? row["Graduation Stream Category"] === stream : true;

    let intCheck = true;
    if (areaInt) {
      const interests = (row["Areas Interested"] || "")
        .toLowerCase()
        .split(",")
        .map(s => s.trim());
      intCheck = interests.includes(areaInt.toLowerCase());
    }

    const graduationCheck = grad ? row["Graduation"] === grad : true;

    let workCheck = true;
    const wex = parseInt(row["Work -Ex (in Months)"] || 0);
    if (workEx === "0") workCheck = wex === 0;
    else if (workEx === "< 12") workCheck = wex >= 1 && wex <= 12;
    else if (workEx === "> 12") workCheck = wex >= 13;
    else if (workEx === "> 24") workCheck = wex >= 25;
    else if (workEx === "> 36") workCheck = wex > 36;

    let companyCheck = true;
    if (recruiterCompany) {
      const companyInterests = (row["Company Interest"] || "").toLowerCase();
      companyCheck = companyInterests.includes(recruiterCompany);
    }
    return (
      cgpaCheck &&
      m10Check &&
      m12Check &&
      ugCheck &&
      gradCheck &&
      intCheck &&
      workCheck &&
      streamCheck &&
      graduationCheck &&
      companyCheck 
    );
  });

  renderGrid(filtered);
  filteredData = filtered;
}



function renderGrid(data) {
  //console.log("Student keys:", Object.keys(student)); 
  const grid = document.getElementById("studentGrid");
  grid.innerHTML = "";
  data.forEach(student => {
    const div = document.createElement("div");
    div.className = "grid-item student-card";
    div.dataset.id = student["IITK Email"]; // Unique ID


    div.innerHTML = `
    <input type="checkbox" class="student-select-checkbox" data-id="${student["IITK Email"]}" />
    <img src="images/${student.Name.trim()}.jpg" alt="${student.Name}" onerror="this.onerror=null; this.src='images/default.jpg';" />
    <h4>${student.Name}</h4>
    <p>${student["IITK Email"]}</p>
    <p><strong>Work-Ex:</strong> ${student["Work -Ex (in Months)"]} Months</p>
    <div style="display: flex; justify-content: center; gap: 10px; align-items: center;">
      <a href="${student["LinkedIn URL"]}" target="_blank">
        <img src="icons/linkedin.png" alt="LinkedIn" style="width: 20px; height: 20px;" />
      </a>
      <a href="resumes/${student.Name.trim()}.pdf" target="_blank">
        <img src="icons/preview.png" alt="View Resume" style="width: 20px; height: 20px;" />
      </a>
    </div>
  `;
  
    div.onclick = (e) => {
    if (e.target.classList.contains("student-select-checkbox")) return;
    openModal(student);
  };
      grid.appendChild(div);
  });

addCheckboxListeners();

}

function addCheckboxListeners() {
  document.querySelectorAll(".student-select-checkbox").forEach(checkbox => {
    const id = checkbox.dataset.id;
    checkbox.checked = selectedStudents.has(id);
    const card = checkbox.closest(".student-card");
    card.classList.toggle("selected", checkbox.checked);

    checkbox.addEventListener("change", (e) => {
      if (e.target.checked) {
        selectedStudents.add(id);
      } else {
        selectedStudents.delete(id);
      }
      updateSelectionUI();
    });
  });
}

function updateSelectionUI() {
  document.getElementById("selectedCount").textContent = `${selectedStudents.size} selected`;

  document.querySelectorAll(".student-card").forEach(card => {
    const id = card.dataset.id;
    card.classList.toggle("selected", selectedStudents.has(id));
    const checkbox = card.querySelector(".student-select-checkbox");
    checkbox.checked = selectedStudents.has(id);
  });

  const visibleCheckboxes = [...document.querySelectorAll(".student-select-checkbox")]
    .filter(cb => cb.closest(".student-card").offsetParent !== null);

  const allVisibleSelected = visibleCheckboxes.every(cb => selectedStudents.has(cb.dataset.id));
  document.getElementById("selectAllCheckbox").checked = allVisibleSelected;
}

function openModal(student) {
  document.getElementById("modalImage").src = `images/${student.Name.trim()}.jpg`;
  document.getElementById("modalName").textContent = student.Name;

  document.getElementById("modalDetails").innerHTML = `
    <div style="text-align: left; position: relative; padding-bottom: 40px;">
      <p><strong>Email:</strong> ${student["IITK Email"]}</p>
      <p><strong>Work Ex:</strong> ${student["Work -Ex (in Months)"]} months</p>
      <p><strong>Previous Company:</strong> ${student["Previous Employment History"] || "N/A"}</p>
      <p><strong>UG College:</strong> ${student["UG College"]}</p>
      <p><strong>UG Degree:</strong> ${student["Graduation"]},${student["Graduation Stream"]}</p>

      <p><strong>Area Interested:</strong> ${student["Areas Interested"]}</p>
      <p><strong>Current CGPA:</strong> ${student["Current Aggregate CGPA"]}</p>

      <a href="resumes/${student.Name.trim()}.pdf" target="_blank" 
         style="position: absolute; bottom: 10px; right: 10px; display: flex; align-items: center; gap: 6px; text-decoration: none; color: #0077b5;">
        <img src="icons/preview.png" alt="Resume Icon" style="width: 30px; height: 25px;" />
        <span style="font-weight: bold;">Resume</span>
      </a>
    </div>
  `;

  document.getElementById("studentModal").style.display = "flex";
}



function closeModal() {
  document.getElementById("studentModal").style.display = "none";
}
function downloadSelectedData() {
  if (selectedStudents.size === 0) {
    alert("No selected students to download!");
    return;
  }

  // Convert Set to Array of IDs
  const selectedIds = Array.from(selectedStudents);

  // Use originalData to find matching students
  const selectedData = window.originalData.filter(student =>
    selectedIds.includes(student["IITK Email"])
  );

  if (selectedData.length === 0) {
    alert("Selected data not found!");
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(selectedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Students");

  XLSX.writeFile(workbook, "Selected_Students_List.xlsx");
}

