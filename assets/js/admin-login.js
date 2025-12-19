import { auth } from './firebase-app.js';
import { signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const msgBox = document.getElementById("adminLoginMsg");
const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", adminLogin);

/* ------------------ ADMIN LOGIN FUNCTION ------------------ */

async function adminLogin() {
  const email = document.getElementById("adminEmail").value.trim();
  const password = document.getElementById("adminPassword").value.trim();

  msgBox.innerText = "";

  console.log(`[LOG] Admin login attempt at ${new Date().toISOString()}`);
  console.log(`[LOG] Entered email: ${email}`);

  if (!email || !password) {
    msgBox.innerText = "Please enter email and password!";
    msgBox.style.color = "red";

    console.warn("[WARN] Admin login failed: Empty email or password");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log(`[LOG] Firebase authentication successful for UID: ${user.uid}`);

    if (email === "admin@gmail.com") {
      msgBox.innerText = "Login successful! Redirecting...";
      msgBox.style.color = "green";

      localStorage.setItem("loggedInAdmin", email);

      console.log("[LOG] Admin role verified");
      console.log("[LOG] Redirecting to admin dashboard");

      setTimeout(() => {
        window.location.href = "../../pages/dashboards/admin-dashboard.html";
      }, 1000);
    } else {
      msgBox.innerText = "Access denied. You are not an admin!";
      msgBox.style.color = "red";

      console.error("[ERROR] Login denied: User is not admin");
      await signOut(auth);

      console.log("[LOG] Non-admin user signed out");
    }
  } catch (err) {
    msgBox.innerText = err.message;
    msgBox.style.color = "red";

    console.error("[ERROR] Admin login error:", err.message);
  }
}

/* ------------------ AUTO REDIRECT CHECK ------------------ */

auth.onAuthStateChanged(async (user) => {
  if (user) {
    console.log(`[LOG] Auth state detected for UID: ${user.uid}`);

    const token = await user.getIdTokenResult();

    if (token.claims.admin) {
      console.log("[LOG] Admin claim verified. Redirecting...");
      window.location.href = "../../pages/dashboards/admin-dashboard.html";
    } else {
      console.warn("[WARN] Non-admin detected. Forcing logout...");
      await signOut(auth);
    }
  }
});

export { adminLogin };