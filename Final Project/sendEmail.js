const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 3000; // port is adjustable

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: "nheileduria6@gmail.com", //this is fixed
    pass: "fbzkhjxrewdfncsm",
  },
  tls: {
    rejectUnauthorized: true,
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/ '); // html for getting the email address
});

app.post('/send-email', async (req, res) => {
  const recipient = req.body.recipient; // the receiver of email
  const subject = req.body.subject; // the subject of email

  // the content on email
  const htmlContent = ` 
    <html>
      <body>
        <h3>Message Information</h3>
        <p><strong>Subject:</strong> ${subject}</p> 
        <br>
        <p><b>Hello, We are LAKAYA</b></p>
      </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: '"LAKAYA" <nheileduria6@gmail.com>', // this email is fixed
      to: recipient,
      subject: subject,
      html: htmlContent,
    });

    res.send("Message sent.");
  } catch (error) {
    res.send("Error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`); // localhost
});
