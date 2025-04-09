const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// In-memory store of linked devices (use DB in real apps)
const linkedDevices = {};

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// File storage setup
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Generate random 6-letter code
function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Link a device with a phone number
app.post('/link-device', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const code = generateCode();
  linkedDevices[code] = phone;
  res.json({ code });
});

// Upload a profile picture only if code matches phone
app.post('/upload', upload.single('image'), (req, res) => {
  const { code, phone } = req.body;

  if (!linkedDevices[code] || linkedDevices[code] !== phone) {
    return res.status(403).json({ error: 'Unauthorized: Code and number mismatch' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  res.json({ success: true, filePath });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
