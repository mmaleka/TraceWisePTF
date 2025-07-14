export function init() {

    document.getElementById("verifyCofCBtn").addEventListener("click", () => {
        verifyCofC()
    });
    document.getElementById("printCofCBtn").addEventListener("click", () => {
        printCofC()
    });

    // Initial render
    // renderTable();



}

const inspectionData = [
  { shell: "SN001", cast: "CC100", heat: "HC200" },
  { shell: "SN002", cast: "CC101", heat: "HC201" },
  { shell: "SN003", cast: "CC102", heat: "HC202" },
];

let isCofCVerified = false;

const { jsPDF } = window.jspdf;

const inspectionTableBody = document.querySelector("#inspectionTable tbody");

const palletTable = document.querySelector("#palletTable tbody");

inspectionData.forEach((item, index) => {
  const row = document.createElement("tr");
  row.innerHTML = `<td>${item.shell}</td><td>${item.cast}</td><td>${item.heat}</td>`;
  row.style.cursor = "pointer";
  row.addEventListener("click", () => moveToPallet(row));
  inspectionTableBody.appendChild(row);
});



function moveToPallet(row) {
  // Add remove button cell
  if (!row.querySelector(".remove-btn")) {
    const removeTd = document.createElement("td");
    removeTd.innerHTML = `<button class="btn btn-danger btn-sm remove-btn">Remove</button>`;
    removeTd.querySelector("button").addEventListener("click", (e) => {
      e.stopPropagation();  // Prevent row click triggering
      removeFromPallet(row);
    });
    row.appendChild(removeTd);
  }

  // Move row to pallet table
  palletTable.appendChild(row);
}


function removeFromPallet(row) {
  // Remove the last cell (remove button)
  const lastCell = row.lastElementChild;
  if (lastCell && lastCell.classList.contains("remove-btn") || lastCell.querySelector(".remove-btn")) {
    row.removeChild(lastCell);
  }
  // Move row back to inspection table
  inspectionTableBody.appendChild(row);
}




// Global records array
const Records = [
  {
    cocnumber: "0001",
    product: "Shell Casing",
    user: "j.molefe",
    date: "2025-07-08 11:42 AM",
    quantity: 24,
    complete: "✔",
    comments: ""
  }
];



function verifyCofC() {
  const palletRows = palletTable.querySelectorAll("tr");
  const palletData = Array.from(palletRows).map(row => {
    const cells = row.querySelectorAll("td");
    return {
      shell: cells[0].innerText,
      cast: cells[1].innerText,
      heat: cells[2].innerText
    };
  });
  console.log("✅ CofC Verified with Pallet Data:", palletData);

  // Example incoming JSON verification status:
  const verificationStatus = {
    missing: {
      heat_treatment: ["SH-001-AA01-HT01"],
      UT: "All Complete",
      Banding: "All Complete",
      MPI: "All Complete",
      Balancing: ["SH-003-AA01-HT01"],
      final_inspection: "All Complete"
    }
  };

  // Update modal content dynamically
  updateVerificationSummaryTable(verificationStatus.missing);

  // Mark as verified
  isCofCVerified = true;

  // Enable Print button
  document.getElementById("printCofCBtn").disabled = false;

  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('verificationModal'));
  modal.show();
}





function printCofC() {
  
  if (!isCofCVerified) {
    alert("⚠️ Please verify the CofC before printing.");
    return;
  }
  
  const allChecksPassed = true;

  if (allChecksPassed && Records.length > 0) {
    const latest = Records[0];

    // Extract pallet data rows
    const palletRows = palletTable.querySelectorAll("tr");
    const palletData = Array.from(palletRows).map(row => {
      const cells = row.querySelectorAll("td");
      return {
        shell: cells[0].innerText,
        cast: cells[1].innerText,
        heat: cells[2].innerText
      };
    });

    generateCofCPDF(
      latest.cocnumber,
      latest.product,
      latest.user,
      latest.date,
      palletData // pass pallet items here!
    );
  } else {
    alert("❌ Cannot generate CofC PDF. Some checks are incomplete.");
  }
}








