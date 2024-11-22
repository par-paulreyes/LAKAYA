import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import firebaseAdmin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import haversine from 'haversine';

dotenv.config();

const app = express();
const port = 31043;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const serviceAccount = path.join(__dirname, 'firebase-service-account-key.json');
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
  databaseURL: 'https://lakayadb.firebaseio.com',
});

const firebaseConfig = {
  apiKey: "AIzaSyCF777puv2PuDWo6ZrMUvwbhjcr2VKm-UM",
  authDomain: "lakayadb.firebaseapp.com",
  projectId: "lakayadb",
  storageBucket: "lakayadb.firebasestorage.app",
  messagingSenderId: "990611749061",
  appId: "1:990611749061:web:7c68b90ef52d5dcda058ac",
  measurementId: "G-MHTSCKCHJR"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: true,
  },
});

function generateRandomInvestorId() {
  return Math.floor(10000000 + Math.random() * 90000000);
}

function calculateProjectedProfit(investmentAmount, projectedProfit) {
  return investmentAmount * (projectedProfit / 100);
}

async function bookInvestment(investorId, investorName, fishermanName, investmentAmount, projectedProfit, visitDateTime) {
  try {
    const investmentRef = doc(db, "investment", investorId.toString());
    const newInvestment = {
      investorName,
      fishermanName,
      investmentAmount,
      projectedProfit,
      visitDateTime,
      status: "Booked",
    };
    await setDoc(investmentRef, newInvestment);
    return { message: "Investment booked successfully!" };
  } catch (error) {
    return { error: "Error booking investment: " + error.message };
  }
}

