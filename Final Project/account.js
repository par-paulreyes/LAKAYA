import { getFirestore, doc, getDoc, updateDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

const db = getFirestore();
const auth = getAuth();

async function getUserInfo(userId) {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.error("User not found.");
        }
    } catch (error) {
        console.error("Error getting user info: ", error);
    }
}

async function editUserProfile(userId, updatedData) {
    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, updatedData);
        alert("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile: ", error);
    }
}

async function getInvestmentStatus(userId) {
    try {
        const investmentsRef = collection(db, "investments");
        const q = query(investmentsRef, where("investorId", "==", userId));
        const querySnapshot = await getDocs(q);
        const investments = [];
        querySnapshot.forEach((doc) => {
            investments.push(doc.data());
        });
        return investments;
    } catch (error) {
        console.error("Error getting investment status: ", error);
    }
}

async function getUserRoleStatus(userId) {
    const userData = await getUserInfo(userId);
    if (userData && userData.role === "investor") {
        const investments = await getInvestmentStatus(userId);
        displayInvestments(investments);
    }
}

function displayInvestments(investments) {
    const tableBody = document.getElementById("investment-status-table").getElementsByTagName('tbody')[0];
    tableBody.innerHTML = '';
    investments.forEach(investment => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = investment.name;
        row.insertCell(1).textContent = investment.fishermanName;
        row.insertCell(2).textContent = investment.projectedProfit;
        row.insertCell(3).textContent = investment.marketStatus;
    });
}

function logout() {
    signOut(auth).then(() => {
        alert("Logged out successfully!");
        window.location.href = "/login";
    }).catch((error) => {
        console.error("Error logging out: ", error);
    });
}

document.getElementById("edit-profile-button").addEventListener('click', async function() {
    const userId = auth.currentUser.uid;
    const updatedData = {
        username: document.getElementById("edit-username").value,
        email: document.getElementById("edit-email").value,
        role: document.getElementById("edit-role").value,
    };
    if (!updatedData.username || !updatedData.email) {
        alert("Please fill in all fields.");
        return;
    }
    await editUserProfile(userId, updatedData);
});

document.getElementById("investment-status-button").addEventListener('click', async function() {
    const userId = auth.currentUser.uid;
    await getUserRoleStatus(userId);
});

document.getElementById("logout-button").addEventListener('click', function() {
    logout();
});
