import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import firebaseAdmin from 'firebase-admin';
import nodemailer from 'nodemailer';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, updateDoc, getDocs, query, where, addDoc, deleteDoc } from 'firebase/firestore';
import bcrypt from 'bcrypt';
import haversine from 'haversine';

dotenv.config();

const app = express();
const port = process.env.PORT;

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
    user: "nheileduria6@gmail.com",
    pass: "bwojvmgipjhhrdnn",
  },
  tls: {
    rejectUnauthorized: true,
  },
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, './public/register.html'));
});

app.get('/fisherman', (req, res) => {
  res.sendFile(path.join(__dirname, './public/fishermen.html'));
});

app.get('/investment', (req, res) => {
  res.sendFile(path.join(__dirname, './public/booking.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, './public/login.html'));
});

app.get('/account', (req, res) => {
  res.sendFile(path.join(__dirname, './public/account.html'));
});

app.post('/profile', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', email)); 
    const userSnapshot = await getDocs(userQuery);
    

    if (!userSnapshot.empty) {
      return res.status(400).json({ error: 'Email is already in use. Please choose a different email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserRef = doc(collection(db, 'users')); 
    await setDoc(newUserRef, { 
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: 'User created successfully',
      userId: newUserRef.id, 
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: error.message });
  }
});


app.post('/register/fisherman', async (req, res) => {
  const { email, username, location, target, cut, descriptions, type, fish, latitude, longitude } = req.body;

  try {

    const fishermanData = {
      email,
      username,
      location,
      latitude,
      longitude,
      target,
      cut,
      descriptions,
      type,
      fish,
    };

    const docRef = await addDoc(collection(db, 'fishermen'), fishermanData);

    res.status(201).json({
      message: 'Fisherman registered successfully!',
      fishermanId: docRef.id,
    });
  } catch (error) {
    console.error('Error registering fisherman:', error);
    res.status(500).json({ message: 'Error registering fisherman', error: error.message });
  }
});

app.get('/get-fishermen', async (req, res) => {
  try {
    const fishermenRef = collection(db, 'fishermen');
    const q = query(fishermenRef); 
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'No fishermen found' });
    }

    const fishermen = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      fishermen.push({
        id: doc.id,
        username: data.username,
        email: data.email,
        cut: data.cut,
        target: data.target,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        descriptions: data.descriptions,
        type: data.type,
        fish: data.fish,
      });
    });

    // Fetch users from Firestore and return the count
app.get('/get-users', async (req, res) => {
  try {
    const usersRef = collection(db, 'users');  // Reference to the users collection in Firestore
    const q = query(usersRef);  // Optionally, you can add filtering or sorting
    const querySnapshot = await getDocs(q);

    // Return the number of users
    res.status(200).json({ userCount: querySnapshot.size });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: 'Error fetching users data' });
  }
});

app.get('/get-investments', async (req, res) => {
  try {
    const investmentsRef = collection(db, 'investments');
    const q = query(investmentsRef);
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'No investments found' });
    }

    const investmentCount = querySnapshot.size;
    res.status(200).json({ investmentCount });
  } catch (error) {
    console.error("Error fetching investments:", error);
    res.status(500).json({ error: 'Error fetching investments data' });
  }
});


    res.status(200).json(fishermen);
  } catch (error) {
    console.error("Error fetching fishermen:", error);
    res.status(500).json({ error: 'Error fetching fishermen data' });
  }
});


app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const usersRef = collection(db, 'users');
    const userQuery = query(usersRef, where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);

    if (userSnapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();

    const passwordMatch = await bcrypt.compare(password, userData.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const loginRef = doc(collection(db, 'login'),email);
    await setDoc(loginRef, { 
      name: userData.name,
      email: userData.email
    });

    res.json({ username: userData.username, email: userData.email });


  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/check-email-fisherman', async (req, res) => {
  const { email } = req.body;

  try {
    const fishermenRef = collection(db, 'fishermen');
    const q = query(fishermenRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.json({ exists: false });
    } else {
      return res.json({ exists: true });
    }
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({ error: 'Error checking email' });
  }
});

app.get('/view-login', async (req, res) => {
  try {
    const loginRef = collection(db, 'login');
    const querySnapshot = await getDocs(loginRef);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'No login data found' });
    }

    const loginUsers = [];
    querySnapshot.forEach(doc => {
      loginUsers.push(doc.data());
    });

    res.status(200).json(loginUsers);
  } catch (error) {
    console.error('Error fetching login data:', error);
    res.status(500).json({ error: 'Error fetching login data' });
  }
});

app.get('/view-investments', async (req, res) => {
  try {
    const investmentRef = collection(db, 'investments');
    const querySnapshot = await getDocs(investmentRef);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'No investment data found' });
    }

    const investments = [];
    querySnapshot.forEach(doc => {
      investments.push(doc.data());  
    });

    res.status(200).json(investments);
  } catch (error) {
    console.error('Error fetching investment data:', error);
    res.status(500).json({ error: 'Error fetching investment data' });
  }
});

