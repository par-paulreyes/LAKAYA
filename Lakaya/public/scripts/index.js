const mapElement = document.getElementById("map");
   const fishermenListElement = document.getElementById("fishermenList");
   const getLocationButton = document.getElementById("getLocationButton");
   const locationInput = document.getElementById("locationInput");
   const usernameInput = document.getElementById("usernameInput");
   const budgetInput = document.getElementById("budgetInput");
   const profileContainer = document.querySelector('.profile-container');
   const leftButton = document.querySelector('.slider-button.left');
   const rightButton = document.querySelector('.slider-button.right');
 
 
   let currentLocation = { lat: null, lon: null };
   let allFishermen = [];
   let mapInstance = null; // Store the map instance
   let markersLayer = null; // Store the markers layer
   let loggedInName = null;

   async function fetchLoginData() {
    try {
      const loginResponse = await fetch('/view-login');
      
      if (!loginResponse.ok) {
        throw new Error(`Error: ${loginResponse.status}`);
      }

      const loginData = await loginResponse.json();

      if (loginData.message && loginData.message === 'No login data found') {
        window.location.href = '/login';
        return;
      }

      const userNameElement = document.getElementById('user-name');
      const userEmailElement = document.getElementById('user-email');

      loginData.forEach(login => {
        loggedInEmail = login.email;
        loggedInName = login.name;
        isFisherman = login.email === login.fisherman_email;

        userNameElement.textContent = login.name;
        userEmailElement.textContent = login.email;
      });
    } catch (error) {
      console.error('Error fetching login data:', error);
      document.getElementById('error-message').innerText = 'Error fetching login data';
      document.getElementById('error-message').style.display = 'block';
    }
  }

// Function to scroll left
function scrollLeft() {
    if (profileContainer.scrollLeft > 0) { // Check if it's not already at the start
        profileContainer.scrollBy({
            left: -320, // Adjust based on card width + gap
            behavior: 'smooth'
        });
    }
}

// Function to scroll right
function scrollRight() {
    profileContainer.scrollBy({
        left: 320, // Adjust based on card width + gap
        behavior: 'smooth'
    });
}

// Add event listeners for buttons
leftButton.addEventListener('click', scrollLeft);
rightButton.addEventListener('click', scrollRight);

