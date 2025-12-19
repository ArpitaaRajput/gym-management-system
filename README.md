# 🏋️ Gym Management System

A web-based **Gym Management System** developed using **HTML, CSS, JavaScript, and Firebase**.  
The project is designed to manage gym operations efficiently while demonstrating **authentication, database handling, and secure access control** in a real-world application.

---

## 🎯 Purpose of the Project

The purpose of this project is to:
- Digitize gym management processes
- Reduce manual record keeping
- Provide role-based access for Admins and Members
- Practice real-world frontend development with backend integration
- Understand authentication, security rules, and database structure using Firebase

---

## 🚀 Features

- Role-based login (Admin, Member)
- Secure authentication system
- Separate dashboards for different roles
- Member data management
- Gym activity and record handling
- Responsive and user-friendly interface
- Logout and session management

---

## 🧩 Modules

- **Admin Module**
  - Admin authentication
  - Access admin dashboard
  - Create and manage members
  - Send notifications and bills
  - View all members and records
  - Manage supplements and diet details
  - Export details
  

- **Member Module**
  - Member login
  - Access member dashboard
  - View personal details and bill receipts
  - Search bills by month or amount
  - View notifications in real-time
  - View supplements list

---

## 🔐 Security

- Role-based access control
- Firebase Authentication for secure login
- Firestore security rules to protect data
- Restricted access to dashboards without authentication
- Secure logout mechanism

---

## 🗄️ Firestore Collections

- **members**
  - Stores member personal details
  - Membership plans

- **notifications**
  - Stores notifications

- **bills**
  - Stores billing details of members

- **supplements**
  - Stores supplements details

- **diets**
  - Stores diet details assigned to members

---

## 🛠️ Technologies Used

- **HTML** – Page structure  
- **CSS** – Styling and responsive layout  
- **JavaScript** – Application logic and validation  
- **Firebase Authentication** – Secure login system  
- **Firestore Database** – Cloud-based data storage  

---

## 📂 Project Structure

```text
GYM-Management-System/
│
├── assets/
│   ├── css/
│   │   └── style.css
│   ├── images/
│   ├── js/
│   │   ├── firebase-app.js
│   │   ├── admin-dashboard.js
│   │   ├── members-dashboard.js
│   │   ├── admin-login.js
│   │   └── members-login.js
│
├── pages/
│   ├── auth/
│   │   ├── admin-login.html
│   │   └── members-login.html
│   ├── dashboards/
│   │   ├── admin-dashboard.html
│   │   └── members-dashboard.html
│
├── index.html
├── about.html
├── contact.html
├── README.md

```
---

## 🔄 Workflow and Execution

The Gym Management System follows a structured workflow to ensure secure access, smooth navigation, and proper data handling.

### 1️⃣ Application Initialization
- The project loads the main entry pages (login or home page)
- Firebase is initialized using client-side configuration
- Required CSS and JavaScript files are loaded

### 2️⃣ User Authentication
- Users select their role (Admin, Member, or User)
- Credentials are validated using Firebase Authentication
- Successful login stores session data securely
- Unauthorized users are restricted from accessing dashboards

### 3️⃣ Role-Based Access Control
- Admins are redirected to the Admin Dashboard
- Members are redirected to the Member Dashboard
- Each dashboard checks authentication status before loading
- Direct URL access is blocked without proper login

### 4️⃣ Data Interaction with Firestore
- Firestore collections store user, member, billing, and notification data
- CRUD operations are performed based on user role
- Firestore security rules ensure data protection
- Only authorized users can read or modify their allowed data

### 5️⃣ Dashboard Operations
- Admins can manage members, view records, and monitor activity
- Members can view personal details and membership status
- Dynamic data is fetched and displayed in real time

### 6️⃣ Session Management and Logout
- Login sessions are maintained during active usage
- Logout clears stored session data
- Users are redirected to the login page after logout

### 7️⃣ Error Handling and Validation
- Input fields are validated before submission
- User-friendly error messages are displayed
- Invalid access attempts are safely blocked

---

### ✅ Execution Summary
- Frontend handles UI and user interaction
- Firebase Authentication ensures secure login
- Firestore manages structured and real-time data
- Security rules enforce role-based access
- The system runs entirely on the web without server setup

---

## 👩‍💻 Author

**Arpita Rawat**

---

## 📄 License

This project is intended for educational and learning purposes.

---

## 📌 Note
This project uses Firebase services. Sensitive configuration files are excluded using `.gitignore`.