function generateCofCPDF(cocNumber, product, user, date, palletItems = []) {
  const doc = new jsPDF();
  
  // Your Base64 logo string here:
  const logoBase64 = "data:data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEBLAEsAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAJYAyADASIAAhEBAxEB/8QAHgABAAICAwEBAQAAAAAAAAAAAAgJBgcDBQoEAgH/xABgEAABAwMCAwQDCAkOCAwHAAAAAQIDBAUGBxEIEiEJEzFBFDhRFSIyYXF1gbMXI0JSdHahsrQWGBkzN1ZicnOCkZKUsTRTV5OVtdLTJTU2Q0lVY4eiwcTRKDlGWIOWo//EABYBAQEBAAAAAAAAAAAAAAAAAAABAv/EABgRAQEBAQEAAAAAAAAAAAAAAAABESEx/9oADAMBAAIRAxEAPwC1MABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA0Lxn8Rty4XtJaTLrXZ6W91M12hty01ZI5jEa+OV6u3b13Tu0T6TfRCbtcfVftf4zUn1FSFaA/Zj8y/wAnli/tkw/Zj8y/yeWL+2TFegC4sL/Zj8y/yeWL+2THJD2yOWtkRZtObK9nmjK6Zq/0qi/3FeABi0nDe2RsFXVRxZVpvcLXT+D6m0XFlY75e7kZF+epNDRfiM084gbU+twjI6a6SRNR1RQP3iq6bf8AxkLtnIm/TmRFaq+CqeeY7nDsyvmn2S0GQY5dKmzXmhkSWnrKV/K9jv8AzRU6K1d0VFVFRUUGPSUCNXA5xb0/FHp1KtybDR5tZeSG7UkXvWSou/JUxp5NfsqKn3LkVPBW7yVDIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHzXFdrfVKnj3Tv7lA+kFD/BFkF0quLDTOKa5VcsT7q1HMfO5zVTkd4oql8AUAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhN2uPqv2v8AGak+oqSbJCbtcfVftf4zUn1FSFU6gANAAAAACRPAHq7NpBxQYlUq53ubfJksNdG37qOoc1rFX4mypE9fiavtL2jzfac1FRSahYvPSIrqqO6Ur4kTxV6StVv5dj0ghmgACAAAAAAAAAAAAAAAAAAAAAAAAAAAHzXL/i6q/kn/ANyn0nzXL/i6q/kn/wBygUM8DfrbaYfOzfzHF95QhwN+ttph87N/McX3haAAIAHS3LNces8nJX362UL+ZW8tTWRxrunimyuTqgHdA+C2X+13tqOt1ypK9qt50WlnbIip7feqvQ+8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEJu1x9V+1/jNSfUVJNkhN2uPqv2v8AGak+oqQqnUABoAAAAybTrTXJtWcro8bxKz1N7vNUuzKembvyt83vcvRjE36ucqInmoG2eBLSap1d4nsMomQLJbrTVsvVwftu1kNO5JER3xPekcf88vkI9cGPCVbOFbT2SkkliuWX3bkmvFzjReRXNReSGLfr3bOZdlXq5VVy7bo1shQzQxrP9SsV0rsL7zl1/oMetjV2SevnSNHu+9Yni938FqKvxGguNXjds3C9YktVsZBetQa+Lno7a9VWOljXdEnn268u6LysRUVyp5IiqlVFrsesfHBqjPLH7o5lf5NnT1U7kZSUESr03XpHBH47NTbfrsiqDFh+oXa6aXY7PJT4tYb5l72Ku1SrG0NM9Pa1z95P6Y0NVz9s1cHVHNDpRTRwdPeSX5znfH75KdE/IZDpb2PFlp6SGo1EzetratURz6DHI2wRRr5t76VrnPT40YxTddL2XnD/AE8KMkxy51Lk/wCclu9Qjl/quRPyA41XhXbE4VdKiOPKcDvOPscqostuq469rPYq8yRLt7dkX6SYGkHEPp3rxb1qsIymivL2M55qJHLFVQJ0+HC9Ee1N125ttlXwVSLuc9kVpXfKaV2NX7IMXrVRe7WSVlbTtXy3Y5rXr/nEITa18GOsfCFdo8ut881baaCTvIMqxuR7HUq+SytTZ8PsVV3Z125l32BxeCQduPao4rbtUarCXYNeH1UF5dZlqkqouRXtnWHn28dt032P3wF8frdd3Q4Jnj6ekzuKLejrmbMjvDWoqu96ibMmRqcytTo5OZURNlQrayj1urt+PM36eoXFmuu3aaYzoTqxkGC1+F3a6VdnkiZJV09TEyOTniZImyL1TZHon0EwbFdWX2x265RxuiZWU0dQ2Ny7q1HtRyIv9JRr2h3rk6kfhFL+hwEguNjjtulBjtr0m08uMlvZSWymgv8AeqV+0r5FhbzUsTk6sRu+z3J1Vd29ER3MTEw9e+0A0l0Eq6i11d1lybI4VVslosLWzPhd7JZFVI2Ki+LeZXJ96RKyPtk77NO9LBppb6SFFVGuuVzkncqeSqjGM2+TdflNQcM/Ztaga72+lv8AfJkwXE50SSGqroFkq6ti9UdFBu33qp4PerUXdFajkJxYh2VGhuP0UUd2pb3lFSnWSeuuT4UcvxNg7vZPi3VfjULxG219shmMLm+6Wndjq080pa2aDf8ArI83xpZ2s2leZ1lPQ5Va7rg1VMqNWpnRKyiYq+SyR7PTr5rGiJ4qqGaX3sxOHy7UqRUuJ11lei/t9Deapz1/z0kjfyEYte+yMuVmo6m66UZA+9siar/cG9uZHUv28op2o1jl9jXtZ4fCUJxZtjuS2jL7NTXexXOjvFqqm88FbQTtmhkT2te1VRTsihXh/wCIzULg21MniSCtgpIqjub5ily54mTbdHIrHJ9rlRPgv23Tz3aqot3ulOqGP6zYBZ8wxir9LtFzhSSNXbI+J3g+KRN12exyK1U9qdFVNlAy0Arp48O0XqsIu9w050rrI23inVYLtkcez/RX+DoKffdO8Twc/ryruie+RVaEuNbOLHS7h9R0OYZRT0115EkZZ6RFqK16L8Fe6ZurEXyc/lau3iRBy/tkrHS1b48W01r7lTbry1F2ubKR3xfa42S/nkP+H7g61S4s7pUXulR9LZpp3OrMpvsj1ZNJv7/kVd3zv33326IvwnN3J5af9kVpdYaaF+VX6/ZXXIid4kUjKGmcvxMajnp/nAvGmv2ZPJvSFd9jW09x5M905eb+tybfkNkYB2w+GXaoigzDBrtjrXdHVNtqmV8bV9qtVsTkT5Ecvym5qns0OHaenSNmCzUz9tu9ivVcrv8AxTKn5DVWpHZC6d3yCWXDMmvOLVvL7yGt5a6l38uioyRN/NedfkCcS10l1/091zt7qrB8qoL6sbEkmpYnqypgavTeSF6JIxN+m6t2XyUzi5f8XVX8k/8AuUog1Y4edYOC/MaG81Taq1dzN/wdlNinctNI72JIiIrFVN/tciNVyb9FQsk4IuOOn4lMWrsZyhae36h26kc97Y0RkVzhRuyzRt+5en3bE6deZvRVRoxWpwNettph87N/MeX3lCHA1622mHzs38x5fNcbjS2e31VfXVEdJRUsTp56iZyNZFG1Fc5zlXoiIiKqr8QWuC/5BbMVstbeLzX09rtVFE6eprKuRI4oWIm6uc5eiIVzcR3a0soayrsej9rirGxqsa5Ndo3d272rBTrsqp7HSbfxPMjTxv8AGld+JfL5rTZ6ie36dW2ZW0NAjlb6a9qqiVUyeblRfetXoxPjVyrFsGNk6h8SOqOq9Q+XKs7vd1Y5VX0Zap0VO3fx5YY+WNv0NQ1sAFctJVz0FTHUU00lPPGvMyWJ6tc1faip1Q3ppRxya06PzQNtWa1t0t0apvbL65a6nc1PuE7xVexP5NzV+M0MALneFftJcM12qoMeyqGHB8wlckcEU0/NRVzl8Eilcicj1X/m3+PTlc5V2SYx5nCz3s4uOyW7S2vSLUGtknrXKlPj97qJOZZfvaSVy9Vd5Ru8+jPHl3JixTJb2zGscut3lidNHb6SWrdGxdlekbFcqJ8a7ETuHftI8a4h9WLTgtuw662iruEc8jKuqqY3xt7qJ0ioqN69UYqfSSa1V/cvzD5mrPqHlIPAzqNZdJOJCxZdkNT6LZ7VQ3KonenwnbUM/KxqebnO5WtTzVyIEXi57qHjWl2NVOQZZeqOw2enT7ZV1kiMbv5Nani5y+TWoqr5IpBzU/tgMNsVZLSYNh1xypGOVvp9xqEoIHfwmN5Xvcn8ZGKQ1zjM9WO0S1xZSWyhmq0RXe59njk2orRS7oivkevRPueeRU3cuyInwGJNXSTsisCsFHBUagX+45Xc1RFkpLe70Kiavm3dN5X7eCO5mb/ep5Bpl3bGZ6tTzNwPHEp/8Ws1Qr/63Nt+Q2XgPbGY3XSxw5np/crQ1dmuq7NWMrG/xljkSNWp8SOcvy+BIl3Z48PLqVaf7G9KjOXk5kuFZz7fxu+33+Pfc0Zq72RGEX2jnqdO8huGL3NGqsdFdHel0T18m82ySs383bv2+9UHEyNJtasK1yxz3bwjIKW+0LVRsyQqrZadypujZY3IjmL49HIm+3TdDNygWlqdV+BrWtN21GNZNQKivhevPS3GnVfBdl5ZoX7eXgqfcub0ue4deJDHOIHRqlzylmhtbYY3tvFLNMm1unjbzSte5dveomz0cu27HIq7dUQNrVlZBb6Saqqp46amhYsks0z0YyNqJurnOXoiInVVUhnrN2qmlmnFfU2zF6St1BuMDuVZre9sFBuniiVDt1d8rGOavkpC3jO4zsl4pc5XDMKdXx4MyqSkobbRI7vrzLz7NlkY3q5HO25I18OiqnN4bn4eOySluNBS3nV28TW90rUkbjlmkb3rPPaedUc1F8lbGi/xwOiunbHZrNUudbdPrDSU+/SOqqp53onsVzeRF+XY77FO2TrW1kbMl00p5KVej5rVc3Ne340ZIxUd8nMnykuLFwA6A2ChbSw6cW+qRPGWunnqJHL7Vc96r9CbJ8RiWovZi6GZxTTe51jrMPr3pu2qsta/lRfLeKVXs29qIifKniDjN9A+NzSniIkjobBe3WvIH+FivTW09W7+T98rJfPoxzlRE3VEN9FHnFTwL5xwpzw5DTVq5DiKTt7m/wBCx0MtHJv7xJmIqrGu+3K9FVqrt1RVRCZfZ4cd9Tq06DTXUKtSXLoYlW1XeVdnXONibuik9szWoq833bUXf3yKrhifAACAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR+42+HW9cTukFHiNhudvtVbDd4bgs9yV6RqxkUrFanI1y77yIvh5KSBIgdp/mV80+0FxzIcbulTZr1QZVSS01ZSv5Xsd6PU/QqKm6K1d0VFVFRUVUCop/sPGpf79MU/rVP+6H7DxqX+/TFP61T/ALolDwWdoTZNfoaTE8ydTY/qEiIyLZeSluvxxb/Bl9sS+Pi3fq1sygaqU/YeNS/36Yp/Wqf90c1H2OuoT50SrznGYYfN8LKiRyfQrG/3lsoBqurT7sdMct1a2fNM/r73TpsvoVnom0SKvsdI90iqnyNavxk19INCME0HsLrTg+O0tkp5NlnmZvJUVCp5yyuVXv8APZFXZN+iIhnwAGvtfdY7XoJpJkWb3VO9itsG8FNvstTUOXlhiT+M9Woq+Sbr5GwStPti9TKiGmwLT+mn5KedZr3WxJ4vVv2qn+hN6jp7dvYBDLTbCM142OIlKSprZKu932pdW3W6Pbuykp2qneSbeCNY3lYxvRN1Y1Nt0LwNG9GMU0HwWixTEbcyht9OiLJK5EWeql299NM/ZOd6+3wRNkRERERIjdkjo9T4zo1dtQamnT3UyasfTU07k32o6dys2b7OaZJd/b3bPYTyBQABA4qmmhrKeWnqImTwSsWOSKRqOa9qpsqKi9FRU6bHKAKgePnhNm4Xc7s+qGm/fWzGqqvbKxlP42ava7vGIz2Ru5VViLvyq1zfDlRYqY1kVVl+uVqv1akbay6ZHFXTpEmzEkkqUe7lTyTdy7F9+uWllBrXpJlOFXBjFiu1E+GKR6bpDOnvoZflZI1jv5pQHp/Qz2zVjG6OqidBVU97poZYn+LHtnajkX40VFQNRt7tDvXJ1I/CKX9DgNq9mrwkUmt+XVmoOYUyVuJ2CpbHBRzpzMuNdsj9n7/CZGitc5F+Er2Iu6cyGqu0O9cnUj8Ipf0OAts4LdPafTThe07tUMSRzT2qK5VPT3yzVKd+/mXzVFk5fkaieQG60RGoiImyJ4Ih/QAyAACCvaj8MlBnul8+p9momx5TjTGurnws99WUG+zuf2ui3R6OXwYkidfe7aM7I3XCpseoV70urqhXWu9wPuVuje7pHWRNTvEan8OFFVf5BvtUtKyjHqPLsau1iuEaS0FzpJqKoYqbo6ORiscn9DlKGOE+71On/Fppu9zlinhySnt0ytXwbLL6PJ9HLI4NLYe0B4jJeHrQmrfaan0fLMhc62Wp7HbPg3bvNUJ/Js8F8nvjK2eAjhPdxN6ny1t+jlXB7C5lRdH7q1ayVyqsdM13j77ZVcqdUai9UVzVM47WnUOTJuIugxhkqrR4zaYo1i36NqJ/tz3fTGsCfzSwLgI0qg0n4W8LpUgSK4XmmS+Vz9tnPlqER7eb42xd0z+YDxvu12qisdtpbfbqSCgoKWNsMFLTRpHFExqbNa1qbIiInREQ+oAMgAA6bMcOsuoGMXLHcit0F2stxhWCqo6hu7JGr+VFRdlRU2VFRFRUVEUpX4jdF8k4CuIq0XbGquZ9q71bjj9xm6rJGi8stNLtsiq1HKx6JtzMe1enNsl4JFjtJtJIdT+F2/1zIkddcXVt7pZNuqMj6Tt39ixOe7b2sb7AsVb8DXrbaYfOzfzHk8u1k4gZsMwC06Y2iodDcclRau5vjXZW0LHbNj//ACSIv0RORejiBvA1622mHzs38x53vaIZzNnPFxnD3SukpbTLFaKZjl37tsMbWvanxLKsrv5wVG4ABQAAAAAOajrJ7dWQVdLNJT1UEjZYponK18b2ru1zVTqioqIqKcIAvS0T1y/XCcGNZldQ5q3hLHW0N1a3bpVxQObI7ZPBHpyyInkkiIUY09PLV1EUEEbpppXIxkbE3c5yrsiInmqqWA9mJnc32NtdsLllV1OtkfeKaLfox3cyxTO2+NO4T+b8ZGbgqxSmzTir0ztlWxJKdLuyscx3g7uGunRF9qKsSIqeYRcDwc8NFt4Z9IbfaEp4nZRcI2VV8rmoiulqFTfu0d/i491Y1PDxdtu5TewAZAABHzjY4Y7fxK6P19HFSx/qwtMT6yx1myI9JkTdYFXx5JUTlVPBF5XfclMeCa35Pppp/n+FWyZYLZl9PDS17XKqPj7qTmVW+xXMWSNyebX/ABIeh88/XF5icGEcTmpdopY0hpo73UTxRImyMZK7vWtT4kSRET4kDUTo7J/hnoqXHqnWK+0TZ7jVySUVg75u6QQtVWTVDd/unOR0aL4ojH+Tyx017w9YvTYVoRp9ZKVrWxUdiomKrU253rC1Xv8Alc5XOX41NhBAABHXZFjtsy6w3Cy3mihuVqr4H01VSVDeaOWNybOaqfGilDWv+md44ReJWvtVorJoZbJXQ3Sx3BfhuhVUkgevtVvwHeSuY7psX7FWPbJ4zFS5vprkLWIk1fbqyge9E6q2CSN7UX+0u/pCxY9o/qLS6t6W4rmVG1I4b3boaxYmrv3T3NTnj39rX8zf5pmBEfstchkvfCPZ6V71f7lXOtom7rvsiyd9t/8A2JcAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAITdrj6r9r/ABmpPqKkmyQm7XH1X7X+M1J9RUhVPEM0lPKyWJ7opWORzHsXZzVTqiovkpZfwUdpim1vwXWKv6+9goMund9DWVi/k775OfzeVmgNPTBFKyeJksT2yRvajmvYu6ORfBUXzQ/ZTNwW9oVe9ApqPE8zdU5Bp65yMiXfnqrSnti3+FF7Yl8PFu3VrrgMOzKx6gY1QZBjl0przZa+NJaespX8zJG/+Sou6Ki7KioqKiKgZdyAAgU0drFcXV3FU2FVeqUdgo4E5nboiK+WTp7E+2L9O/tLlyoDtdsantnETYrwrESkumPwtY9G7byRTStei+1UR0f0KgWLEeCW1R2bhO0vp4kajX2WKoXlTZN5VWVfp3epu4jp2e2WQZdwh6fyxSc8tBTy22dnNusb4ZnsRF+ViMciexyEiwAACAAAFC2rlsgs/HFk1JTN5IGZ5I5jERERqOrubZETyTfZPiQvpPP1kuXRZ9xaXDJKeTvaW65o6sgcioqd0+t5o+qePvVaFjLe0O9cnUj8Ipf0OAur0jXfSjC/mSi+oYUqdod65OpH4RS/ocBdXpF+5PhXzJRfUMBWWgAIAAAef3HvtfF9bOX3vLnUW23Tb/hBD0BHn9sPrfW78eo/9YIFjIuP+rkreMLUuSVyuclbDGir962mia38jULyMOpIqDEbJSwNRsEFDBHG1PBGpG1ET+hCk7tI7DJYuMXOXOaqRVyUdZEqp8JHUkSOX+u16fQXKaJ5NDmmjmD32B6SR3GyUdTunkroWKqfKi7ovxoCs1AAQAAAxnU+zxZDppltqnajoa60VdK9q+CtfC9q/kUyYwHX7K4sG0Pz6/yvRiUFjrJmb/dPSF3I1PjV3Kn0gUncDXrbaYfOzfzHmKcTLnv4kNVnSM7uRcsuyuYjt+VfTJd038zK+Br1ttMPnZv5jz98dGHPwjiz1LonMcxtVdHXRiqnRyVTW1Cqi+abyqnyoqeQaaIAAUAAAAAAABL7s1JHJqFquxHKjF06urlbv0VUlptl2+lf6VMJ7Pf1xtNvwqp/RJjcfZi4c+ps+umVOjVI6LFZLYx6t6OWZskjkRfi9HbuiffJv5GnOz39cbTb8Kqf0SYIvbAAZAAAKI+0G9cXUr8Lp/0SEvcKI+0G9cXUr8Lp/wBEhCxdppZ+5jiHzPR/UsMoMX0s/cxxD5no/qGGUBAAACtPtnf8E0i/j3b+6jLLCtPtnf8ABNIv492/uowsbU7I/wBV+5/jNV/UUxNghP2R/qv3P8Zqv6imJsAoAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABCbtcfVftf4zUn1FSTZITdrj6r9r/Gak+oqQqnUABoN78LHF/mXC3kne2qRbri9VKjrjj1TIqQzeCK+Nevdy7J0eiddkRyOREQ0QAPQ9oZr5h3ERhUOSYfckqoOjKqil2bU0Uqp+1zM3XlXx2Xq1227VVOpsU86ujetWXaC5rS5Rh10fbrhF72WJ3voKqLfdYpmb7PYvs8UXZUVFRFS6LhK40cR4pLEkECsseaUkSOr7BNJu5UTxlgcv7ZHv9Ld9nJ1RXGcSIIPdrBozLneh9tzSggdNcMQqnPnRiKqrRT8rJV2Tx5Xthd8TUevtJwnyXe00d+tVbbLjTRVtvrYH01TTTN5mSxParXscnmioqoqfGBV12SPEBS47kN80pu9S2CK9Se6dndIuyOqmsRs0XyvjYxyfyTk8VQtQKJ+LPhnyPg/1ehltk9YmPTVCV2O36JVa9nK7mSNz08Jol2328U5XIib7JYDwadotjWsVooMX1Ar6fHM9hY2FKqpc2Kkuy+CPY7o2OVfONdkVV3ZvurWiprgAIAGpuILiewPhtxt9xyy6sS4SRudRWWmcj6yscnkxm/Ru/i92zU9u+yKGFce3EBT6CcP96lgqWx5Nf432m0RIvv0e9u0kyJ7I2Krt/DmViL8JClDTD90vEvnek+uYSHjk1F7S7iWh76N9Dao1aj0iVX01jtyP6qirsjpF6+xXvXyanvdPrj9JiXEstjoEelDbMu9Cp0kdzO7uOs5G7r5rs1OoajPu0O9cnUj8Ipf0OAur0i/cnwr5kovqGFKnaHeuTqR+EUv6HAXV6RfuT4V8yUX1DAlZaAAgAAB5/bD631u/HqP/WCHoCPP7YfW+t349R/6wQLEw+2G0mmivOF6k0sDnU00DrFXyNTox7XOlgVfjcjp03/7NE9htnspNdqXNtGajTutqGpfcUke+CJ7vfTUMr1e16b+PJI57F9iLH7UJV646Q2jXbSzIMJvfvKS6QKyOoRvM6mmReaKZqe1r0au2/VEVF6KpR212ovBDxA78vuVlVgnVE50V1NXU7t038u8hlb8ip/Bc3oVf+DQvC9xj4NxO2CFbZVx2jLI4963HKuVEqI3InvnReHex/wm+CbcyNVdjfQZAAAK/O1o1+gxzT226V22pR12v72V1zYx3WKijfvG13sWSVqKnxRO38UN28V3HPhHDbZa2gp6ymyLPVYraWw00nP3L1To+qc1ftbU6LyqqPd02TZVclcHDjormXHRrtc8xzOWpr7BBP6bkF2f7xsitbvHSRbbIiuRrW8rduRib9PeopYwXga9bbTD52b+Y4l72veh08kmM6r26DngZGlkuysb1Z75z6eRfiXmkYqr/wBmnmm0QuBr1ttMPnZv5jy9DPsFs2puGXjFchpG11mu1M6mqYV8Vavg5q+Tmrs5q+Soip4Ba83YNu8TvDbkXDJqTVY3eWOqbdLvNa7s1m0ddT77I5Oq8r08HM8UX2oqKuogoAAAAAAE3+zs4KKvWHJrfqNl1EkeBWuo7ykp527+61RG7o1Gr4wscnvlXo5U5E399yhMbhM0Sm0T4GrpBcKdae+3+01t7r2Obs+NZaZUijXzRWxNj3RfByuK4uz39cbTb8Kqf0SYuy1V/cvzD5mrPqHlJvZ7+uNpt+FVP6JMEXtgAMgAAFEfaDeuLqV+F0/6JCXuFEfaDeuLqV+F0/6JCFi7TSz9zHEPmej+oYZQYvpZ+5jiHzPR/UMMoCAAAFafbO/4JpF/Hu391GWWFafbO/4JpF/Hu391GFjanZH+q/c/xmq/qKYmwQn7I/1X7n+M1X9RTE2AUAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhN2uPqv2v8ZqT6ipJsnw3ex23IKVKa6W+luVMjkekNZC2ViOTdEXZyKm/VevxgeaoHo8+xfhv70rF/o2H/ZH2L8N/elYv9Gw/7Ia15wwejz7F+G/vSsX+jYf9kfYvw396Vi/0bD/sg15wzsscyS64ffaG9WS4VNqu1FKk1NW0kixyxPTwVrk6oeir7F+G/vSsX+jYf9kfYvw396Vi/wBGw/7INRG4Ke0YtWs7aHDNQ5qayZ0vLDTV/SOluzvBETyjmX7z4Ll+DsqoxJwGMppjhzVRUxOxoqdUVLbD0/8ACZMEYrqZphjOsGHV2L5baYLxZqtuzoZk99G7ZUSSN3ix7d12c3ZUKouJHsus800raq66dsmzzGN1e2mjRPdOmT710SbJNt099H1Xr7xuxcOAKE9PeL3XLQGRbHbctutDBRKkT7Le4UqWQIn/ADaRztV0SeHRnKbipe1x1qp6aSKS1YfUvcmyTS26oR7em26ctQjd/Pqils+Yab4lqFCyHKcXs2SRMTZjLvb4qpG9d+neNXbr7DWc/BHoRUTOkfpfYEc5d1SOBWN+hEVET6AaquzbtJte86ppKOLKIcfgm96sdhoY4JF3+9kVHSNX+K5FPs0R4DdY+Je/Nv2SMr8ds1Y7vqnIsl7x9TUIv3UcT17yVV8nO2bt915Lb3hmhmnWnU7J8YwbHrFUs8KmgtkMU3+cRvMv9JnINa20F4fcO4csJjxvEKDuI3KklZXz7Oqa2VE/bJX7Jv4rsibI1F2REKRMo9bq7fjzN+nqegQx5+nmKyVi1bsZs7qpZO9WdaCJXq/ffm5uXfffruDVJHaHeuTqR+EUv6HAXV6RfuT4V8yUX1DD77jgOMXitlrK/HLTW1cqosk9RQxSSP2TZN3K1VXoiJ9B3cMMdPEyKJjYomNRrGMTZrUToiInkgH7AAQAAA8/th9b63fj1H/rBD0BGPN08xVlYlW3GbO2qSTvUnSgi50fvvzc3Lvvv13CshNK8TnChhnFFizaDIIVoL3Ssd7m36lYi1FI5fJfDvI1XxjVdl8UVq7OTdQCKKdZ+B7WTh2urritmqrvaqV/eQZFjfPMxiIu6PcjU7yFU6dXIib+Dl8TnwTtFNesBpY6SPNH3ykiTZsV9po6t/0yuTvV+l5eeYDmugOmuo0sk2TYHjt6qn781VV22J0/x/beXnT+kLqrim7XfWiCm7p9kwuof/jpLfUo/wD8NSifkNc5zx+a/wCsDVsseUVFvirF5Et+M0jaaSTf7lr2Isy9N+iP6+Za9TcE2hVJJzs0ux5y+yWm7xP6HKqGyMP0yxDT2NY8XxWy441W8rktVvipuZPj5Gpv9INVM8NfZkZ/qxc6a86iRVWD4s5ySyR1KJ7p1iKu6tbEu6xb9d3Soip4o1xa9hunOOaT6fxYxilqgs1load7YqaBPFdur3OXq56r1VzlVVXxUy0/iojkVFTdF8UUChHga9bbTD52b+Y8vvOgodPsWtdXFV0WN2ikqol5o54KCJj2L7Ucjd0O/AwbWPRfEteMJqsWzG2MuFum99HI3Zs9LLsqNlhfsvI9N16+CoqoqKiqi1N8SHZnajaQVVbdMPglz7E2Kr2SUUe9wp2eO0sCdX7ffR7ou26ozwLnQB5oamlmoqiSCohkgnjXlfFK1WuavsVF6opxHovz3RbAdUdnZdhtjyKVreRs9xoI5ZmJ7GyKnM36FQ1BXdnLw7XCd00mnMTHu8Ugu1fE3+q2dET+gLqi87vEMJyDUC9w2fGrLX366TLsykt9O6aRfjVGouye1V6J5l4dh7P3h9xyo76k01oJX777V9XVVjf6s0r0/IbtxfDbBg9tS345Y7bYKBF3SltdJHTRIv8AEYiJ+QGq3eFXsqqmSop8j1oRIIWOR8OKUk6OdJ571MzF2RP4DFVV83J1RbLrRZ6DH7XSWy10VPbrdSRNhp6SlibHFDG1NmtY1qIjUROiIh9gCMW1V/cvzD5mrPqHlJvZ7+uNpt+FVP6JMXsSxMnifFKxskb2q1zHpujkXxRU80Okt2A4xaKyKsocctNFVxKqxz09DFHIxVTZdnI1FToqoB3wACAAAFEfaDeuLqV+F0/6JCXuHQ3HAcYu9ZLV12OWmtq5VRZJ6ihikkeu23VytVV6IgV8uln7mOIfM9H9Qwyg/EUTIImRRMbHGxqNaxibI1E8ERPJD9hAAACtPtnf8E0i/j3b+6jLLDrL1jFmyRIUu9pobokO/dem0zJuTfbfl5kXbfZPD2IFQ67I/wBV+5/jNV/UUxNg+G0WO24/SrTWu30ttplcr1ho4WxMVy7Iq7NRE36J1+I+4AAAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgrK+mt0SSVVRFTRqvKj5noxFX2br59FPj/AFUWb/rah/tLP/cDswfNRXOjuSPWkq4KpGbcywyI/l+XZT+1lwpbcxr6uphpWOXZHTSIxFX2dQPoB1n6qLN/1tQ/2ln/ALnYse2RqOaqOaqboqLuioB+gfiaaOmhklle2KKNque967NaidVVVXwQ6mw5pj2VSzx2W/Wy8SU67TMoKyOdY1/hIxV2+kDuQDhgraepkljhnilkiXlkax6OVi+xUTwX5QOYHDVVtPQxpJUzxU8aqjUdK9Goq+zdfM5gAOBK6mWrWlSoiWpRvMsPOnPt7eXx2P3PPFSwulmkZDExN3PkcjWonxqoHID8RSsniZJG9skb0RzXtXdHIvgqL5ofsADoqDPMaut3ktVFkVprLpGuz6GCuifO1evixHcyeC+Xkp3oAHDV1lPQQ97Uzx08W+3PK9Gt3+VTlRUciKi7ovVFQD+gHyXS7UNjopKy41tPb6SP4dRVStjjb8rnKiIB9YOtsOS2jKaL0yy3Wiu9Jvt39BUMnj38fhNVUOyAAHRWvPMavd0ktluyK1V9yj+HR0tbFJMzpv1Y1yqn9AHegHBS11NXI9aaoiqEY7lcsT0dyr7F28FA5wcFTXU1GsaVFRFAsjuViSPRvMvsTfxU5wABw+m0/pXovfxek8vP3POnPy+3bx2+MDmAOCkrqa4Rd7S1EVTHvy88L0em/s3QDnBwzVlPTzQxSzxxSzKqRse9Ec9U8eVPPxTwOYAD56+4Utqo5autqYaOliTmknqJEYxie1XL0Q+KwZVZcrgknsl4oLxDGvK+SgqmTtavXoqsVURei/0AdqAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMM1U0dw7W3Hqex5vY4r/AGqnqm1sVNNLJGjZmsexH7sc1d0bI9PHb3xAfNeFTSm2dodgGntLh9NDh1xxOW4VVqSonVktQjq1EerlfzIv2qPoi7e98PEsrIWaif8AzWtL/wARpvzriFiSmk2guBaF09ygwXHIMeiuTo31bYZpZO9cxHIxV53O225neHtI5dpXZ6PIrNotarjAlVb67PaGlqYHKqJJE9r2vaqpsqboqp0JmEL+0ysdNk9g0as9YsiUdwzuipJlherH8kjHsdyuTwXZV2XyBGyv2Prh8/ya0P8AbKr/AHpv222+ntFupaGkiSGkpYmwQxIqqjGNREanXr0REI44l2fOleF5VZsht02TLcLTWw19Ok96lkjWSJ6PZzNXo5u7U3TzQkuBBvMLbXccHFLlmntyulZQ6Pac9yy6W2hmWJ14uD1XZkrmqioxHMkTz2SLps5/M3a6cAmkVoyHHr9iVruGC3qzVcdTHW2C5TxSTsau7oZeZzt2PTo7bZ2y7b7boa54P6lmD8XvExhN0V0F4ud4ZkVE2V3WemkfLIqt8N0alTD4b/C28us0wBD/AIJ/WA4p/wAbmfnVJMArk0a4YMM4heIviQqMqku7JLXlax0/uZcH0qbSPnV3MjfhfATb2dQNt9qH6v8Aj343W782YmAVncbvB3gGhOlthyTGZb4+4vyShpFS43SSpj5HJIq+9d033YnX5SzECs3ibkybHeO3Kc8w6R0l9wTFaPI5LaiLy19Cx7IayJVTwTup1dv7Grt122k9xP55Z9UOBLNMssFSlVZ7vj3pdPJ03RHObu1yeTmru1yeStVPIxHF4mT9qNnEcjGyRv05Y1zHpujkWppN0VPNDTeqFFLw249rjoVXSyRYNkthrsnweZ7t2wuYneVVA1V+9VquRN+jW8y9ZAqbPDB6tOkv4o2j9DiND8X2SZDqzrlp9w7Y5earHqC/U77zk9yt71bOlvZ3iJA1yfB5+6kRU67q6PdOXdHb44YPVp0l/FG0focRHzUKsTAO060/u10RkNryrFJbNR1crdmelNfI7u0cv3Sr3Ten+OanmEjK8g7NnRCvw5bTZsdmxy8QxotHkNHXTurKedETlmVXScr+qIqtVNvHblXZU5eA7WDJ86xDLcIzyr9PzfT67vsldWuXd1TEiubFI5enM7eOVvMqbuRjXKqqqqSee9sbVc5Ua1E3VVXZEQhZ2fUrcs1W4lM+t+8uO3/Kmw2+qRF5Z0hfUvVzV8921ES7eXMB23ap+qVcPnei/PcSrxf/AJM2j8Dh/MQip2qfqlXD53ovz3Eq8X/5M2j8Dh/MQDtCAWj+n9L2gepea6j6jTVd102sV1ks2LYyyqkhpH92iK6oejFRVcrXRqqovVz3NVeViNJ+kLey2qm2HSXNNP69GU+SYpk9VT19Jy8sjUc1qNe5PHq6OVqKv+LA6Did4bbfwp4+mtuhkcuH3fHZopLvZ4KiWSjulG+RrXsfG9y7Iiuaqomycu6ps5qKTTwHMaPUPBseyi3oqUN6t8Fwga5d1ayWNr0RfjTm2X40NJ9oNltvxHhIz11dOyOS5UzLbSxu25pppZGojWoviqNR7/iRir5GweGrGK3DOHzTiyXKJ0FxorBRRVML02dFJ3LeZip7Wqqp9AEc9eau+cU/FEmgduvVZYMCxy3R3bLprfJ3c9c56MWOlR33qtlj6eHvnqqLyNM6vnZzaHV1hjo7NjVTil0puV9FfbPcahtdSytXdsiPe9yOVFT7pF+LZdlTBdKposA7THVq0XaVtNLl1jpLhaHSe99JSNkSPY1PNUVk30QuUyzjGwLUa2Y1mOpOLaxXvFaCy2Z9XHjlFSMdDI+Jiqq94rt05vPouwEoLZQpbLbSUaTz1KU8TIUmqZFklk5UROZ7l6ucu26r5ruQ/wAepF4W+OOstLWrT4DrDG+rpE32ipbzFu6RnsTvOZeieKzMTwYb74YsjueYcPOnV7vNZJcbtcLHS1FVVzLu+WR0aK5y/Gqmv+0AxSmvfDPkN8SSSjveKSQ3+0XCBdpaWqhkbyuavlu1zk+lF8UQDC6Kj/XO8cNRc5E9IwPRxnotMi7Oiqb5L1e5Pb3XKm/m18LF8HEwiP8AwIYXRYfwu4VNTOknrL9Te71xqpl5pKiqqdnve5fNUTlbv7GJv1JAACH/AP0pf/d3/wCqJgEP/wDpS/8Au7/9UCJgFWXZz5/cNCX4VFd6pZMA1QlqaSGZ7veW+9wTOjYxfvUmi7pvXq5yt8mKWmleHB/ofQcQnZ2VWIVb0pa2W61lTbK/b31HWxuRYZUXxTru123VWuciKm4G0OL31teE/wCd7t+ZRkvytSLV+5ax6q8Kq5K30TO8SyS649k1DL0lbWMZTIkuydNpGxq5VTpzcyJuiFlYECsBw1naCaxZvlWcVtVW6RYjdpLJYMapqh8NPWTxoivqJlYqKq8rmP8AHf7a1u6NaqO31ifBLphp1qVZM1wqiuOHXC3I9k9JabhK2luDHN5UZURvc7ma1ffbNVu6onNvshqrsyK+PH8L1K07r3LDkuM5bV+l00rt5FjejGNkXfqu74ZE38OiLv1JoAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADS2RcOHu/xW4vrT+qHuPcSxPsvuH6Fzd9zLUL3vf94nL/hHweRfgePXpukADR/FVw31nEhYMWordly4ZcMfvMd5prg23JWr3rGORiIxZGImyuR26qvhtt1N4ACKf62TiD/+6uu//TKX/fkm8doKy14/bKK43BbtcKalihqbg6JIlqpWsRHyqxFVG8yortkVdt9jsQBofiC4T7drNklmzOxZHcNP9SLK3u6HJrU3nesfvvtU0e6JIz3zum6dHORd2qqGEwcKOrOf3C3w6s67V+RYzQVMVSlmx62R2lax8bkexZpotnbI5rV5UReqIqK1URSVwChp/RPh9+w7qBqpk/u/7r/q5u7br6L6H3HoWyyL3fN3ju8/bPhbN8PDqbgARp/ih4ff1yWn9uxj3f8A1O+iXenuvpXofpXP3SPTu+XvGbb8/wALfpt4KbgAA0/aOH33L4pb3rJ7vd77pY62we4voe3d7Swyd733edf2nbl5E+F49OvzcVnDHauKPTyLH6u5OsF1o6j0i33qKDvn0yqnJKxWc7OZkkauareZE+CvXlRDdIAxnTDC/sb6aYliXpnuj7gWiktXpndd13/cQsi7zk3dy83Jvy7rtvtuviYnxDcOuL8SGFsseQpPR1dJL6TbLxQuRlVb508Hxu9i7Ijmr0VETwVGuTaQAh/c+EzXbL7NJiWUcSFZW4VI3uahtFYYYLhVweCxPnR3N1Toqq5/NzLzI5OhJTSzS/HdGsEtWIYrReg2a3R8kbFdzPkcq7vke77p7nKqqvtXpsmyGWAK0/xU8Pv65nSWowj3e/U33tZBVeneh+lbd2qry8neM8d/Hm6Gr6bhc1/pKeKCHiprmRRMRjGphtL0aibIn7eSwAHU4lbLhZMVs1uu91dfrrSUUNPWXV0KQrWzMYjZJljRVRivciu5UVUTfbc0Jq5wfz5Dqa7U3TDN6vSzUCeLua+spKRlVSXFvT9ugcqNV3vW7qu6LyoqtVepJEBEU8f4MckzPPrJl2uWplRqbLY5O/tlhgt0dBbYJuio98bF2k2VE+5aq8reZXJu0lYABpbiN4XLDxCwWevfc6/E8ysUiy2fJ7O7kqqR26Lyrsqc7N0Rdt0VF6tcm7t9UXjhO121Csk+J5zxESXDDKhvc1cFtx2np6yth2RFjfKnVu6boqqr99/fI4mAArocCwq2ab4VY8WszZWWqz0cVDTJM/nf3cbUaiud5qu26/8AkdHrjpj9mfSXKMI90vcf3bpFpfTu47/ud1Rebu+ZvN4eHMhnQCMP0f0++xRpZiuG+n+6nuFbobf6b3Pc9/3bUbz8nM7l328OZdvaZgAANP8A633/AOKX7Mnu9/8ATvuB7i+h/wDa953vfd59HLyfSbgAA0/wrcPv62bSWnwj3e/VJ3VZPVeneh+i794qLy8neP8ADbx5upuAARszjgos+UcUuNa022+rY623yRT3G1Mou9ZcZY2qxkned43u3cio1V5Xb8qL477yTAAjhrNwe/qv1JZqbpzmVbpfqOsXc1VzoqdtTTXBiIiIk8DlRHLs1qb9UXlTdrlRFT5ML4XdRLvnePZVq5rJcc0dj1UlbbbLZ6JlqomztTZssyRbd70V3vVRPFUVVa5zVk0Ar5LtRy3G1VtJBVSUM08L4mVUXw4XOaqI9vxoq7p8hqvhc0XyLQjTafHMmzeszy4SXKetbcazn3ijejESJvO97tt2uevX4UjvlXb4CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA/9k=";  // <-- replace with your actual logo Base64

  // Add logo image to PDF (x=20, y=10, width=40, height=20)
  doc.addImage(logoBase64, 'PNG', 20, 10, 60, 30);

  doc.setFontSize(14);
  doc.text("CERTIFICATE OF CONFORMANCE", 130, 20, null, null, "center");

  doc.setFontSize(10);
  doc.text(`CofC Number: ${cocNumber}`, 20, 40);
  doc.text(`Product Description: ${product}`, 20, 50);
  doc.text(`Issued By: ${user}`, 20, 60);
  doc.text(`Date Issued: ${date}`, 20, 70);

  // Certification Statement
  doc.setFont(undefined, 'bold');
  doc.text("Certification Statement:", 20, 85);
  doc.setFont(undefined, 'normal');
  doc.text(
    "This certifies that the items listed below have been manufactured and inspected in accordance with the contractual requirements, technical specifications, and applicable quality standards.",
    20, 90, { maxWidth: 170 }
  );

  // Checklist with Batches
  doc.setFont(undefined, 'bold');
  doc.text("Checklist Summary:", 20, 110);
  doc.setFont(undefined, 'normal');

  const checklist = [
    "✔ Heat Treatment & Tensile: AAS-HAA; AAV-HAB; AAA-HAA",
    "✔ Duplicates: None",
    "✔ Ultrasonic Testing: All Complete",
    "✔ Banding : All Complete",
    "✔ MPI: All Complete",
    "✔ Balancing Data: All Complete",
    "✔ Final Inspection: All Complete"
  ];

  checklist.forEach((line, idx) => {
    doc.text(line, 25, 115 + idx * 7);
  });

  // Calculate starting Y after checklist
  let startY = 120 + checklist.length * 7 + 10;

  // Pallet Items Table
  if (palletItems.length > 0) {
    doc.setFont(undefined, 'bold');
    doc.text("Pallet Items:", 20, startY);
    startY += 7;

    // Table header
    doc.setFont(undefined, 'bold');
    doc.text("Shell #", 25, startY);
    doc.text("Cast Code", 70, startY);
    doc.text("Heat Code", 130, startY);
    startY += 5;

    // Horizontal line under header
    doc.line(20, startY, 190, startY);
    startY += 3;

    doc.setFont(undefined, 'normal');
    palletItems.forEach(item => {
      doc.text(item.shell, 25, startY);
      doc.text(item.cast, 70, startY);
      doc.text(item.heat, 130, startY);
      startY += 7;
    });
  }

  // Now place Conformance Statement BELOW the pallet items table (or checklist if no pallet items)
  startY += 10;  // add some space before conformance statement

  doc.setFont(undefined, 'bold');
  doc.text("", 20, startY);
  startY += 6;

  doc.setFont(undefined, 'normal');
  doc.text(
    "",
    20, startY, { maxWidth: 170 }
  );

  // Move startY down to allow for multiline text height (~20-30 units)
  startY += 30;

  // Signature lines
  doc.line(20, startY + 20, 80, startY + 20);
  doc.text("Quality Signature", 20, startY + 25);

  doc.line(120, startY + 20, 180, startY + 20);
  doc.text("Date", 120, startY + 25);

  // Save PDF
  doc.save(`CofC_${cocNumber}.pdf`);
}









