document.addEventListener("DOMContentLoaded", () => {
  fetch("data/students.xlsx")
    .then(res => res.arrayBuffer())
    .then(ab => {
      const wb = XLSX.read(ab, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(ws);
      window.originalData = data;
      populateFilters(data);
      renderGrid(data);
    });

  const filters = [
    "cgpaFilter", "gradYearFilter", "interestFilter", "gradFilter",
    "marks10Filter", "marks12Filter", "ugFilter", "workExFilter", "gradStreamFilter"

  ];
  filters.forEach(id => document.getElementById(id).addEventListener("change", applyFilters));
});

// function populateFilters(data) {
//   const setDropdown = (id, accessor) => {
//     const select = document.getElementById(id);
//     const values = [...new Set(data.map(accessor))].sort();
//     values.forEach(v => {
//       const opt = document.createElement("option");
//       opt.value = v;
//       opt.textContent = v;
//       select.appendChild(opt);
//     });
//   };
//   setDropdown("gradFilter", row => row["Graduation"]);
//   setDropdown("gradStreamFilter", row => row["Graduation Stream"]);
//   setDropdown("gradYearFilter", row => row["Graduation Year"]);
//   setDropdown("interestFilter", () => {
//     const interestsSet = new Set();
//     data.forEach(row => {
//       const raw = row["Areas Interested"];
//       if (raw) {
//         raw.split(",").forEach(item => interestsSet.add(item.trim().toLowerCase()));
//       }
//     });
//     return Array.from(interestsSet).sort((a, b) => a.localeCompare(b));
//   });
//   }

function populateFilters(data) {
  const setDropdown = (id, values, label) => {
    const select = document.getElementById(id);
    select.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = label;
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All";
    select.appendChild(allOption);

    values.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v;
      opt.textContent = v;
      select.appendChild(opt);
    });
  };

  // Graduation dropdown
  const gradValues = [...new Set(data.map(row => row["Graduation"]))].sort();
  setDropdown("gradFilter", gradValues, "Graduation");

  // Graduation Stream dropdown
  const streamValues = [...new Set(data.map(row => row["Graduation Stream"]))].sort();
  setDropdown("gradStreamFilter", streamValues, "Graduation Stream");

  // Graduation Year dropdown
  const gradYearValues = [...new Set(data.map(row => row["Graduation Year"]))].sort();
  setDropdown("gradYearFilter", gradYearValues, "Graduation Year");

  // Areas Interested dropdown (fixed list)
  const allAreas = [
    "Marketing", "Consulting", "Analytics", "Sales", "Operations", "Finance", "HR"
  ];
  setDropdown("interestFilter", allAreas, "Areas Interested");
}



function applyFilters() {
  const cgpaVal = parseFloat(document.getElementById("cgpaFilter").value) || 0;
  const gradYear = document.getElementById("gradYearFilter").value;
  const areaInt = document.getElementById("interestFilter").value;
  const m10 = parseFloat(document.getElementById("marks10Filter").value) || 0;
  const m12 = parseFloat(document.getElementById("marks12Filter").value) || 0;
  const ug = parseFloat(document.getElementById("ugFilter").value) || 0;
  const workEx = document.getElementById("workExFilter").value;
  const stream = document.getElementById("gradStreamFilter").value;
  const grad = document.getElementById("gradFilter").value;


  let filtered = window.originalData.filter(row => {
    const cgpaCheck = parseFloat(row["Current Aggregate CGPA"] || 0) >= cgpaVal;
    const m10Check = parseFloat(row["10th Marks"] || 0) >= m10;
    const m12Check = parseFloat(row["12th Marks"] || 0) >= m12;
    const ugCheck = parseFloat(row["Graduation Percentage"] || 0) >= ug;
    const gradCheck = gradYear ? row["Graduation Year"] === gradYear : true;
    let intCheck = true;
    if (areaInt) {
      const interests = (row["Areas Interested"] || "")
        .toLowerCase()
        .split(",")
        .map(s => s.trim());
      intCheck = interests.includes(areaInt.toLowerCase());
    }
    const streamCheck = stream ? row["Graduation Stream"] === stream : true;
    const graduationCheck = grad ? row["Graduation"] === grad : true;

    let workCheck = true;
    const wex = parseInt(row["Work -Ex (in Months)"] || 0);
    if (workEx === "0") workCheck = wex === 0;
    else if (workEx === "1-12") workCheck = wex >= 1 && wex <= 12;
    else if (workEx === "13-24") workCheck = wex >= 13 && wex <= 24;
    else if (workEx === "25-36") workCheck = wex >= 25 && wex <= 36;
    else if (workEx === "37") workCheck = wex > 36;

    return cgpaCheck && m10Check && m12Check && ugCheck && gradCheck && intCheck && workCheck && streamCheck && graduationCheck;
  });

  renderGrid(filtered);
}

function renderGrid(data) {
  //console.log("Student keys:", Object.keys(student)); 
  const grid = document.getElementById("studentGrid");
  grid.innerHTML = "";
  data.forEach(student => {
    const div = document.createElement("div");
    div.className = "grid-item";

    div.innerHTML = `
    <img src="images/${student.Name.trim()}.jpg" alt="${student.Name}" onerror="this.onerror=null; this.src='images/fallback.png';" />
    <h4>${student.Name}</h4>
    <p>${student["IITK Email"]}</p>
    <div style="display: flex; justify-content: center; gap: 10px; align-items: center;">
      <a href="${student["LinkedIn URL"]}" target="_blank">
        <img src="icons/linkedin.png" alt="LinkedIn" style="width: 20px; height: 20px;" />
      </a>
      <a href="resumes/${student.Name.trim()}.pdf" target="_blank">
        <img src="icons/download.png" alt="View Resume" style="width: 20px; height: 20px;" />
      </a>
    </div>
  `;
  
    div.onclick = () => openModal(student);
    grid.appendChild(div);
  });




}

function openModal(student) {
  document.getElementById("modalImage").src = `images/${student.Name.trim()}.jpg`;
  document.getElementById("modalName").textContent = student.Name;

  document.getElementById("modalDetails").innerHTML = `
    <div style="text-align: left; position: relative; padding-bottom: 40px;">
      <p><strong>Email:</strong> ${student["IITK Email"]}</p>
      <p><strong>UG College:</strong> ${student["UG College"]}</p>
      <p><strong>Previous Company:</strong> ${student["Previous Employment History"] || "N/A"}</p>
      <p><strong>Work Ex:</strong> ${student["Work -Ex (in Months)"]} months</p>
      <p><strong>Area Interested:</strong> ${student["Areas Interested"]}</p>
      <p><strong>CGPA:</strong> ${student["Current Aggregate CGPA"]}</p>

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
