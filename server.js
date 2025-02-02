const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Store polygon data in-memory
const polygonData = {};

// Root route - Serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the customer-facing page
app.get('/customer', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customer.html'));
});

// POST: Add or Update Data for a Polygon
app.post('/api/data', (req, res) => {
  const { polygonId, currentDate, rtlOperating, rtlCancelled, cfnOperating, cfnCancelled, rtlOperatingRoutes, rtlCancelledRoutes, cfnOperatingRoutes, cfnCancelledRoutes } = req.body;

  // Validate required fields
  if (!polygonId || !currentDate || rtlOperating == null || rtlCancelled == null || cfnOperating == null || cfnCancelled == null) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Ensure polygonId is a valid identifier
  if (typeof polygonId !== 'string' && typeof polygonId !== 'number') {
    return res.status(400).json({ error: 'Invalid polygon ID. Must be a string or number.' });
  }

  // Overwrite the existing data for the polygon
  polygonData[polygonId] = [{
    date: currentDate,
    rtlOperating: parseInt(rtlOperating, 10),
    rtlCancelled: parseInt(rtlCancelled, 10),
    cfnOperating: parseInt(cfnOperating, 10),
    cfnCancelled: parseInt(cfnCancelled, 10),
    rtlOperatingRoutes: rtlOperatingRoutes || 'N/A', // Text area data
    rtlCancelledRoutes: rtlCancelledRoutes || 'N/A', // Text area data
    cfnOperatingRoutes: cfnOperatingRoutes || 'N/A', // Text area data
    cfnCancelledRoutes: cfnCancelledRoutes || 'N/A', // Text area data
  }];

  console.log(`Data for polygonId: ${polygonId} updated: `, polygonData[polygonId]); // Log the updated data

  res.status(201).json({ message: 'Data added successfully.' });
});

// GET: Retrieve Data for a Polygon
app.get('/api/data/:polygonId', (req, res) => {
  const { polygonId } = req.params;

  if (!polygonData[polygonId] || polygonData[polygonId].length === 0) {
    return res.status(404).json({ error: 'Polygon data not found.' });
  }

  res.status(200).json(polygonData[polygonId]);
});

// GET: Retrieve All Polygon Data
app.get('/api/data', (req, res) => {
  res.status(200).json(polygonData);
});

// 404 Handler for Undefined Routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});