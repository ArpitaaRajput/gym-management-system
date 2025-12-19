import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getFirestore, collection, serverTimestamp, addDoc, setDoc, doc, getDocs, getDoc, query, where, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

/* ----------------- CONFIG ----------------- */

export const firebaseConfig = {
  apiKey: "AIzaSyDGiiO10is22wQewARV2vm88Ck4PV9RUIU",
  authDomain: "gym-management-e519d.firebaseapp.com",
  projectId: "gym-management-e519d",
  storageBucket: "gym-management-e519d.firebasestorage.app",
  messagingSenderId: "372441811315",
  appId: "1:372441811315:web:0e3d82acb1ff56dd335d06",
  measurementId: "G-M11N2E7L7H"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

/* ----------------- ADMIN LOGIN ----------------- */

export async function adminLogin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Refresh token to get latest custom claims
    const token = await user.getIdTokenResult(true);

    if (token.claims.admin) {
      localStorage.setItem("loggedInAdmin", email);
      window.location.href = "../../pages/dashboards/admin-dashboard.html"; 
    } else {
      alert("Access denied. Not an admin!");
      await signOut(auth);
    }
  } catch (error) {
    alert(error.message);
  }
}

/* ----------------- MEMBER LOGIN ----------------- */

export async function memberLogin(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.setItem("loggedInMember", email);
    window.location.href = "../../pages/dashboards/members-dashboard.html"; 
  } catch (error) {
    alert(error.message);
  }
}

/* ----------------- LOGOUT ----------------- */

export async function logout() {
  await signOut(auth);
  localStorage.removeItem("loggedInAdmin");
  localStorage.removeItem("loggedInMember");
  window.location.href = "../../index.html"; 
}

/* ----------------- CHECK ADMIN LOGIN ----------------- */

export function checkAdminLogin() {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "../../pages/auth/admin-login.html";
      return;
    }

    const token = await user.getIdTokenResult(true);

    if (!token.claims.admin) {
      alert("Access denied. Not an admin!");
      await signOut(auth);
      window.location.href = "../../pages/auth/admin-login.html";
    }
  });
}

/* ----------------- CHECK MEMBER LOGIN ----------------- */
export function checkMemberLogin() {
  if (!localStorage.getItem("loggedInMember")) {
    window.location.href = "../../pages/auth/member-login.html";
  }
}

/* ----------------- ADD MEMBER ----------------- */
export async function addMemberFirebase(memberId, name, username, password, email) {
  if (!memberId || !name || !username || !password || !email)
    throw new Error("All fields required");

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  await setDoc(doc(db, "members", memberId), {
    memberId,       
    uid,             
    name,
    username,
    email,
    createdAt: new Date()
  });
}

/* ----------------- CREATE BILL ----------------- */

export async function createBillFirebase(memberId, amount, month) {
  
  const q = query( collection(db, "members"), where("memberId", "==", memberId));

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error("Member not found");
  }

  const member = snap.docs[0].data();

  await addDoc(collection(db, "bills"), {
    memberId: member.memberId,
    uid: member.uid,           
    amount,
    month,
    createdAt: serverTimestamp()
  });
}

/* ----------------- SEND NOTIFICATION ----------------- */

export async function sendNotificationFirebase(message) {
  try {
    await addDoc(collection(db, "notifications"), { message, timestamp: new Date() });
  } catch (err) {
    throw err;
  }
}

/* ----------------- DIETS ----------------- */

export async function assignDiet(memberId, diet) {
  if (!memberId || !diet) throw new Error("Member ID and Diet Plan required");
  await setDoc(doc(db, "diets", memberId), { memberId, diet, assignedAt: new Date() });
}

export async function getAllDiets() {
  const snap = await getDocs(collection(db, "diets"));
  return snap.docs.map(d => d.data());
}

export async function deleteDiet(memberId) {
  await deleteDoc(doc(db, "diets", memberId));
}

/* ----------------- SUPPLEMENTS ----------------- */

export async function addSupplement(name, price, desc) {
  if (!name || !price) throw new Error("Name and Price required");
  await addDoc(collection(db, "supplements"), {
    name,
    price,
    description: desc,
    addedAt: new Date()
  });
}

export async function getAllSupplements() {
  const snap = await getDocs(collection(db, "supplements"));
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteSupplement(docId) {
  await deleteDoc(doc(db, "supplements", docId));
}

/* ----------------- MEMBER BILLS ----------------- */

export async function getMemberBillsByUID(uid) {
  const q = query(collection(db, "bills"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data());
}

/* ----------------- GET NOTIFICATIONS ----------------- */

export async function getAllNotifications() {
  const snap = await getDocs(collection(db, "notifications"));
  return snap.docs.map(doc => doc.data());
}
