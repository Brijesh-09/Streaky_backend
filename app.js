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

//cronjob based on yesterday(ds)
cron.schedule("30 11 * * *", async () => {
  try {
    console.log("Running the streak update job...");

    // Calculate yesterday's start and end times
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setDate(now.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0); // Start of yesterday (midnight)

    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setDate(yesterdayStart.getDate() + 1);
    yesterdayEnd.setMilliseconds(-1); // End of yesterday (23:59:59.999)

    // Fetch all todos
    const todos = await Todo.find({});

    for (const todo of todos) {
      let contributedYesterday = false;

      // Check if any contribution was made yesterday
      if (todo.contributions && todo.contributions.length > 0) {
        contributedYesterday = todo.contributions.some((contribution) => {
          const contribDate = new Date(contribution.date);
          return contribDate >= yesterdayStart && contribDate <= yesterdayEnd;
        });
      }

      // Update streak based on yesterday's contribution
      if (contributedYesterday) {
        todo.streak += 1;
        await todo.save();
        console.log(`Streak incremented for todo: ${todo._id}`);
      } else {
        // Only reset if the streak wasn't already 0
        if (todo.streak !== 0) {
          todo.streak = 0;
          await todo.save();
          console.log(`Streak reset for todo: ${todo._id}`);
        }
      }
    }
  } catch (error) {
    console.error("Error running the streak update job:", error);
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
