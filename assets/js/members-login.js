import { auth } from "./firebase-app.js";
import { signInWithEmailAndPassword } from"https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

export async function memberLogin() {
  console.log("Member login started");

  const email = document.getElementById("memberEmail").value.trim();
  const password = document.getElementById("memberPassword").value.trim();
  const msgBox = document.getElementById("memberLoginMsg");

  console.log("Email entered:", email ? email : "EMPTY");
  console.log("Password entered:", password ? "YES" : "NO");

  if (!email || !password) {
    console.warn("Email or password missing");

    msgBox.innerText = "Please enter email and password!";
    msgBox.style.color = "red";
    return;
  }

  try {
    console.log("Attempting Firebase authentication...");

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    console.log("Login successful");
    console.log("User UID:", user.uid);
    console.log("User Email:", user.email);

    // Store session data
    localStorage.setItem("loggedInMemberUID", user.uid);
    localStorage.setItem("loggedInMemberEmail", email);

    console.log("User data stored in localStorage");

    msgBox.innerText = "Login successful! Redirecting...";
    msgBox.style.color = "lime";

    setTimeout(() => {
      console.log("Redirecting to member dashboard");
      window.location.href =
        "../../pages/dashboards/members-dashboard.html";
    }, 800);

  } catch (err) {
    console.error("Login failed");
    console.error("Firebase error code:", err.code);
    console.error("Firebase error message:", err.message);

    msgBox.innerText = "Invalid email or password!";
    msgBox.style.color = "red";
  }
}

// Attach login function to button
document.getElementById("loginBtn").addEventListener("click", () => {
  console.log("Login button clicked");
  memberLogin();
});