async function getUserInvestmentStatus(userId) {
  try {
    const investmentsRef = collection(db, "investment");
    const q = query(investmentsRef, where("investorId", "==", userId));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { message: "No investments found for this user." };
    }

    const investments = [];
    querySnapshot.forEach(doc => {
      investments.push(doc.data());
    });

    return investments; 
  } catch (error) {
    console.error("Error fetching investment status:", error);
    return { error: "Error fetching investment status: " + error.message };
  }
}


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/map', (req, res) => {
  res.sendFile(path.join(__dirname, 'mapinvestment.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/register', async (req, res) => {
  const { email, password, username, role, latitude, longitude } = req.body;
  
  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userId = user.uid;
    await setDoc(doc(db, 'users', userId), {
      username,
      email,
      role,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: userId,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/account', async (req, res) => {
  const userId = req.query.userId;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required to view the account.' });
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    res.json({
      username: userData.username,
      email: userData.email,
      role: userData.role,
      location: userData.location,
      userId: userData.userId,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const auth = getAuth(firebaseApp);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;
    const userId = user.uid;

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    res.json({
      message: 'Login successful',
      userId: userData.userId,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      redirectTo: '/',
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
});

app.get('/fishermen', async (req, res) => {
  try {
      const fishermenRef = collection(db, 'users');
      const q = query(fishermenRef, where('role', '==', 'Fisherman'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          return res.status(404).json({ message: 'No fishermen found' });
      }

      const fishermen = [];
      querySnapshot.forEach(doc => {
          const data = doc.data();
          fishermen.push({
              username: data.username,  
              role: data.role,
          });
      });

      res.status(200).json(fishermen);
  } catch (error) {
      console.error("Error fetching fishermen:", error);
      res.status(500).json({ error: 'Error fetching fishermen data' });
  }
});


app.get("/search", async (req, res) => {
  const keyword = req.query.username;   
  try {
    if (!keyword) {
      return res.status(400).send({ error: "Please provide a username" });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", keyword));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).send({ message: "No users found" });
    }

    const results = [];
    querySnapshot.forEach(doc => {
      results.push(doc.data());  
    });

    res.status(200).send(results);
  } catch (error) {
    res.status(500).send({ error: "Error searching users: " + error.message });
  }
});

app.get('/search-investment', async (req, res) => {
  const username = req.query.username;

  if (!username) {
    return res.status(400).json({ error: 'Username is required to search for investments.' });
  }

  try {
    const investmentsRef = collection(db, "investment");
    const q = query(investmentsRef, where("investorName", "==", investorName));  // Assuming the 'username' is a field in the 'investment' collection

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "No investments found for this username." });
    }

    const investments = [];
    querySnapshot.forEach(doc => {
      investments.push({ 
        ...doc.data(),
        investmentId: doc.id  // Add investmentId to use when fetching detailed data
      });
    });

    res.json(investments);  // Return all matching investments
  } catch (error) {
    console.error("Error searching investments by username:", error);
    res.status(500).json({ error: "Error searching investments: " + error.message });
  }
});

app.get('/investment-status', async (req, res) => {
  const { investorName } = req.query;

  if (!investorName) {
    return res.status(400).json({ error: 'Investor name is required.' });
  }

  try {
    // Search for the investment by investorName
    const investmentsRef = collection(db, "investment");
    const q = query(investmentsRef, where("investorName", "==", investorName));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: "No investments found for this investor." });
    }
    const investmentData = querySnapshot.docs[0].data();

    res.json({
      investmentAmount: investmentData.investmentAmount || 'N/A',
      projectedProfit: investmentData.projectedProfit || 'N/A',
      status: investmentData.status || 'N/A',
    });

  } catch (error) {
    console.error('Error fetching investment status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/recommendations", async (req, res) => {
  try {
    const projectsRef = collection(db, "projects");
    const querySnapshot = await getDocs(query(projectsRef, orderBy("projectedProfit", "desc"), limit(5)));

    if (querySnapshot.empty) {
      return res.status(404).send({ message: "No recommendations found" });
    }

    const recommendations = [];
    querySnapshot.forEach(doc => {
      recommendations.push(doc.data());
    });

    res.status(200).send(recommendations);
  } catch (error) {
    res.status(500).send({ error: "Error fetching recommendations: " + error.message });
  }
});

app.post('/book-investment', async (req, res) => {
  const { investorName, fishermanName, investmentAmount, projectedProfit, visitDateTime } = req.body;

  if (!investorName || !fishermanName || isNaN(investmentAmount) || isNaN(projectedProfit) || !visitDateTime) {
    return res.status(400).json({ error: "Please provide all required fields correctly." });
  }

  const investorId = generateRandomInvestorId();
  const projectedReturn = calculateProjectedProfit(investmentAmount, projectedProfit);
  
  const result = await bookInvestment(investorId, investorName, fishermanName, investmentAmount, projectedProfit, visitDateTime);
  
  if (result.error) {
    return res.status(500).json(result);
  }

  try {
    const fishermanRef = query(collection(db, "users"), where("username", "==", fishermanName));
    const fishermanSnapshot = await getDocs(fishermanRef);

    if (fishermanSnapshot.empty) {
      return res.status(404).json({ error: 'Fisherman not found' });
    }

    const fishermanDoc = fishermanSnapshot.docs[0];
    const fishermanEmail = fishermanDoc.data().email;

    if (!fishermanEmail) {
      return res.status(404).json({ error: 'Fisherman email not found' });
    }

    const mailOptions = {
      from: '"LAKAYA" <nheileduria6@gmail.com>',
      to: fishermanEmail,
      subject: 'New Investment Booking',
      html: `
        <h3>New Investment Booking</h3>
        <p><strong>Investor Name:</strong> ${investorName}</p>
        <p><strong>Investment Amount:</strong> ${investmentAmount}</p>
        <p><strong>Projected Profit Rate:</strong> ${projectedProfit}%</p>
        <p><strong>Visit Date and Time:</strong> ${visitDateTime}</p>
        <p>Thank you for being part of this investment opportunity!</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Investment booked successfully! Fisherman has been notified via email." });
  } catch (error) {
    console.error('Error sending email to fisherman:', error);
    res.status(500).json({ error: "Error sending email to fisherman: " + error.message });
  }
});


app.get('/location', async (req, res) => {
  const startLocationName = req.query.start || 'Manila';

  try {
    const locationsSnapshot = await getDocs(collection(db, 'locations'));
    const locations = [];

    locationsSnapshot.forEach(doc => {
      const data = doc.data();
      locations.push({
        name: data.name,
        lat: data.lat,
        lon: data.lon,
      });
    });

    const startLocation = locations.find(loc => loc.name === startLocationName);
    if (!startLocation) {
      return res.status(404).send({ error: 'Start location not found' });
    }

    const distancesFromStart = calculateDistances(startLocation, locations);
    const { shortestLocation, shortestDistance } = findShortestLocation(distancesFromStart);

    res.json({
      startLocation: startLocation.name,
      distances: distancesFromStart,
      shortestLocation: {
        name: shortestLocation,
        distance: shortestDistance
      }
    });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return res.status(500).json({ error: error.message });
  }
});

function calculateDistances(startLocation, locations) {
  const distances = {};
  locations.forEach(function (loc) {
    if (loc.name !== startLocation.name) {
      const distance = haversine(
        { latitude: startLocation.lat, longitude: startLocation.lon },
        { latitude: loc.lat, longitude: loc.lon }
      );
      distances[loc.name] = distance;
    }
  });
  return distances;
}

function findShortestLocation(distances) {
  let shortestDistance = Infinity;
  let shortestLocation = null;

  Object.keys(distances).forEach(function (loc) {
    if (distances[loc] < shortestDistance) {
      shortestDistance = distances[loc];
      shortestLocation = loc;
    }
  });

  return { shortestLocation, shortestDistance };
}

app.listen(port, () => {
  console.log(`Server is running on port at http://localhost:${port}`);
});
