let utRecords = [];


export function init() {

    document.getElementById("exportUTDataBtn").addEventListener("click", () => {
        alert("📄 This will export the batch release report.");
    });
    document.getElementById("openFormPanelBtn").addEventListener("click", () => {
        openFormPanel()
    });
    document.getElementById("closeFormPanelBtn").addEventListener("click", () => {
        closeFormPanel()
    });

    document.getElementById("Product").value = "155mm HE";

    fetchCurrentUser();
    loadBandingRecords(); 

    

    // Initial render
    renderUTTable();

    // Handle form submission
    document.getElementById("utForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        if (!token) return;

        console.log("saving banding data");
        

        const imageInput = document.getElementById("bandingImage");
        const file = imageInput.files[0];

        const formData = new FormData();
        formData.append("serial", document.getElementById("serialNumber").value);
        formData.append("cast_code", document.getElementById("cast_code").value);
        formData.append("heat_code", document.getElementById("heat_code").value);
        formData.append("product", "155mm HE");
        formData.append("pressure", document.getElementById("pressPressure").value);
        formData.append("gap", document.getElementById("bandingGap").value);
        formData.append("diameter", document.getElementById("diameter").value);
        if (file) {
          const resizedImage = await resizeImage(file);
          formData.append("image", resizedImage);
        }


        try {
          const response = await fetch("https://tracewiseptf.onrender.com/api/banding/", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}` // DO NOT set Content-Type manually
            },
            body: formData
          });

          const saved = await response.json();
          console.log("saved: ", saved);
          
          if (!response.ok) {
            throw new Error(saved.detail || Object.values(saved).join(" "));
          }

          

          // Optionally update your UI
          utRecords.unshift({
            serial: saved.serial,
            cast_code: saved.cast_code,
            heat_code: saved.heat_code,
            product_name: saved.product_name,
            pressure: saved.pressure,
            gap: saved.gap,
            diameter: saved.diameter,
            image: saved.image,
            user: currentUser,
            date: new Date(saved.date).toLocaleString()
          });

          console.log("utRecords: ", utRecords);
         

          renderUTTable();
          this.reset();
        } catch (err) {
          console.error("❌ Error saving banding record:", err);
          // ✅ Show in alert or below form
          const messageDiv = document.getElementById("utMessage");
          messageDiv.textContent = `❌ ${err.message}`;
          messageDiv.style.color = "red";
          

          // // Optional: auto-clear after 3s
          // setTimeout(() => {
          //   messageDiv.textContent = "";
          // }, 3000);
        }



        // utRecords.unshift(newRecord);
        // renderUTTable();
        // this.reset();
        // closeFormPanel();
    });


}

function closeFormPanel() {
    document.getElementById("utFormPanel").classList.remove("open");

    const overlay = document.getElementById("utOverlay");
    if (overlay) overlay.remove();
}

function openFormPanel() {
    document.getElementById("utFormPanel").classList.add("open");

    // Optional overlay
    const overlay = document.createElement("div");
    overlay.id = "utOverlay";
    overlay.className = "ut-overlay";
    overlay.onclick = closeFormPanel;
    document.body.appendChild(overlay);
}



    






let currentUser = "Unknown";

async function fetchCurrentUser() {
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/whoami/", {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    if (response.ok) {
      const user = await response.json();
      currentUser = user.username; // or use user.first_name + " " + user.last_name
      console.log("✅ Logged in as:", currentUser);
    } else {
      console.warn("❌ Failed to fetch user info");
    }
  } catch (err) {
    console.error("Error fetching current user:", err);
  }
}



function resizeImage(file, maxSize = 600) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Scale while maintaining aspect ratio
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject("Failed to resize image");
          const resizedFile = new File([blob], file.name, { type: file.type });
          resolve(resizedFile);
        },
        file.type,
        0.9 // quality (for JPEG/PNG)
      );
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}





async function loadBandingRecords() {
  console.log("loadng banding records");
  
  const token = localStorage.getItem("authToken");
  if (!token) return;

  try {
    const response = await fetch("https://tracewiseptf.onrender.com/api/banding/", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch banding records.");
    }

    const records = await response.json();
    console.log("records: ", records);
    

    utRecords = records.map(r => ({
      serial: r.serial,
      cast_code: r.cast_code,
      heat_code: r.heat_code,
      product_name: r.product_name,
      pressure: r.pressure,
      gap: r.gap,
      diameter: r.diameter,
      image: r.image || "", // full image URL from backend
      user: r.recorded_by?.username || "-", // assuming recorded_by is nested
      date: new Date(r.date).toLocaleString()
    }));

    console.log("utRecords: ", utRecords);
    

    renderUTTable();
  } catch (err) {
    console.error("❌ Error loading banding records:", err);
    alert("❌ Could not load banding records.");
  }
}




const utTableBody = document.getElementById("utTableBody");


// Attach change listener to dropdowns
document.querySelectorAll(".sentence-dropdown").forEach(select => {
    select.addEventListener("change", (e) => {
        const index = e.target.dataset.index;
        const newValue = e.target.value;
        utRecords[index].sentence = newValue;

        // Optional: confirmation or toast message
        console.log(`Sentence updated for ${utRecords[index].serial}: ${newValue}`);
    });
});



function renderUTTable() {
  const tbody = document.getElementById("utTableBody");
  tbody.innerHTML = "";

  if (utRecords.length === 0) {
      utTableBody.innerHTML = "<tr><td colspan='10'>No Banding Records found.</td></tr>";
      return;
  }

  utRecords.forEach(record => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${record.serial}</td>
        <td>${record.cast_code}</td>
        <td>${record.heat_code}</td>
        <td>${record.product_name}</td>
        <td>${record.pressure}</td>
        <td>${record.gap}</td>
        <td>${record.diameter}</td>
        <td>
            ${record.image ? `<img src="${record.image}" alt="Banding" height="40">` : "No image"}
        </td>
        <td>${record.user}</td>
        <td>${record.date}</td>
    `;
    tbody.appendChild(row);
  });
}








export function saveChanges() {
  // Simulate saving to backend (replace with API call later)
  console.log("Saving changes...");
  console.table(utRecords);

  alert("✅ Changes saved successfully!");
}
// Expose globally so inline HTML can access it
window.saveChanges = saveChanges;


export function getCurrentShift() {
  const hour = new Date().getHours();
  return (hour >= 6 && hour < 18) ? "Day" : "Night";
}
// Expose globally so inline HTML can access it
window.getCurrentShift = getCurrentShift;


export function updateCNCDropdown(index, value) {
  utRecords[index].determination = value;
}
// Expose globally so inline HTML can access it
window.updateCNCDropdown = updateCNCDropdown;

export function updateCNCComment(index, text) {
  utRecords[index].comments = text.trim() || "-";
}
// Expose globally so inline HTML can access it
window.updateCNCComment = updateCNCComment;