app.post('/deny-investment', async (req, res) => {
  try {
    const { fisherman_email, investor_email } = req.body;

    if (!fisherman_email || !investor_email) {
      return res.status(400).json({ error: 'Missing fisherman_email or investor_email' });
    }

    const investmentRef = collection(db, 'investments');
    const q = query(investmentRef, where("fisherman_email", "==", fisherman_email), where("investor_email", "==", investor_email));
    const investmentSnapshot = await getDocs(q);

    if (investmentSnapshot.empty) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investmentSnapshot.forEach(async (doc) => {
      const investment = doc.data();
      
      await updateDoc(doc.ref, { status: 'Denied' });

      const mailOptions = {
        from: investment.investor_email,
        to: investment.fisherman_email,
        subject: 'Investment Denied',
        text: `Dear Investor,\n\nThe investment in the fisherman has been cancelled.
        \n\nDetails:
        \n- Location: ${investment.location}
        \n- Target: ${investment.target}
        \n- Cut: ${investment.cut}
        \n\nRegards,
        \nYour Investment Platform`,
      };

      await transporter.sendMail(mailOptions);

      await deleteDoc(doc.ref);
    });

    res.status(200).json({ message: 'Investment denied, deleted from Firebase, and email sent to investor' });
  } catch (error) {
    console.error('Error denying investment:', error);
    res.status(500).json({ error: 'Error denying investment' });
  }
});

app.post('/cancel-investment', async (req, res) => {
  try {
    const { fisherman_email, investor_email } = req.body;

    if (!fisherman_email || !investor_email) {
      return res.status(400).json({ error: 'Missing fisherman_email or investor_email' });
    }

    const investmentRef = collection(db, 'investments');
    const q = query(investmentRef, where("fisherman_email", "==", fisherman_email), where("investor_email", "==", investor_email));
    const investmentSnapshot = await getDocs(q);

    if (investmentSnapshot.empty) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    const deletePromises = [];

    for (const doc of investmentSnapshot.docs) {
      const investment = doc.data();

      const mailOptions = {
        from: investment.fisherman_email,
        to: investment.investor_email,
        subject: 'Investment Cancelled',
        text: `Dear Fisherman,

The investment from fisherman ${investment.username} has been cancelled.

Details:
- Fisherman: ${investment.username}
- Location: ${investment.location}
- Target: ${investment.target}
- Cut: ${investment.cut}
- Status: Cancelled

Regards,
Your Investment Platform`,
      };

      const emailPromise = transporter.sendMail(mailOptions);
      deletePromises.push(emailPromise);
      deletePromises.push(deleteDoc(doc.ref));
    }

    await Promise.all(deletePromises);

    res.status(200).json({ message: 'Investment canceled and deleted from Firebase' });
  } catch (error) {
    console.error('Error canceling investment:', error);
    res.status(500).json({ error: 'Error canceling investment' });
  }
});

app.post('/accept-investment', async (req, res) => {
  try {
    const { fisherman_email, investor_email } = req.body;

    if (!fisherman_email || !investor_email) {
      return res.status(400).json({ error: 'Missing fisherman_email or investor_email' });
    }

    const investmentRef = collection(db, 'investments');
    const q = query(investmentRef, where("fisherman_email", "==", fisherman_email), where("investor_email", "==", investor_email));
    const investmentSnapshot = await getDocs(q);

    if (investmentSnapshot.empty) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    investmentSnapshot.forEach(async (doc) => {
      await updateDoc(doc.ref, { status: 'Accepted' });

      const investment = doc.data();
      const mailOptions = {
        from: investment.fisherman_email,
        to: investment.investor_email,
        subject: 'Investment Accepted',
        text: `Dear Investor,\n\nThe investment in the fisherman ${investment.username} has been accepted.
        \n\nDetails:
        \n- Fisherman: ${investment.username}
        \n- Location: ${investment.location}
        \n- Target: ${investment.target}
        \n- Cut: ${investment.cut}
        \n- Status: Accepted\n\nRegards,\nYour Investment Platform`,
      };

      await transporter.sendMail(mailOptions);
    });

    res.status(200).json({ message: 'Investment accepted and email sent to investor' });
  } catch (error) {
    console.error('Error accepting investment:', error);
    res.status(500).json({ error: 'Error accepting investment' });
  }
});


app.post('/logout', async (req, res) => {
  try {
    const loginRef = collection(db, 'login');
    const querySnapshot = await getDocs(loginRef);

    if (querySnapshot.empty) {
      return res.status(404).json({ error: 'No active login session found' });
    }

    const loginDoc = querySnapshot.docs[0];
    const email = loginDoc.data().email;

    if (!email) {
      return res.status(404).json({ error: 'No email found for the logged-in user' });
    }

    await deleteDoc(loginDoc.ref);

    res.json({ message: `Logged out successfully, user ${email}` });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ error: 'Error during logout' });
  }
});


