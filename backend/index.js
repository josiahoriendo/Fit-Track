const express = require('express');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(bodyParser.json()); // Parse JSON request bodies

// Routes
app.use('/api/users', userRoutes); // Mount user-related routes

// Start the server
const PORT = process.env.PORT || 5001; // Use port 5001
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
