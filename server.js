const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Store device-code to number mapping (use DB in production)
const linkedDevices = {};

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// File storage setup
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Route to link device with number
app.post('/link-device', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number required' });

  const code = generateCode();
  linkedDevices[code] = phone;
  res.json({ code });
});

// Route to upload DP (with verification)
app.post('/upload', upload.single('image'), (req, res) => {
  const { code, phone } = req.body;

  if (!linkedDevices[code] || linkedDevices[code] !== phone) {
    return res.status(403).json({ error: 'Unauthorized: Code and number mismatch' });
  }

  const filePath = `/uploads/${req.file.filename}`;
  res.json({ success: true, filePath });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