// Optional: Disable the left button when the container is at the start
profileContainer.addEventListener('scroll', () => {
    if (profileContainer.scrollLeft === 0) {
        leftButton.disabled = true; // Disable left button if at the start
    } else {
        leftButton.disabled = false; // Enable left button when scrolling
    }

    // Optional: Disable right button when scrolling to the end of the container
    if (profileContainer.scrollLeft + profileContainer.clientWidth >= profileContainer.scrollWidth) {
        rightButton.disabled = true; // Disable right button if at the end
    } else {
        rightButton.disabled = false; // Enable right button when scrolling
    }
});
   
     // Profile popup functionality
     const profileIcon = document.querySelector('.profile-icon');
     const profilePopup = document.querySelector('.profile-popup');
     
     if (profileIcon && profilePopup) {
         profileIcon.addEventListener('click', () => {
             profilePopup.style.display = profilePopup.style.display === 'none' ? 'block' : 'none';
         });
 
         // Close popup when clicking outside
         document.addEventListener('click', (e) => {
             if (!profileIcon.contains(e.target) && !profilePopup.contains(e.target)) {
                 profilePopup.style.display = 'none';
             }
         });
     }

   function fetchFishermen() {
     fetch('/get-fishermen')
       .then(response => response.json())
       .then(data => {
         allFishermen = data;
         displayFishermen(data);
         fetchLoginData();
       })
       .catch(err => console.error('Error fetching fishermen:', err));
   }
 
   function displayFishermen(fishermen) {
  fishermenListElement.innerHTML = '';

  // Sort fishermen by distance from current location (nearest to farthest)
  fishermen.sort((a, b) => {
    const distanceA = calculateDistance(currentLocation.lat, currentLocation.lon, a.latitude, a.longitude);
    const distanceB = calculateDistance(currentLocation.lat, currentLocation.lon, b.latitude, b.longitude);
    return distanceA - distanceB; // Ascending order (nearest first)
  });

  fishermen.forEach(fisherman => {
    let distanceText = '';
    
    if (currentLocation.lat && currentLocation.lon) {
      const distance = calculateDistance(currentLocation.lat, currentLocation.lon, fisherman.latitude, fisherman.longitude);
      distanceText = `<small>${distance.toFixed(2)} km away</small><br>`;
    }

    const fishermanItem = document.createElement('div');
    fishermanItem.classList.add('fisherman-item');
    fishermanItem.innerHTML = `
      <strong>${fisherman.username.toUpperCase()}</strong><br>
      <em>${fisherman.location}</em><br>
      <small>Profit: +₱${(fisherman.target * (fisherman.cut / 100))}</small><br>
      <small>Target Amout: ₱${fisherman.target}</small><br>
      <small>${distanceText}<br>
      <button class="invest-btn">Invest</button>
    `;
    
    const investButton = fishermanItem.querySelector('.invest-btn');
    investButton.addEventListener('click', function() {
      invest(fisherman);
    });

    fishermenListElement.appendChild(fishermanItem);
  });
}
 
 
   function invest(fisherman) {
     if (locationInput.value.trim() === "") {
         alert("Please enter a location before investing.");
         return; 
     }
 
     localStorage.setItem('investorLocation', locationInput.value.trim());
     localStorage.setItem('selectedFisherman', JSON.stringify(fisherman));
     window.location.href = '/investment';
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
 
   function calculateDistance(lat1, lon1, lat2, lon2) {
     const R = 6371;
     const dLat = (lat2 - lat1) * (Math.PI / 180);
     const dLon = (lon2 - lon1) * (Math.PI / 180);
     const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
               Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
               Math.sin(dLon / 2) * Math.sin(dLon / 2);
     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     return R * c;
   }
 
   function knapsack(fishermen, budget) {
   const n = fishermen.length;
 
   const dp = new Array(n + 1).fill(null).map(() => new Array(budget + 1).fill(0));
 
   const profit = fishermen.map(fisherman => {
     return fisherman.target + (fisherman.target * fisherman.cut / 100);
   });
   const weight = fishermen.map(fisherman => fisherman.target);
 
   for (let i = 1; i <= n; i++) {
     for (let w = 0; w <= budget; w++) {
       if (weight[i - 1] <= w) {
         dp[i][w] = Math.max(dp[i - 1][w], dp[i - 1][w - weight[i - 1]] + profit[i - 1]);
       } else {
         dp[i][w] = dp[i - 1][w];
       }
     }
   }
 
   let maxProfit = dp[n][budget];
 
   let w = budget;
   const selectedFishermen = [];
   for (let i = n; i > 0; i--) {
     if (dp[i][w] !== dp[i - 1][w]) {
       selectedFishermen.push(fishermen[i - 1]);
       w -= weight[i - 1];
     }
   }
 
   selectedFishermen.reverse();
 
   console.log("Max Profit: ", maxProfit);
   console.log("Selected Fishermen: ", selectedFishermen);
 
   return selectedFishermen;
 }
 
 
   function filterFishermen() {
     let filteredFishermen = allFishermen;
 
     if (locationInput.value.trim() !== "") {
       geocodeLocation(locationInput.value)
         .then(userLocation => {
           currentLocation = userLocation;
           filteredFishermen = filteredFishermen.filter(fisherman => {
             const distance = calculateDistance(userLocation.lat, userLocation.lon, fisherman.latitude, fisherman.longitude);
             return distance <= 500;
           });
           displayFishermen(filteredFishermen);
           showFishermenOnMap(filteredFishermen);
         })
         .catch(() => {
           displayFishermen([]); 
           mapElement.style.display = 'none';
         });
     }
 
     if (usernameInput.value.trim() !== "") {
       filteredFishermen = filteredFishermen.filter(fisherman => 
         fisherman.username.toLowerCase().includes(usernameInput.value.toLowerCase())
       );
     }
 
     if (budgetInput.value.trim() !== "") {
       const budget = parseFloat(budgetInput.value);
       filteredFishermen = knapsack(filteredFishermen, budget);
     }
 
     displayFishermen(filteredFishermen);
     if (filteredFishermen.length === 0) {
       mapElement.style.display = 'none';
     } else {
       showFishermenOnMap(filteredFishermen);
     }
   }
 
   function showFishermenOnMap(fishermen) {
     if (!mapElement || !currentLocation.lat || !currentLocation.lon) return;
 
     if (mapInstance) {
       mapInstance.remove();
     }
 
     mapElement.style.display = 'block';
     mapInstance = L.map(mapElement).setView([currentLocation.lat, currentLocation.lon], 13);
     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);
 
     markersLayer = L.markerClusterGroup();
     const userMarker = L.marker([currentLocation.lat, currentLocation.lon]);
     userMarker.bindPopup("You are here!");
     markersLayer.addLayer(userMarker);
 
     fishermen.forEach(fisherman => {
       const marker = L.marker([fisherman.latitude, fisherman.longitude]);
       const distance = calculateDistance(currentLocation.lat, currentLocation.lon, fisherman.latitude, fisherman.longitude);
       marker.bindPopup(`
         <strong>${fisherman.username}</strong><br>
         ${fisherman.location}<br>
         <small>${distance.toFixed(2)} km away</small><br>
         <small>Target: Php${fisherman.target}</small>
       `);
 
       const userLatLon = [currentLocation.lat, currentLocation.lon];
       const fishermanLatLon = [fisherman.latitude, fisherman.longitude];
       const polyline = L.polyline([userLatLon, fishermanLatLon], { color: 'blue', weight: 2 }).addTo(mapInstance);
       markersLayer.addLayer(marker);
     });
 
     mapInstance.addLayer(markersLayer);
   }
 
   getLocationButton.addEventListener("click", function() {
     if (navigator.geolocation) {
         watchID = navigator.geolocation.watchPosition(function(position) {
             currentLocation.lat = position.coords.latitude;
             currentLocation.lon = position.coords.longitude;
 
             const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${currentLocation.lat}&lon=${currentLocation.lon}&format=json`;
 
             fetch(geocodeUrl)
                 .then(response => response.json())
                 .then(data => {
                     const locationName = data.display_name || "Unknown location";
                     locationInput.value = locationName;  
                     filterFishermen(); 
                 })
                 .catch(error => {
                     console.error("Error in geocoding:", error);
                     locationInput.value = "Unable to determine location"; 
                 });
 
         }, function(error) {
             alert("Unable to retrieve your location. Error: " + error.message);
         });
     } else {
         alert("Geolocation is not supported by your browser.");
     }
 });
 
   locationInput.addEventListener("input", filterFishermen);
   usernameInput.addEventListener("input", filterFishermen);
   budgetInput.addEventListener("input", filterFishermen);
 
   fetchFishermen();
   updateDashboardStats();
 
   document.getElementById('logout-button').addEventListener('click', logout);
   async function logout() {
       try {
         const response = await fetch('/logout', {
           method: 'POST',
         });
 
         const data = await response.json();
 
         if (data.error) {
           document.getElementById('error-message').innerText = data.error;
           document.getElementById('error-message').style.display = 'block';
         } else {
           alert('Logged out successfully!');
           window.location.href = '/'; 
         }
       } catch (error) {
         console.error('Error during logout:', error);
         document.getElementById('error-message').innerText = 'Error during logout';
         document.getElementById('error-message').style.display = 'block';
       }
     }

     document.getElementById('feedback-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const message = document.getElementById('message').value;

  const feedbackData = {
    name,
    email,
    message,
  };

  try {
    const response = await fetch('/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedbackData),
    });

    const result = await response.json();
    if (response.ok) {
      alert(result.message); 
    } else {
      alert('Error: ' + result.error); 
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    alert('An error occurred while submitting your feedback.');
  }
});

// Define variables to store fetched counts
  let userCount = 0;
  let investmentCount = 0;
  let fishermanCount = 0;

  // Function to fetch and update the dashboard stats
  function updateDashboardStats() {
    // Fetch and update the number of users
    fetch('/get-users') // Adjust to your API endpoint for users
      .then(response => response.json())
      .then(data => {
        if (data && data.userCount !== undefined) {
          userCount = data.userCount;
          document.getElementById('userCount').textContent = `${userCount}`;
        } else {
          document.getElementById('userCount').textContent = '0';
        }
        computeSustainableImpact(); // Recalculate impact score
      })
      .catch(error => {
        console.error('Error fetching users data:', error);
        document.getElementById('userCount').textContent = '0';
      });

    // Fetch and update the number of investments
    fetch('/get-investments') // Adjust to your API endpoint for investments
      .then(response => response.json())
      .then(data => {
        if (data && data.investmentCount !== undefined) {
          investmentCount = data.investmentCount;
          document.getElementById('investmentCount').textContent = `${investmentCount}`;
        } else {
          document.getElementById('investmentCount').textContent = '0';
        }
        computeSustainableImpact(); // Recalculate impact score
      })
      .catch(error => {
        console.error('Error fetching investments data:', error);
        document.getElementById('investmentCount').textContent = '0';
      });

    // Fetch and update the number of fishermen
    fetch('/get-fishermen') // Adjust to your API endpoint for fishermen
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data) && data.length) {
          fishermanCount = data.length;
          document.getElementById('fishermanCount').textContent = `${fishermanCount}`;
        } else {
          document.getElementById('fishermanCount').textContent = '0';
        }
        computeSustainableImpact(); // Recalculate impact score
      })
      .catch(error => {
        console.error('Error fetching fishermen data:', error);
        document.getElementById('fishermanCount').textContent = '0';
      });
  }

  // Function to calculate and display the sustainable impact score
function computeSustainableImpact() {
  if (userCount >= 0 && investmentCount >= 0 && fishermanCount >= 0) {
    // Assign weights based on the relative impact each factor has on sustainability
    const userWeight = 0.10;  // Users contribute 25% to sustainability
    const investmentWeight = 0.70;  // Investments contribute 35% to sustainability
    const fishermanWeight = 0.20;  // Fishermen contribute 40% to sustainability

    // Compute the weighted contributions
    const userContribution = userCount * userWeight;
    const investmentContribution = investmentCount * investmentWeight;
    const fishermanContribution = fishermanCount * fishermanWeight;

    // Calculate the total contributions
    const totalContribution = userContribution + investmentContribution + fishermanContribution;

    // Normalize the total contribution to a percentage (out of 100)
    const impactScore = ((totalContribution / userCount));

    // Update the sustainable impact display
    document.getElementById('sustainableImpact').textContent = `${impactScore.toFixed(2)}%`;
  } else {
    document.getElementById('sustainableImpact').textContent = '0%';
  }
}


  // Initial data load
  updateDashboardStats();