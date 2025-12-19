import { collection, getDocs, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

import { db, getAllSupplements, getMemberBillsByUID, getAllNotifications, auth } from "./firebase-app.js";

/* =================== PAGE PROTECTION =================== */
export function checkMemberLogin() {
  console.log("Checking member login");

  const uid = localStorage.getItem("loggedInMemberUID");

  if (!uid) {
    console.warn("No member UID found → redirecting to login");
    window.location.href = "../../pages/auth/members-login.html";
  } else {
    console.log("Member authenticated | UID:", uid);
  }
}

/* =================== LOGOUT =================== */
export function memberLogout() {
  console.log("Member logout initiated");

  localStorage.removeItem("loggedInMemberUID");
  localStorage.removeItem("loggedInMemberEmail");

  console.log("LocalStorage cleared");
  window.location.href = "../../pages/auth/members-login.html";
}

/* =================== ELEMENTS =================== */
checkMemberLogin();

const logoutBtn = document.getElementById("logoutBtn");
const billsBox = document.getElementById("memberBill");
const notesBox = document.getElementById("memberNote");

if (!logoutBtn || !billsBox || !notesBox) {
  console.error("One or more dashboard elements not found in DOM");
}

logoutBtn?.addEventListener("click", () => {
  console.log("Logout button clicked");
  memberLogout();
});

/* =================== REAL-TIME NOTIFICATIONS =================== */
function renderNotificationsRealTime() {
  console.log("Subscribing to real-time notifications");

  onSnapshot(collection(db, "notifications"), (snapshot) => {
    console.log("Notifications snapshot received | Count:", snapshot.size);

    if (snapshot.empty) {
      notesBox.innerText = "No notifications yet";
      console.warn("No notifications found");
      return;
    }

    let html = "";
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      html += `• ${data.message}\n`;
    });

    notesBox.innerText = html;
  }, (error) => {
    console.error("Notifications snapshot error:", error);
  });
}

/* =================== SEARCH BILLS =================== */
document
  .getElementById("searchBillInput")
  ?.addEventListener("input", async (e) => {

    const searchText = e.target.value.trim().toLowerCase();
    console.log("Bill search input:", searchText);

    billsBox.innerHTML = "";

    const uid = localStorage.getItem("loggedInMemberUID");
    if (!uid) {
      console.warn("UID missing during bill search");
      return;
    }

    try {
      const bills = await getMemberBillsByUID(uid);
      console.log("Total bills fetched:", bills.length);

      if (!bills.length) {
        billsBox.innerText = "No bills yet";
        return;
      }

      const filteredBills = bills.filter(b =>
        b.month?.toLowerCase().includes(searchText) ||
        b.amount?.toString().includes(searchText)
      );

      console.log("Matching bills:", filteredBills.length);

      if (!filteredBills.length) {
        billsBox.innerText = "No bills match your search";
        return;
      }

      billsBox.innerHTML = filteredBills.map(b => {
        const date = b.createdAt
          ? new Date(b.createdAt.seconds * 1000).toLocaleDateString()
          : "-";

        return `
          <div class="bill-item">
            <strong>Month:</strong> ${b.month} <br>
            <strong>Amount:</strong> ₹${b.amount} <br>
            <strong>Date:</strong> ${date}
          </div>
        `;
      }).join("<hr>");

    } catch (err) {
      console.error("Error during bill search:", err);
      billsBox.innerText = "Failed to search bills";
    }
  });

/* =================== RENDER MEMBER BILLS =================== */
async function renderMemberBills() {
  console.log("Rendering member bills");

  const uid = localStorage.getItem("loggedInMemberUID");
  if (!uid) {
    console.warn("UID missing while rendering bills");
    return;
  }

  try {
    const bills = await getMemberBillsByUID(uid);
    console.log("Bills fetched:", bills.length);

    if (!bills.length) {
      billsBox.innerText = "No bills yet";
      return;
    }

    billsBox.innerHTML = bills.map(b => {
      const date = b.createdAt
        ? new Date(b.createdAt.seconds * 1000).toLocaleDateString()
        : "-";

      return `
        <div class="bill-item">
          <strong>Month:</strong> ${b.month} <br>
          <strong>Amount:</strong> ₹${b.amount} <br>
          <strong>Date:</strong> ${date}
        </div>
      `;
    }).join("<hr>");

  } catch (err) {
    console.error("Error rendering bills:", err);
    billsBox.innerText = "Failed to load bills";
  }
}

/* =================== RENDER NOTIFICATIONS =================== */
async function renderNotifications() {
  console.log("Loading notifications (one-time)");

  try {
    const notifications = await getAllNotifications();
    console.log("Notifications fetched:", notifications.length);

    notesBox.innerText = notifications.length
      ? notifications.map(n => n.message).join(" | ")
      : "No notifications yet";

  } catch (err) {
    console.error("Error loading notifications:", err);
    notesBox.innerText = "Failed to load notifications";
  }
}

/* =================== RENDER SUPPLEMENTS =================== */
async function renderSupplements() {
  console.log("Loading supplements");

  const tbody = document.querySelector("#memberSupplementsTable tbody");
  if (!tbody) {
    console.warn("Supplements table body not found");
    return;
  }

  tbody.innerHTML = "";

  try {
    const supplements = await getAllSupplements();
    console.log("Supplements fetched:", supplements.length);

    supplements.forEach(s => {
      tbody.innerHTML += `
        <tr>
          <td>${s.name}</td>
          <td>₹${s.price}</td>
          <td>${s.description}</td>
        </tr>
      `;
    });

  } catch (err) {
    console.error("Error loading supplements:", err);
  }
}

/* =================== INITIAL LOAD =================== */
console.log("Member dashboard initialization started");

renderMemberBills();
renderNotifications();
renderSupplements();
renderNotificationsRealTime();

console.log("Member dashboard initialization complete");
