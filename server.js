require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Ensure data folder exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const contactsCSV = path.join(dataDir, 'contacts.csv');
const subsCSV = path.join(dataDir, 'subscribers.csv');
if (!fs.existsSync(contactsCSV)) fs.writeFileSync(contactsCSV, 'timestamp,name,email,phone,message\n');
if (!fs.existsSync(subsCSV)) fs.writeFileSync(subsCSV, 'timestamp,email\n');

function appendCSV(filePath, row) {
  fs.appendFile(filePath, row + '\n', err => {
    if (err) console.error('Error writing CSV:', err);
  });
}

// Homepage - email collector
app.get('/', (req, res) => {
  res.render('index', { siteTitle: 'Editkaro.in' });
});

// Portfolio
app.get('/portfolio', (req, res) => {
  // sample portfolio categories and items — replace with real video links/embeds
  const categories = [
    { name: 'Short Form', items: [{ title: 'Sample Short 1', thumb: '/public/assets/placeholder.jpg', url: '#' }] },
    { name: 'Long Form', items: [{ title: 'Sample Long 1', thumb: '/public/assets/placeholder.jpg', url: '#' }] },
    { name: 'Gaming', items: [{ title: 'Sample Game Edit', thumb: '/public/assets/placeholder.jpg', url: '#' }] },
    { name: 'Color Grading', items: [{ title: 'Color Grading Demo', thumb: '/public/assets/placeholder.jpg', url: '#' }] }
  ];
  res.render('portfolio', { categories });
});

// About
app.get('/about', (req, res) => {
  res.render('about');
});

// Contact page
app.get('/contact', (req, res) => {
  res.render('contact');
});

// Subscribe endpoint (email collector on homepage)
app.post('/subscribe', (req, res) => {
  const { email } = req.body;
  const ts = new Date().toISOString();
  appendCSV(subsCSV, `${ts},${email}`);

  res.json({ success: true });
});

// Contact form submit
app.post('/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  const ts = new Date().toISOString();
  appendCSV(contactsCSV, `${ts},"${name}","${email}","${phone}","${message.replace(/"/g, '""')}"`);

  // optional: send notification email
  if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      transporter.sendMail({
        from: `"Editkaro Site" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL,
        subject: `New contact from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`
      }).catch(err => {
        console.warn('Failed to send notification email:', err.message);
      });
    } catch (err) {
      console.warn('Failed to send notification email:', err.message);
    }
  }

  res.json({ success: true });
});

// Simple health
app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
