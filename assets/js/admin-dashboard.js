import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

import {
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

import {
  collection,
  getDocs,
  doc,
  query,
  where,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

import {
  db,
  createBillFirebase,
  sendNotificationFirebase,
  checkAdminLogin,
  logout,
  assignDiet,
  getAllDiets,
  deleteDiet,
  addSupplement,
  getAllSupplements,
  deleteSupplement
} from "./firebase-app.js";

import { firebaseConfig } from "./firebase-app.js"
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";

/* ================= LOGGING ================= */
const DEBUG = true;
const log = (...args) => console.log("[ADMIN]", ...args);
const logErr = (...args) => console.error("[ADMIN ERROR]", ...args);

console.log("Initializing secondary Firebase app...");
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);
console.log("Secondary Firebase Auth initialized successfully");

/* ================= PROTECT PAGE ================= */
log("Checking admin authentication...");
checkAdminLogin();

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  log("Admin clicked logout");
  logout();
});

/* ================= ELEMENTS ================= */
const memberName = document.getElementById("memberName");
const memberMsg = document.getElementById("memberMsg");
const billMsg = document.getElementById("billMsg");
const noteMsg = document.getElementById("noteMsg");
const dietMsg = document.getElementById("dietMsg");
const supplementMsg = document.getElementById("supplementMsg");
// Member fields
const memberID = document.getElementById("memberID");
const memberEmail = document.getElementById("memberEmail");
const memberPassword = document.getElementById("memberPassword");
const feePackage = document.getElementById("feePackage");

// Update member fields
const updateMemberID = document.getElementById("updateMemberID");
const updateMemberName = document.getElementById("updateMemberName");
const updateMemberEmail = document.getElementById("updateMemberEmail");
const updateMemberFeePackage = document.getElementById("updateMemberFeePackage");
const updateMemberMsg = document.getElementById("updateMemberMsg");

// Bill fields
const billMemberID = document.getElementById("billMemberID");
const billAmount = document.getElementById("billAmount");
const billMonth = document.getElementById("billMonth");

// Notification
const note = document.getElementById("note");

// Diet
const dietMemberID = document.getElementById("dietMemberID");
const dietPlan = document.getElementById("dietPlan");

// Supplement
const supplementName = document.getElementById("supplementName");
const supplementPrice = document.getElementById("supplementPrice");
const supplementDesc = document.getElementById("supplementDesc");

// Assign package
const packageMemberID = document.getElementById("packageMemberID");
const packageMsg = document.getElementById("packageMsg");

// Export buttons
const exportMembersBtn = document.getElementById("exportMembersBtn");
const exportBillsBtn = document.getElementById("exportBillsBtn");
const exportDietBtn = document.getElementById("exportDietBtn");
const exportSupplementsBtn = document.getElementById("exportSupplementsBtn");
const exportAllBtn = document.getElementById("exportAllBtn");


/* ================= ADD MEMBER ================= */
document.getElementById("addMemberBtn")?.addEventListener("click", async () => {
  log("Add Member Clicked")

  const memberId = document.getElementById("memberID").value.trim(); // ✅ ADD THIS
  const name = memberName.value.trim();
  const email = memberEmail.value.trim();
  const password = memberPassword.value.trim();
  const feePackageValue = feePackage.value;

  if (!name || !email || !password) {
    log("Add Member failed: missing fields")
    memberMsg.innerText = "Please fill all fields!";
    memberMsg.style.color = "red";
    return;
  }

  try {
    log("Creating auth user", email)
    // 1️⃣ Create Auth user
    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth,
      email,
      password
    );

    const user = userCredential.user;
    log("Auth user created", user.uid)

    // 2️⃣ Create Firestore document
    await setDoc(doc(db, "members", user.uid), {
      uid: user.uid,
      memberId: memberId,
      name,
      email,
      feePackage: feePackageValue || "-",
      role: "member",
      createdAt: serverTimestamp()
    });

    log("Member Firestore document created", user.uid)

    memberMsg.innerText = "Member added successfully!";
    memberMsg.style.color = "lime";
    renderMembersTable();
  } catch (err) {
    logErr("Add Member error", err);
    memberMsg.innerText = err.message;
    memberMsg.style.color = "red";
  }
})

