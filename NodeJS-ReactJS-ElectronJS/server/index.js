const express = require('express');
const app = express();
const http = require('http').createServer(app);
const SSE = require('express-sse');
const cors = require('cors');
const bodyParser = require('body-parser'); // Import the body-parser middleware
app.use(cors());

// Use the body-parser middleware to parse JSON requests
app.use(bodyParser.json());

// Create an instance of SSE
const sse = new SSE();

// Configure SSE endpoint
app.get('/sse', (req, res, next) => {
    res.flush = () => {}; 
    next();
  }, sse.init);

// Handle messages from the ESP32
app.post('/send-message', (req, res) => {
  const message = req.body.id; // Assuming the ESP32 sends the message in the request body
  sse.send(message); // Send the received message to connected SSE clients
  res.sendStatus(200);
  console.log('Status OK');
});

http.listen(5000, () => {
  console.log('Server is listening on port 5000');
});
