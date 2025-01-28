require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const cron = require("node-cron");
const Todo = require("./models/Todo")

const app = express();

// Middleware
app.use(express.json());
app.use(cors())

//cronjob
cron.schedule("30 5 * * *", async () => {
  try {
    console.log("Running the streak reset job...");

    // Fetch all todos
    const todos = await Todo.find({});

    for (const todo of todos) {
      if (todo.contributions && todo.contributions.length >= 2) {
        // Get the last two contributions' timestamps
        const lastContribution = new Date(todo.contributions[todo.contributions.length - 1]);
        const secondLastContribution = new Date(todo.contributions[todo.contributions.length - 2]);

        // Calculate the difference in hours
        const diffInHours = Math.abs((lastContribution - secondLastContribution) / (1000 * 60 * 60));

        if (diffInHours > 48) {
          // Reset the streak to 0 if the difference is greater than 24 hours
          todo.streak = 0;
          await todo.save();
          console.log(`Streak reset for todo: ${todo._id}`);
        }
      } else if (todo.contributions && todo.contributions.length === 1) {
        // Handle case with only one contribution
        const lastContribution = new Date(todo.contributions[0]);

        // Calculate the difference from the current time
        const diffFromNowInHours = Math.abs((Date.now() - lastContribution) / (1000 * 60 * 60));

        if (diffFromNowInHours > 24) {
          // Reset the streak to 0 if the last contribution was more than 24 hours ago
          todo.streak = 0;
          await todo.save();
          console.log(`Streak reset for todo with only one contribution: ${todo._id}`);
        }
      } else {
        // Handle case where there are no contributions
        if (todo.streak !== 0) {
          todo.streak = 0;
          await todo.save();
          console.log(`Streak reset for todo with no contributions: ${todo._id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error running the streak reset job:", error);
  }
});

  




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
