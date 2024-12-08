<img src="https://i.ibb.co/f0S3kMQ/Blue-Grey-Bold-Fish-Market-Logo.png" width=1000 height=300><br>
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>
## Contents 🐠
- [Introduction](#introduction)
- [Features](#features)
- [Purpose](#purpose)
- [Project Architecture](#architecture)
- [Prerequisites](#prereqs)
- [Member Portfolio](#members)


<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>

### <a name="introduction"></a>
## Introduction 🌊
<div align="justify">
	
Have you ever considered our seafood's journey before it reaches your table? In a world where sustainability is becoming increasingly critical, every choice matters. Welcome to **LAKAYA**, a groundbreaking platform connecting fishermen and investors for sustainable growth. We aim to foster collaboration that empowers local fishing communities while enabling investors to make impactful, environmentally-conscious decisions. Whether you’re a fisherman seeking investment or an investor looking to support sustainable practices, LAKAYA is your partner for creating a better future.

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>

### <a name="features"></a>
## Features 🌐
<div align="justify">
	
<li> <strong>Login/Register:</strong> Seamless onboarding for users.</li>
<li> <strong>Profile:</strong> A personal dashboard for managing activities.</li>
<li> <strong>Be a Fisherman:</strong> A dedicated section for fishermen to register and showcase their practices.</li>
<li> <strong>Map-Based Search:</strong> Utilize location-based filtering with Haversine theory to find nearby fishermen upon entering your current location.</li>
<li> <strong>Budget-Based Search:</strong> Maximize budget, using the Knapsack algorithm to filter fishermen, display the best options tailored to your needs.</li>
<li> <strong>Filtered Results:</strong> View the list of fishermen matching your search criteria, with details such as name, location, and investment cost.</li>
<li> <strong>Investment Process:</strong> After finding a fisherman, investors can proceed to the Investment Page to book visits.</li>
<li> <strong>Dashboard:</strong> Gain insights into platform metrics, including Total users, fishermen, investors, and sustainable impact.</li>
<li> <strong>How It Works:</strong> A step-by-step guide for using LAKAYA, making it easy for new users to navigate the platform and get started.</li>
<li> <strong>Feedback:</strong> Share experiences and suggestions to help us improve and foster a stronger community.</li>
<li> <strong>About Us:</strong> Learn more about LAKAYA’s mission, vision, and commitment to sustainable development.</li>

</div>

<br><img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>

### <a name="purpose"></a>
## Purpose 🌍
<div align="justify">
	
**LAKAYA** promotes sustainability in the fishing industry while fostering economic growth and equitable opportunities. Aligned with the **United Nations Sustainable Development Goals (SDGs)**, our platform specifically contributes to:

<br>

<table>
	<tr>
		<th> <img src="https://i.ibb.co/p4ZJWYW/1-SDG-Make-Every-Day-Count-Gifs-GDU.gif" width=180 height=180/></th>
		<td> <strong>SDG 1: No Poverty</strong>
			<li> <strong>Target 1.2: </strong>Reduce at least by half the proportion of people living in poverty in all its dimensions. LAKAYA enables fishermen to secure investments, increasing their income and reducing their vulnerability to economic instability.</li>
		    	<li> <strong>Target 1.4: </strong>Ensure equal access to economic resources and opportunities. By providing a platform accessible to all fishermen, regardless of location, LAKAYA creates equitable opportunities for growth and development.</li>
	</tr>
	<tr>
		<th> <img src="https://i.ibb.co/3hs1LSv/8-SDG-Make-Every-Day-Count-Gifs-GDU.gif" width=180 height=180/></th>
	    	<td> <strong>SDG 8: Decent Work and Economic Growth </strong>
			<li> <strong>Target 8.3: </strong> Promote development-oriented policies that support productive activities and decent job creation. LAKAYA incentivizes sustainable fishing, creating productive and dignified opportunities for fishermen while fostering responsible investments.</li>
			<li> <strong>Target 8.5: </strong> Achieve full and productive employment and decent work for all, including equal pay for work of equal value. The platform helps fishermen gain fair compensation for their efforts by connecting them directly with socially conscious investors.</li>
			<li> <strong>Target 8.10: </strong> Strengthen the capacity of financial institutions to encourage investment in underserved areas. LAKAYA acts as a bridge for investments in traditionally underserved fishing communities, driving financial inclusion and local development.</li>
	</tr>
	<tr>
		<th> <img src="https://i.ibb.co/sjCvBWn/14-SDG-Make-Every-Day-Count-Gifs-GDU.gif" width=180 height=180/></th>
	    	<td> <strong>SDG 14: Life Below Water </strong>
		    	<li> <strong>Target 14.2: </strong> Sustainably manage and protect marine ecosystems to avoid significant adverse impacts. By emphasizing sustainable fishing practices, LAKAYA supports the conservation of marine biodiversity and ecosystems.</li>
		    	<li> <strong>Target 14.7: </strong> Increase the economic benefits from the sustainable use of marine resources. The platform promotes aquaculture and sustainable fishing as economic drivers, benefiting coastal communities while protecting marine resources.</li>
		    	<li> <strong>Target 14.b: </strong> Provide access for small-scale artisanal fishers to marine resources and markets. LAKAYA connects small-scale fishermen to broader investment opportunities, improving their market access and visibility.</li>
	    	</td>
	</tr>
</table>

With LAKAYA, you’re not just investing in fishing but in the future of sustainable communities and marine ecosystems. Join us and become part of this transformative journey.

</div>

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>

### <a name="architecture"></a>
## Project Architecture 🏗️
### Overview  
The LAKAYA platform is architected to seamlessly connect fishermen and investors through a highly interactive, scalable, and intuitive web application. It incorporates modern technologies and algorithms to ensure a robust and user-centric experience.

### **Frontend (User Interface)**  
- **Technologies**: HTML, CSS, JavaScript  
- **Purpose**: Builds a responsive, intuitive UI for diverse devices.  
- **Pages**:
  - Homepage
  - Investment Page
  - Be a Fisherman Page
  - Fisherman and Investor Profiles
  - Login and Register Page
- **Integration**:
  - **Map-Based Filtering**: Location search using the Haversine formula.
  - **Budget-Based Filtering**: Algorithmically ranks fishermen (Knapsack algorithm).

### **Backend (Business Logic)**  
- **Technology**: Node.js with Express.js  
- **Purpose**: Provides RESTful APIs for communication.  
- **Features Implemented**:
  - **Authentication**: JWT-based login/registration.
  - **CRUD Operations**:
    - Create and manage fishermen profiles.
    - Manage investments and bookings.
  - **Algorithms**:
    - Knapsack algorithm for budget optimization.
    - Haversine formula for location-based search.

### **Database**  
- **Technology**: Firebase - Firestore
- **Purpose**: Stores structured data for:
  - User profiles
  - Fisherman information (name, location, fishing method, capacity, fish type, etc.)
  - Investment and booking records.

### **Integration Features**  
- **Map Services**: Integrated via third-party APIs for geolocation-based searches.  
- **Email Notifications**: Confirmations for bookings and investments.  
- **Admin Dashboard**: Analytics for user growth and sustainable impact.

### **Algorithms**  
- **Haversine Formula**: Calculates the shortest distance to fishermen based on user location.  
- **Knapsack Algorithm**: Matches fishermen to investors by maximizing sustainable impact under budget constraints.

### **Technology Stack**  
| **Layer**          | **Technology**         |
|---------------------|------------------------|
| Frontend           | HTML, CSS, JavaScript  |
| Backend            | Node.js with Express.js|
| Database           | Firebase - Firestore  |
| Map Services       | leaflet               |
| Algorithms         | Knapsack, Haversine   |

<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>

### <a name="prereqs"></a>
## Prerequisites ⚓
🔻***Install Modules*** : 
<pre><code>npm install</code></pre>
🔻***Run Server*** : 
<pre><code>node project.js</code></pre>
	
<img src="https://user-images.githubusercontent.com/73097560/115834477-dbab4500-a447-11eb-908a-139a6edaec5c.gif"><br>

### <a name="members"></a>
<h2 align="center">Member Portfolio 💅</h2>

<table align="center" border="1" cellpadding="10" cellspacing="0">
  <tr>
    <td>
      <img src="https://i.ibb.co/NCqL8Wm/403629066-664455985677276-3442638710394462470-n.jpg" width="150" height="150" style="vertical-align: middle;">
    </td>
	  <td>
		  <h5 align ="center">Frontend Developer</h5>
		  <h3 align="center">De Jose, Mary Kristine</h3>
	  </td>
    <td>
      <ul>
        <li>Dynamite with a laser beam (she/her)</li>
        <li>ISTP</li>
        <li>Gemini</li>
        <li>22-03865@g.batstate-u.edu.ph</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <img src="https://i.ibb.co/s2X13CG/photo.png" width="150" height="150" style="vertical-align: middle;">
    </td>
	  <td>
		  <h5 align ="center">Backend Developer</h5>
		  <h3 align="center">Eduria, Nhiel G.</h3>
	  </td>
    <td>
      <ul>
        <li>Silent Killer (he/him)</li>
        <li>Unknown</li>
        <li>Pisces</li>
        <li>22-05319@g.batstate-u.edu.ph</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>
      <img src="https://i.ibb.co/NWdZgqb/Untitled-design-1.png" width="150" height="150" style="vertical-align: middle;"><br>
    </td>
	  <td>
		  <h5 align ="center">Fullstack Developer</h5>
		  <h3 align="center">Reyes, Paul Alexis J.</h3>
	  </td>
    <td>
      <ul>
        <li>kinemaster cracked (he/him)</li>
        <li>INTP</li>
        <li>Cancer</li>
        <li>22-00869@g.batstate-u.edu.ph</li>
      </ul>
    </td>
  </tr>
</table>