export function filterInspectionData() {
  const search = document.getElementById("inspectionSearch").value.toLowerCase();
  const rows = document.querySelectorAll("#inspectionTable tbody tr");

  console.log("Search input:", search);
  console.log("Rows found:", rows.length); // ← Should be > 0

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(search) ? "" : "none";
  });
}
window.filterInspectionData = filterInspectionData;



function updateVerificationSummaryTable(missingData) {
  const container = document.getElementById('verificationTableContainer');
  container.innerHTML = ''; // Clear previous content

  // Table header
  let tableHTML = `
    <table class="table table-bordered table-sm">
      <thead class="table-light">
        <tr>
          <th>Component</th>
          <th>Status</th>
          <th>Missing Items</th>
        </tr>
      </thead>
      <tbody>
  `;

  const displayNames = {
    heat_treatment: "Heat Treatment & Tensile",
    UT: "UT",
    Banding: "Banding",
    MPI: "MPI",
    Balancing: "Balancing Data",
    final_inspection: "Final Inspection"
  };

  for (const key in missingData) {
    const value = missingData[key];
    const displayName = displayNames[key] || key;

    let statusText = '';
    let missingText = '';

    if (Array.isArray(value)) {
      if (value.length === 0) {
        statusText = `<span class="text-success">All Complete</span>`;
        missingText = '-';
      } else {
        statusText = `<span class="text-danger">Missing</span>`;
        missingText = value.join(", ");
      }
    } else if (typeof value === 'string') {
      if (value.toLowerCase().includes('complete')) {
        statusText = `<span class="text-success">${value}</span>`;
        missingText = '-';
      } else {
        statusText = `<span class="text-danger">${value}</span>`;
        missingText = '-';
      }
    } else {
      statusText = `<span class="text-muted">Unknown status</span>`;
      missingText = '-';
    }

    tableHTML += `
      <tr>
        <td>${displayName}</td>
        <td>${statusText}</td>
        <td style="word-break: break-word; max-width: 250px;">${missingText}</td>
      </tr>
    `;
  }

  tableHTML += '</tbody></table>';
  container.innerHTML = tableHTML;
}


