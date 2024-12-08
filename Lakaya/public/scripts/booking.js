document.getElementById('userEmail').style.display = 'none';
        document.getElementById('userName').style.display = 'none';
        document.addEventListener("DOMContentLoaded", function () {
            const investBtn = document.getElementById('investBtn');
    const fishermanName = document.getElementById('fishermanName');
    const fishermanLocation = document.getElementById('fishermanLocation');
    const fishermanEmail = document.getElementById('fishermanEmail');
    const fishermanCut = document.getElementById('fishermanCut');
    const fishermanTarget = document.getElementById('fishermanTarget');
    const fishermanFishingType = document.getElementById('fishermanFishingType');
    const fishermanFishType = document.getElementById('fishermanFishType');
    const fishermanProfit = document.getElementById('fishermanProfit');
    const investmentDescription = document.getElementById('investmentDescription');
    const investmentDate = document.getElementById('investmentDate');
    const userEmail = document.getElementById('userEmail');

    const fishermanData = JSON.parse(localStorage.getItem('selectedFisherman'));
    const investorLocationStr = localStorage.getItem('investorLocation');

    if (fishermanData) {
        fishermanName.textContent = fishermanData.username;
        fishermanEmail.textContent = fishermanData.email;
        fishermanLocation.textContent = fishermanData.location;
        fishermanCut.textContent = `${fishermanData.cut}%`;
        fishermanTarget.textContent = `Php ${fishermanData.target}`;

        // Set new fields for investment description, fishing type, fish type, and profit
        investmentDescription.textContent = fishermanData.descriptions || "Not provided";
        fishermanFishingType.textContent = fishermanData.type || "Not provided";
        fishermanFishType.textContent = fishermanData.fish || "Not provided";
        fishermanProfit.textContent = (fishermanData.target * (fishermanData.cut / 100)) ? `Php ${fishermanData.target * (fishermanData.cut / 100)}` : "Not provided";

        fetch('/view-login')
            .then(response => response.json())
            .then(loginUsers => {
                const userEmailText = loginUsers.length > 0 ? loginUsers[0].email : 'No email found';
                userEmail.textContent = userEmailText;  
                const userNameText = loginUsers.length > 0 ? loginUsers[0].name : 'No name found';
                userName.textContent = userNameText; 
            })
            .catch(err => {
                console.error('Error fetching email:', err);
                userEmail.textContent = 'Error fetching email';
            });

            // Fetch the logged-in user's email
            fetchUserEmail();

        if (investorLocationStr) {
            geocodeLocation(investorLocationStr)
                .then(investorLocation => {
                    initMap(fishermanData, investorLocation);
                })
                .catch(() => {
                    alert('Unable to find investor location.');
                    initMap(fishermanData, { lat: 14.5995, lon: 120.9842 });
                });
        }
    } else {
        fishermanName.textContent = "No Fisherman selected.";
        fishermanLocation.textContent = "N/A";
        fishermanEmail.textContent = "N/A";
        fishermanCut.textContent = "N/A";
        fishermanTarget.textContent = "N/A";
        investmentDescription.textContent = "N/A";
        fishermanFishingType.textContent = "N/A";
        fishermanFishType.textContent = "N/A";
        fishermanProfit.textContent = "N/A";
    }

    investBtn.addEventListener('click', async () => {
        const investoremail = userEmail.textContent;
        const investorname = userName.textContent;

        try {
        // Check if the logged-in user is a fisherman
        const checkResponse = await fetch('/check-email-fisherman', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: investoremail }),
        });

        const checkResult = await checkResponse.json();

        if (checkResult.exists) {
            alert("You are registered as a fisherman and cannot make an investment.");
            return; // Stop further execution
        }
    } catch (error) {
        console.error('Error processing investment:', error);
        alert("You are registered as a fisherman and cannot make an investment.");  
    }

        const investmentData = {
            username: fishermanData.username,
            investorname: investorname,
            investoremail: investoremail,
            location: fishermanData.location,
            target: fishermanData.target,
            email: fishermanData.email,
            cut: fishermanData.cut,
            profit:  (fishermanData.target * (fishermanData.cut / 100)),
            investorLocation: investorLocationStr,
            investmentDate: investmentDate.value,
        };
        console.log(investmentData);

        try {
            const response = await fetch('/book-investment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(investmentData),
            });

            const result = await response.json();
            console.log(result);

            if (result.success) {
                localStorage.removeItem('selectedFisherman');
                localStorage.removeItem('investorLocation');
                window.location.href = '/'; 
                alert("Investment successfully made! The fisherman has been notified.");
            } else {
                alert("Failed to book the investment. Please try again.");
            }
        } catch (error) {
            console.error('Error processing investment:', error);
            alert("There was an error processing your investment. Please try again.");
        }
    });
});

// Fetch the logged-in user's email
async function fetchUserEmail() {
        try {
            const response = await fetch('/view-login');
            const loginUsers = await response.json();

            if (response.ok) {
                const userEmail = loginUsers[0]?.email;

                if (userEmail) {
                    document.getElementById('userEmail').textContent = userEmail;
                } else {
                    alert('No email found for the logged-in user.');
                    window.location.href = '/login'; 
                }
            } else {
                alert('No email, log in first');
                window.location.href = '/login'; 
            }
        } catch (error) {
            console.error('Error fetching user email:', error);
            alert('An error occurred while fetching user email');
            window.location.href = '/login'; 
        }
    }
        function geocodeLocation(location) {
            return fetch(`https://nominatim.openstreetmap.org/search?q=${location}&format=json`)
                .then(response => response.json())
                .then(data => {
                    if (data.length > 0) {
                        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
                    } else {
                        throw new Error('Location not found');
                    }
                })
                .catch(err => console.error('Error geocoding location:', err));
        }

        function initMap(fishermanData, investorLocation) {
            const mapElement = document.getElementById('map');

            const mapInstance = L.map(mapElement).setView([fishermanData.latitude, fishermanData.longitude], 10);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

            const fishermanMarker = L.marker([fishermanData.latitude, fishermanData.longitude])
                .bindPopup(`Fisherman: ${fishermanData.username}`);

            const investorMarker = L.marker([investorLocation.lat, investorLocation.lon])
                .bindPopup('Investor: You are here!');

            L.layerGroup([fishermanMarker, investorMarker]).addTo(mapInstance);

            const distance = calculateDistance(investorLocation.lat, investorLocation.lon, fishermanData.latitude, fishermanData.longitude);
            investorMarker.bindPopup(`Investor: You are here! <br>Distance: ${distance.toFixed(2)} km`);

            const line = L.polyline([ 
                [fishermanData.latitude, fishermanData.longitude],
                [investorLocation.lat, investorLocation.lon]
            ], {
                color: 'blue',
                weight: 3,
                opacity: 0.7
            }).addTo(mapInstance);
        }

        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Radius of the Earth in km
            const dLat = (lat2 - lat1) * (Math.PI / 180);
            const dLon = (lon2 - lon1) * (Math.PI / 180);
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                      Math.sin(dLon / 2) * Math.sin(dLon / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return R * c; // Returns the distance in km
        }