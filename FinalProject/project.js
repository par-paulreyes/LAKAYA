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
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs } from 'firebase/firestore';
import haversine from 'haversine';

dotenv.config();

const app = express();
const port = 3000;

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
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname)));

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "nheileduria6@gmail.com",
    pass: "flgpccupxpwmpjot",
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/fishermen', (req, res) => {
  res.sendFile(path.join(__dirname, 'fishermen.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/homepage', (req, res) => {
  res.sendFile(path.join(__dirname, 'homepage.html'));
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

app.post('/register', async (req, res) => {
  const { username, email, password, location, role } = req.body;

  try {
    const userRecord = await firebaseAdmin.auth().createUser({
      email,
      password,
      displayName: username,
    });

    const userId = userRecord.uid;

    const userRef = doc(collection(db, 'users'), userId);

    await setDoc(userRef, {
      username,
      email,
      location,
      role,
      userId,
    });

    res.json({
      message: 'Registration successful!',
      userId: userId,  
      redirectTo: '/login',
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
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
      redirectTo: '/account',
    });

  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user', error: error.message });
  }
});

app.get("/search", async (req, res) => {
  const keyword = req.query.username;
  try {
    if (!keyword) {
      return res.status(400).send({ error: "Please provide a username" });
    }

    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("username", "==", keyword).get();

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

app.get("/investment-status", async (req, res) => {
  try {
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.get();
    
    let investorCount = 0;
    let fishermanCount = 0;
    let sustainableFishingCount = 0;

    querySnapshot.forEach(doc => {
      const user = doc.data();
      if (user.role === "investor") investorCount++;
      if (user.role === "fisherman") fishermanCount++;
      if (user.role === "sustainable_fishing") sustainableFishingCount++;
    });

    res.status(200).send({
      investors: investorCount,
      fishermen: fishermanCount,
      sustainableFishing: sustainableFishingCount
    });
  } catch (error) {
    res.status(500).send({ error: "Error getting investment status: " + error.message });
  }
});

app.get("/recommendations", async (req, res) => {
  try {
    const projectsRef = db.collection("projects");
    const querySnapshot = await projectsRef.orderBy("projectedProfit", "desc").limit(5).get();

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
    return res.status(500).json({ error: result.error });
  }

  res.json({ message: result.message });
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

http.createServer(app).listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
