import { getFirestore, collection, query, where, getDocs, doc, updateDoc, setDoc, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
const db = getFirestore();

async function searchAndFilter(keyword) {  // for search 
    try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", keyword));
        const querySnapshot = await getDocs(q);
        const results = [];
        querySnapshot.forEach((doc) => {
            results.push(doc.data());
        });
        console.log(results);
        return results;
    } catch (error) {
        console.error("Error searching users: ", error);
        alert("Error searching users: " + error.message);
    }
}

async function getInvestmentStatus() {  // investment status
    try {
        const usersRef = collection(db, "users");
        const querySnapshot = await getDocs(usersRef);
        let investorCount = 0;
        let fishermanCount = 0;
        let sustainableFishingCount = 0;

        querySnapshot.forEach((doc) => {
            const user = doc.data();
            if (user.role === 'investor') {
                investorCount++;
            }
            if (user.role === 'fisherman') {
                fishermanCount++;
            }
            if (user.role === 'sustainable_fishing') {
                sustainableFishingCount++;
            }
        });

        console.log(`Investors: ${investorCount}, Fishermen: ${fishermanCount}, Sustainable Fishing Projects: ${sustainableFishingCount}`);
        return {
            investors: investorCount,
            fishermen: fishermanCount,
            sustainableFishing: sustainableFishingCount
        };
    } catch (error) {
        console.error("Error getting investment status: ", error);
        alert("Error getting investment status: " + error.message);
    }
}

async function getInvestmentRecommendations() {  // getting the top project
    try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, orderBy("projectedProfit", "desc"), limit(5));
        const querySnapshot = await getDocs(q);
        const recommendations = [];
        querySnapshot.forEach((doc) => {
            recommendations.push(doc.data());
        });
        console.log(recommendations);
        return recommendations;
    } catch (error) {
        console.error("Error fetching investment recommendations: ", error);
        alert("Error fetching investment recommendations: " + error.message);
    }
}

function beAFisherman() {
    window.location.href = "/ "; // redirect to fishermen page
}

async function insertFeedback(userId, feedbackText) { // for feedback
    try {
        const feedbackRef = doc(db, "feedback", userId);
        await setDoc(feedbackRef, {
            feedback: feedbackText,
            timestamp: new Date(),
        });
        alert("Thank you for your feedback!");
    } catch (error) {
        console.error("Error inserting feedback: ", error);
        alert("Error inserting feedback: " + error.message);
    }
}

document.getElementById("search-button").addEventListener('click', async function() {  // search button
    const keyword = document.getElementById("search-input").value;
    await searchAndFilter(keyword);
});

document.getElementById("investment-status-button").addEventListener('click', async function() { // investment button
    const status = await getInvestmentStatus();
    console.log(status);
});

document.getElementById("recommendations-button").addEventListener('click', async function() { // recommendation button
    const recommendations = await getInvestmentRecommendations();
    console.log(recommendations);
});

document.getElementById("fisherman-button").addEventListener('click', function() { // fishermen page button
    beAFisherman();
});

document.getElementById("feedback-form").addEventListener('submit', function(e) { // feedback button
    e.preventDefault();
    const feedbackText = document.getElementById("feedback-text").value;
    const userId = "exampleUserId";
    insertFeedback(userId, feedbackText);
});
