// NOTE: Make sure to create a .env file with PORT and MONGO_URI variables
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const analyzeRoutes = require('./routes/analyzeRoutes');



// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: "*",
    credentials: false
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/analyze', analyzeRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Server is healthy' });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