app.get('/viewboard', async (req, res) => {
  try {
      const fishermenRef = collection(db, 'fishermen');
      const q = query(fishermenRef, where('role', '==', 'Fisherman'));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          return res.status(404).json({ message: 'No fishermen found' });
      }

      const fishermen = [];
      querySnapshot.forEach(doc => {
          const data = doc.data();
          fishermen.push({
            id: doc.id, 
            ...data,
          });
      });

      res.status(200).json(fishermen);
  } catch (error) {
      console.error("Error fetching fishermen:", error);
      res.status(500).json({ error: 'Error fetching fishermen data' });
  }
});


app.get("/search", async (req, res) => {
  const keyword = req.query.username || ''; 

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

app.post('/book-investment', async (req, res) => {
  const { username, location, target, email, investoremail, investorname, profit, cut, investmentDate, investorLocation } = req.body;
  if (!username || !location || !target || !email || !investorname || !profit|| !cut || !investmentDate) {
    return res.status(400).json({ error: 'Please provide all required fields including the investment date.' });
  }

  console.log('Received investment data:', req.body);

  try {
    const investmentRef = doc(collection(db, 'investments'));
    
    const newInvestment = {
      username: username,
      location: location,
      target: target,
      fisherman_email: email,
      inverstorname: investorname,
      investor_email: investoremail, 
      cut: cut,
      profit: profit,
      investmentDate: investmentDate,
      investorLocation: investorLocation || 'Unknown', 
      status: 'Pending',
    };

    await setDoc(investmentRef, newInvestment);

    const mailOptions = {
      from: '"LAKAYA"',
      to: [email, investoremail],
      subject: 'New Investment Booking',
      html: `
        <h3>New Investment Booking</h3>
        <p><strong>Investor Email:</strong> ${investoremail}</p>
        <p><strong>Target Amount:</strong> Php ${target}</p>
        <p><strong>Investment Date:</strong> ${investmentDate}</p>
        <p><strong>Investor's Location:</strong> ${investorLocation || 'Unknown'}</p> 
        <p><strong>Status: Pending </p>
        <p>The investment is now pending. Please review it!</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Investment booked successfully! Fisherman has been notified via email.',
    });
  } catch (error) {
    console.error('Error processing the investment or sending email:', error);
    res.status(500).json({ error: 'An error occurred while processing the investment.' });
  }
});


app.get('/get-nearby-fishermen', async (req, res) => {
  const { latitude, longitude } = req.query;
  const maxDistance = 500; 

  try {
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Please provide both latitude and longitude' });
    }

    const fishermenRef = collection(db, 'fishermen');
    const q = query(fishermenRef, where('role', '==', 'Fisherman'));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'No fishermen found' });
    }

    const nearbyFishermen = [];
    querySnapshot.forEach(doc => {
      const data = doc.data();
      const fishermanLocation = { latitude: data.latitude, longitude: data.longitude };

      const distance = haversine(
        { latitude: parseFloat(latitude), longitude: parseFloat(longitude) },
        fishermanLocation,
        { unit: 'km' }
      );

      if (distance <= maxDistance) {
        nearbyFishermen.push({
          id: doc.id,
          username: data.username,
          email: data.email,
          target: data.target,
          location: data.location,
          latitude: data.latitude,
          longitude: data.longitude,
          distance: distance.toFixed(2), 
        });
      }
    });

    if (nearbyFishermen.length === 0) {
      return res.status(404).json({ message: 'No fishermen found within 500 km' });
    }

    res.status(200).json(nearbyFishermen);
  } catch (error) {
    console.error('Error getting nearby fishermen:', error);
    res.status(500).json({ error: 'Error fetching nearby fishermen' });
  }
});


app.get('/location', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and Longitude are required.' });
  }

  try {
      const fishermenRef = collection(db, 'fishermen');
      const querySnapshot = await getDocs(fishermenRef);

      const fishermen = [];
      querySnapshot.forEach(doc => {
          const data = doc.data();
          fishermen.push({
              id: doc.id,
              username: data.username,
              latitude: data.latitude,
              longitude: data.longitude,
          });
      });
      const userLocation = { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      const nearbyFishermen = fishermen.filter(fisherman => {
          const fishermanLocation = {
              latitude: fisherman.latitude,
              longitude: fisherman.longitude
          };
          const distance = haversine(userLocation, fishermanLocation, { unit: 'km' });
          return distance <= 500; 
      });

      res.json({ fishermen: nearbyFishermen });
  } catch (error) {
      console.error('Error fetching fishermen:', error);
      res.status(500).json({ error: 'Error fetching fishermen data' });
  }
});

app.post('/submit-feedback', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const feedbackData = {
      name,
      message,
    };

    const newFeedbackRef = doc(collection(db, 'feedback'), email);
    
    await setDoc(newFeedbackRef, feedbackData);

    res.status(200).json({ message: 'Feedback submitted successfully.' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'An error occurred while submitting your feedback.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port at http://localhost:${port}`);
});