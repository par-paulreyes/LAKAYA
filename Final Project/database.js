import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCF777puv2PuDWo6ZrMUvwbhjcr2VKm-UM",
  authDomain: "lakayadb.firebaseapp.com",
  projectId: "lakayadb",
  storageBucket: "lakayadb.firebasestorage.app",
  messagingSenderId: "990611749061",
  appId: "1:990611749061:web:7c68b90ef52d5dcda058ac",
  measurementId: "G-MHTSCKCHJR"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore();
const auth = getAuth();

function generateRandomUserId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let userId = '';
  for (let i = 0; i < 8; i++) {
    userId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return userId;
}

document.getElementById("customer-form").addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById("customer-username").value;
    const email = document.getElementById("customer-email").value;
    const password = document.getElementById("customer-password").value;
    const userRole = document.getElementById("user-role").value;

    if (!username || !email || !password || !userRole) {
        alert("Please fill in all fields and select a role.");
        return;
    }

    const randomUserId = generateRandomUserId();  
    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            
            return setDoc(doc(db, "users", randomUserId), {
                username: username,
                email: email,
                role: userRole
            });
        })
        .then(() => {
            alert("Registration Successful!");
            if (userRole === "investor") {
                window.location.href = "/investor-dashboard";
            } else if (userRole === "fisherman") {
                window.location.href = "/fisherman-dashboard";
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error("Error creating user or storing data:", error);
            alert(`Error: ${errorMessage}`);
        });
});

document.getElementById("login-form").addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    signInWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.email.split('@')[0]));  
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userRole = userData.role;

                if (userRole === "investor") {
                    window.location.href = "/investor-dashboard";
                } else if (userRole === "fisherman") {
                    window.location.href = "/fisherman-dashboard";
                }
            } else {
                alert("User data not found.");
            }
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.error("Login error:", error);
            alert(`Error: ${errorMessage}`);
        });
});
