import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js';
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

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
const db = getFirestore(app);

function generateRandomInvestorId() {
    return Math.floor(10000000 + Math.random() * 90000000);
}

function calculateProjectedProfit(investorBudget, projectedProfit) {
    if (investorBudget <= 0 || projectedProfit <= 0) {
        alert("Invalid budget or projected profit");
        return 0;
    }
    return investorBudget * (projectedProfit / 100);
}

async function bookInvestment(investorId, investorName, fishermanName, fishermanId, investmentAmount, projectedProfit, visitDateTime) {
    try {
        const investmentRef = doc(db, "investment", investorId.toString());

        const newInvestment = {
            investorName,
            fishermanName,
            fishermanId,
            investmentAmount,
            projectedProfit,
            visitDateTime,
            status: "Booked",
            timestamp: new Date(),
        };

        await setDoc(investmentRef, newInvestment);

        alert("Investment booked successfully!");
    } catch (error) {
        console.error("Error booking investment: ", error);
        alert("Error booking investment: " + error.message);
    }
}

document.getElementById("investment-form").addEventListener('submit', async function(event) {
    event.preventDefault();

    const investorId = generateRandomInvestorId();
    const investorName = document.getElementById("investor-name").value;
    const fishermanId = document.getElementById("fisherman-id").value;
    const fishermanName = document.getElementById("fisherman-name").value;
    const investmentAmount = parseFloat(document.getElementById("investment-amount").value);
    const projectedProfit = parseFloat(document.getElementById("projected-profit").value);
    const visitDateTime = document.getElementById("visit-date-time").value;

    if (!investorName || !fishermanId || isNaN(investmentAmount) || isNaN(projectedProfit) || !visitDateTime || !fishermanName) {
        alert("Please fill in all fields correctly.");
        return;
    }

    const projectedReturn = calculateProjectedProfit(investmentAmount, projectedProfit);
    alert(`Projected Return: ${projectedReturn}`);

    await bookInvestment(investorId, investorName, fishermanName, fishermanId, investmentAmount, projectedProfit, visitDateTime);
});
