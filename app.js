require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const todoRoutes = require('./routes/todos')

app.use('/auth', authRoutes);
app.use('/protected', protectedRoutes);
app.use('/todo' , todoRoutes)

// MongoDB Connection
const connectToDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1); 
    }
};

connectToDatabase();
// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