//Delete Member
window.deleteMember = async (id) => {
  log("Delete Member requested", id)
  if (!confirm("Delete member?")) return;
  await deleteDoc(doc(db, "members", id));
  log("Member deleted", id)
  renderMembersTable();
};

//Render Members
async function renderMembersTable() {
  log("Rendering members table")
  const tbody = document.querySelector("#membersTable tbody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "members"));
  log("Members fetched", snap.size)
  snap.forEach(d => {
    const m = d.data();
    tbody.innerHTML += `
      <tr>
        <td>${m.memberId}</td>
        <td>${m.name}</td>
        <td>${m.email}</td>
        <td>${m.feePackage}</td>
        <td>
          <button class="delete-btn" onclick="deleteMember('${d.id}')">
            Delete
          </button>
        </td>
      </tr>`;
  })
}

/* ================= UPDATE MEMBER ================= */

document.getElementById("updateMemberBtn")?.addEventListener("click", async () => {
  log("Update Member Clicked")

  const memberId = updateMemberID.value.trim();
  const name = updateMemberName.value.trim();
  const email = updateMemberEmail.value.trim();
  const fee = updateMemberFeePackage.value.trim();

  if (!memberId) {
    log("Update Member failed: missing UID")
    memberMsg.innerText = "Member UID required!";
    memberMsg.style.color = "red";
    return;
  }

  try {
    // Query document by memberId field
    const q = query(collection(db, "members"), where("memberId", "==", memberId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      updateMemberMsg.innerText = "Member not found!";
      updateMemberMsg.style.color = "red";
      return;
    }

    // Get the actual document reference (using UID)
    const memberDocRef = snapshot.docs[0].ref;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (fee) updateData.feePackage = fee;

    log("Updating member", memberId, updateData)
    await updateDoc(memberDocRef, updateData);

    updateMemberMsg.innerText = "Member updated!";
    updateMemberMsg.style.color = "lime";
    renderMembersTable();
  } catch (err) {
    logErr("Update Member error", err)
    updateMemberMsg.innerText = err.message;
    updateMemberMsg.style.color = "red";
  }
});

/* ================= CREATE BILL ================= */

document.getElementById("createBillBtn")?.addEventListener("click", async () => {
  log("Created Bill Clicked")

  const id = billMemberID.value.trim();
  const amount = billAmount.value.trim();
  const month = billMonth.value.trim();

  if (!id || !amount || !month) {
    log("Create Bill failed: missing fields")
    billMsg.innerText = "Please fill all fields!";
    billMsg.style.color = "red";
    return;
  }

  try {
    await createBillFirebase(id, parseFloat(amount), month);
    log("Bill created", id, amount, month);
    billMsg.innerText = "Bill created successfully!";
    billMsg.style.color = "lime";
    renderBillsTable();
  } catch (err) {
    logErr("Create Bill failed", err);
    billMsg.innerText = err.message;
    billMsg.style.color = "red";
  }

});

//Delete Bill
window.deleteBill = async (id) => {
  log("Delete Bill requested", id)
  if (!confirm("Delete bill?")) return;
  await deleteDoc(doc(db, "bills", id));
  log("Bill deleted", id)
  renderBillsTable();
};

//Render Bills
async function renderBillsTable() {
  log("Rendering bills table")
  const tbody = document.querySelector("#billsTable tbody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "bills"));
  log("Bills fetched", snap.size)
  snap.forEach(d => {
    const b = d.data();
    tbody.innerHTML += `
      <tr>
        <td>${b.memberId}</td>
        <td>₹${b.amount}</td>
        <td>${b.month}</td>
        <td><button class="delete-btn" onclick="deleteBill('${d.id}')">Delete</button></td>
      </tr>`;
  });
}

/* ================= SEND NOTIFICATION ================= */

document.getElementById("sendNoteBtn")?.addEventListener("click", async () => {
  log("Send Notification clicked")

  const msg = note.value.trim();
  if (!msg) {
    log("Notification aborted: empty message")
    return;
  }

  try {
    await sendNotificationFirebase(msg);
    log("Notification sent")
    noteMsg.innerText = "Notification sent!";
    noteMsg.style.color = "lime";
    renderNotifications();
  } catch (err) {
    logErr("Send Notification failed", err);
    noteMsg.innerText = err.message;
    noteMsg.style.color = "red";
  }
});

// Delete notification
window.deleteNotification = async (id) => {
  log("Delete Notification requested", id)
  if (!confirm("Are you sure you want to delete this notification?")) return;
  await deleteDoc(doc(db, "notifications", id));
  log("Notification deleted", id)
  renderNotifications(); // refresh table
};

// Render notifications
async function renderNotifications() {
  log("Rendering notifications")
  const tbody = document.querySelector("#notificationsTable tbody");
  tbody.innerHTML = "";

  const snap = await getDocs(collection(db, "notifications"));
  log("Notifications fetched", snap.size)
  snap.forEach(docSnap => {
    const data = docSnap.data();
    tbody.innerHTML += `
      <tr>
        <td>${data.message}</td>
        <td><button class="delete-btn" onclick="deleteNotification('${docSnap.id}')">Delete</button></td>
      </tr>
    `;
  });
}

/* ================= DIET ================= */

document.getElementById("assignDietBtn")?.addEventListener("click", async () => {
  log("Assign diet clicked")

  const memberId = dietMemberID.value.trim();
  const diet = dietPlan.value.trim();

  if (!memberId || !diet) {
    log("Assign Diet failed: missing data")
    return;
  }

  try {
    await assignDiet(memberId, diet);
    log("Diet assigned", memberId)

    dietMsg.innerText = "Diet assigned!";
    dietMsg.style.color = "lime";
    renderDietTable();
  } catch (err) {
    logErr("Assign Diet failed", err);
    dietMsg.innerText = err.message;
    dietMsg.style.color = "red";
  }
});

//Delete Diet
window.removeDiet = async (id) => {
  log("Delete Diet requested", id)
  if (!confirm("Delete diet?")) return;
  await deleteDiet(id);
  log("Diet deleted", id)
  renderDietTable();
};


//Render Diets
async function renderDietTable() {
  log("Rendering diets table")
  const tbody = document.querySelector("#dietTable tbody");
  tbody.innerHTML = "";

  const diets = await getAllDiets();
  diets.forEach(d => {
    tbody.innerHTML += `
      <tr>
        <td>${d.memberId}</td>
        <td>${d.diet || d.dietPlan || "-"}</td>
        <td><button class="delete-btn" onclick="removeDiet('${d.memberId}')">Delete</button></td>
      </tr>`;
  });
}

/* ================= SUPPLEMENTS ================= */

document.getElementById("addSupplementBtn")?.addEventListener("click", async () => {
  log("Add Supplement clicked")

  const name = supplementName.value.trim();
  const price = parseFloat(supplementPrice.value.trim());
  const desc = supplementDesc.value.trim();

  if (!name || !price) {
    log("Add Supplement failed: missing fields")
    return;
  }

  try {
    await addSupplement(name, price, desc);
    log("Supplement added", name);
  } catch (err) {
    logErr("Add Supplement failed", err);
  }

  supplementMsg.innerText = "Supplement added!";
  supplementMsg.style.color = "lime";
  renderSupplementsTable();
});

//Delete Supplement
window.removeSupplement = async (id) => {
  log("Delete Supplement requested", id)
  if (!confirm("Delete supplement?")) return;
  await deleteSupplement(id);
  log("Supplement deleted", id)
  renderSupplementsTable();
};

//Render Supplements
async function renderSupplementsTable() {
  const tbody = document.querySelector("#supplementsTable tbody");
  tbody.innerHTML = "";

  const list = await getAllSupplements();
  list.forEach(s => {
    tbody.innerHTML += `
      <tr>
        <td>${s.name}</td>
        <td>₹${s.price}</td>
        <td>${s.description}</td>
        <td><button class="delete-btn" onclick="removeSupplement('${s.id}')">Delete</button></td>
      </tr>`;
  });
}

/* ================= ASSIGN PACKAGE FUNCTION ================= */

document.getElementById("assignPackageBtn").addEventListener("click", async () => {
  log("Assign Package clicked")

  const feePackage = document.getElementById("feePackage");
  const memberId = packageMemberID.value.trim();
  const packageName = feePackage.value;
  const packageMsg = document.getElementById("packageMsg");

  if (!memberId || !packageName) {
    log("Assign Package failed: missing fields")
    packageMsg.innerText = "Please fill all fields!";
    packageMsg.style.color = "red";
    return;
  }
  try {
    const q = query(collection(db, "members"), where("memberId", "==", memberId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      log("Member not found for package", memberId)
      packageMsg.innerText = "Member not found!";
      packageMsg.style.color = "red";
      return;
    }

    // Update the FIRST matched member
    const memberDocRef = snapshot.docs[0].ref;

    await updateDoc(memberDocRef, {
      feePackage: packageName
    });
    log("Package assigned", memberId, packageName)

    packageMsg.innerText = "Fee package assigned!";
    packageMsg.style.color = "lime";

    renderMembersTable();
  } catch (err) {
    logErr("Assign Package error", err)
    packageMsg.innerText = err.message;
    packageMsg.style.color = "red";
  }
});


/* ================= EXCEL EXPORT FUNCTION ================= */

function exportToExcel(filename, data, sheetName) {
  log("Export started", filename)

  if (!data.length) {
    log("Export aborted: no data")
    alert("No data to export!");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename);

  log("Export completed", filename)
}

/* ================= EXPORT BUTTONS ================= */

exportMembersBtn.onclick = async () => {
  log("Export Members clicked")
  const snap = await getDocs(collection(db, "members"));
  log("Members fetched", snap.size)
  const data = snap.docs.map(d => {
    const m = d.data();
    return {
      Member_ID: m.memberId,
      Name: m.name,
      Email: m.email,
      Package: m.feePackage
    };
  });
  exportToExcel("Members.xlsx", data, "Members");
};

exportBillsBtn.onclick = async () => {
  log("Export Bills clicked")
  const snap = await getDocs(collection(db, "bills"));
  log("Bills Fetched", snap.size)
  const data = snap.docs.map(d => {
    const b = d.data();
    return { Member_ID: b.memberId, "Amount (₹)": b.amount };
  });
  exportToExcel("Bills.xlsx", data, "Bills");
};

exportDietBtn.onclick = async () => {
  log("Export Diets clicked")
  const snap = await getDocs(collection(db, "diets"));
  log("Diets Fetched", snap.size)
  const data = snap.docs.map(d => {
    const diet = d.data();
    return { Member_ID: diet.memberId, Diet: diet.diet };
  });
  exportToExcel("Diet_Plans.xlsx", data, "Diets");
};

exportSupplementsBtn.onclick = async () => {
  log("Export Supplements clicked")
  const snap = await getDocs(collection(db, "supplements"));
  log("Supplements Fetched", snap.size)
  const data = snap.docs.map(d => {
    const s = d.data();
    return { Name: s.name, "Price (₹)": s.price, Description: s.description };
  });
  exportToExcel("Supplements.xlsx", data, "Supplements");
};

exportAllBtn.addEventListener("click", () => {
  exportMembersBtn.onclick();
  exportBillsBtn.onclick();
  exportDietBtn.onclick();
  exportSupplementsBtn.onclick();
});

/* ================= INITIAL LOAD ================= */

renderMembersTable();
renderBillsTable();
renderDietTable();
renderSupplementsTable();
renderNotifications();