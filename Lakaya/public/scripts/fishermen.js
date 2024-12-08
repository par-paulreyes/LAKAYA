async function fetchUserEmail() {
    try {
      const response = await fetch('/view-login');
      const loginUsers = await response.json();

      if (response.ok) {
        const userEmail = loginUsers[0]?.email;

        if (userEmail) {
          document.getElementById('email').value = userEmail;  
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

  const map = L.map('map').setView([14.5995, 120.9842], 12);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const marker = L.marker([14.5995, 120.9842], { draggable: true }).addTo(map);

  async function searchLocation(query) {
    if (query.trim() === "") {
      return;  
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1`);
      const data = await response.json();

      if (data.length > 0) {
        const location = data[0];
        const lat = location.lat;
        const lon = location.lon;

        document.getElementById('location').value = location.display_name;
        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lon;

        marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 12);  
      } else {
        alert('Location not found. Please try again.');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert('An error occurred while searching for the location.');
    }
  }

  document.getElementById('location').addEventListener('input', function(event) {
    clearTimeout(window.locationSearchTimeout);
    window.locationSearchTimeout = setTimeout(() => {
      searchLocation(event.target.value);
    }, 500);  
  });

  map.on('click', function(event) {
    const lat = event.latlng.lat;
    const lon = event.latlng.lng;

    marker.setLatLng(event.latlng);

    document.getElementById('latitude').value = lat;
    document.getElementById('longitude').value = lon;

    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
      .then(response => response.json())
      .then(data => {
        const locationName = data.display_name;
        document.getElementById('location').value = locationName;  
      })
      .catch(error => console.error('Error fetching location name:', error));
  });

  document.getElementById('currentlocation').addEventListener('click', function(event) {
    event.preventDefault();

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        marker.setLatLng([lat, lon]);
        map.setView([lat, lon], 12);  

        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lon;

        fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          .then(response => response.json())
          .then(data => {
            const locationName = data.display_name;
            document.getElementById('location').value = locationName;
          })
          .catch(error => console.error('Error fetching location name:', error));

      }, function(error) {
        alert('Error getting current location: ' + error.message);
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  });

  fetchUserEmail(); 

  document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const data = {};
    formData.forEach((value, key) => { data[key] = value });

    try {
      const emailCheckResponse = await fetch('/check-email-fisherman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email })
      });

      const emailCheckResult = await emailCheckResponse.json();
      if (emailCheckResult.exists) {
        alert('This email is already registered as a fisherman!');
        return;
      }

      const registerResponse = await fetch('/register/fisherman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const registerResult = await registerResponse.json();
      if (registerResult.message) {
        alert('Registration successful!');
        window.location.href = '/';  
      } else {
        alert('Error: ' + registerResult.error);
      }

    } catch (error) {
      alert('Error: ' + error.message);
    }
  });