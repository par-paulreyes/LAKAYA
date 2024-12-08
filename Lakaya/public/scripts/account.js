let loggedInEmail = null;
  let loggedInName = null;
  let isFisherman = false;
  let investorEmail = null;
  let fishermanEmail = null;

  async function fetchUserEmail() {
    try {
      const response = await fetch('/view-login');
      const loginUsers = await response.json();

      if (response.ok) {
        const userEmail = loginUsers[0]?.email;

        if (userEmail) {
          document.getElementById('user-email').textContent = userEmail;  
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

  // Call fetchUserEmail on page load to ensure the user is logged in
  fetchUserEmail();

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

  async function fetchInvestmentData() {
    try {
      const investmentResponse = await fetch('/view-investments');
      
      if (!investmentResponse.ok) {
        throw new Error(`Error: ${investmentResponse.status}`);
      }

      const investmentData = await investmentResponse.json();

      const investmentContainer = document.getElementById('investment-container');
      const investmentTable = document.getElementById('investment-table');
      const noInvestmentMessage = document.getElementById('no-investment-message');
      const investmentTableBody = investmentTable.querySelector('tbody');

      // Filter investments based on the logged-in user
      const filteredInvestments = investmentData.filter(investment => {
        investorEmail = investment.investor_email;
        fishermanEmail = investment.fisherman_email;
        return investment.fisherman_email === loggedInEmail || investment.investor_email === loggedInEmail;
      });

      if (filteredInvestments.length === 0) {
        // Hide the table and show the "No investments available" message
        investmentTable.style.display = 'none';
        investmentTableBody.style.display = 'none';
        noInvestmentMessage.style.display = 'block';
        return;
      }

      // Show the table and hide the message
      investmentTable.style.display = 'table';
      noInvestmentMessage.style.display = 'none';

      // Populate the investment table
      filteredInvestments.forEach(investment => {
        const row = document.createElement('tr');
        row.innerHTML = `
        ${investment.fisherman_email === loggedInEmail
          ?  `<td>${investment.inverstorname}</td> 
              <td>${investment.investor_email}</td>
              <td>${investment.investorLocation}</td>`
          : ''
        }
        ${investment.investor_email === loggedInEmail
          ? ` <td>${investment.username}</td>
              <td>${investment.fisherman_email}</td>
              <td>${investment.location}</td>`
          : ''
        }
          <td>₱${investment.target}</td>
          <td>+₱${investment.profit}</td>
          <td>${investment.investmentDate}</td>
          <td>${investment.status}</td>
          <td>
            ${ 
              investment.fisherman_email === loggedInEmail && investment.status !== 'Accepted'
                ? `<button class="accept-button">Accept</button>
                   <button class="deny-button">Deny</button>`
                : ``
            }
            ${ 
              investment.fisherman_email === loggedInEmail && investment.status === 'Accepted'
                ? `<button class="cancel-button">Cancel</button>`
                : ''
            }
            ${
              investment.investor_email === loggedInEmail && investment.status !== 'Cancelled'
                ? `<button class="cancel-button">Cancel</button>`
                : ''
            }
          </td>
        `;
        investmentTableBody.appendChild(row);
      });
      // Populate the investment table
      filteredInvestments.forEach(investment => {
        const tableHeaderRow = document.querySelector('#investment-table thead tr');
        tableHeaderRow.innerHTML = `
        ${investment.fisherman_email === loggedInEmail
          ?  `<th>Name</th>
              <th>Investor Email</th>
              <th>Location</th>
              <th>Target</th>
              <th>Profit</th>
              <th>Booked Date</th>
              <th>Status</th>
              <th>Actions</th>`
          : ''
        }
        ${investment.investor_email === loggedInEmail
          ? ` <th>Name</th>
              <th>Fisherman Email</th>
              <th>Location</th>
              <th>Target</th>
              <th>Profit</th>
              <th>Booked Date</th>
              <th>Status</th>
              <th>Actions</th>`
          : ''
        }
        `;
        investmentTableBody.appendChild(row);
      });
    } catch (error) {
      console.error('Error fetching investment data:', error);
      document.getElementById('error-message').innerText = 'Error fetching investment data';
      document.getElementById('error-message').style.display = 'block';
    }
  }

  fetchLoginData().then(() => {
    fetchInvestmentData();
  });

  document.querySelector('#investment-table').addEventListener('click', async (event) => {
    const investmentRow = event.target.closest('tr');

    // Function to handle confirmation popups
    const confirmAction = (message) => {
        return new Promise((resolve) => {
            const userConfirmation = confirm(message);
            resolve(userConfirmation);
        });
    };

    if (event.target.classList.contains('accept-button')) {
        const confirmed = await confirmAction('Are you sure you want to accept this investment?');
        if (!confirmed) return;

        try {
            const response = await fetch('/accept-investment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fisherman_email: fishermanEmail,
                    investor_email: investorEmail,
                }),
            });

            if (response.ok) {
                alert('Investment Accepted');
                location.reload(); // Reload the page after the action
            } else {
                const errorData = await response.json();
                console.error('Error accepting investment:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else if (event.target.classList.contains('deny-button')) {
        const confirmed = await confirmAction('Are you sure you want to deny this investment?');
        if (!confirmed) return;

        try {
            const response = await fetch('/deny-investment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fisherman_email: fishermanEmail,
                    investor_email: investorEmail,
                }),
            });

            if (response.ok) {
                alert('Investment Denied');
                location.reload(); // Reload the page after the action
            } else {
                const errorData = await response.json();
                console.error('Error denying investment:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else if (event.target.classList.contains('cancel-button')) {
        const confirmed = await confirmAction('Are you sure you want to cancel this investment?');
        if (!confirmed) return;

        try {
            const response = await fetch('/cancel-investment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fisherman_email: fishermanEmail,
                    investor_email: investorEmail,
                }),
            });

            if (response.ok) {
                alert('Investment Canceled');
                location.reload(); // Reload the page after the action
            } else {
                const errorData = await response.json();
                console.error('Error canceling investment:', errorData.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});


async function logout() {
  try {
    const response = await fetch('/logout', {
      method: 'POST',
    });

    if (response.ok) {
      const data = await response.json();
      alert(data.message); 
      window.location.href = '/'; 
    } else {
      const errorData = await response.json();
      alert('Error during logout: ' + errorData.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error during logout');
  }
}

document.getElementById('logout-button').addEventListener('click', logout);