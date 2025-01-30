const express = require('express');
const authenticateToken = require('./protected');
const router = express.Router();
const Todo = require('../models/Todo');
const User = require('../models/User');


// Protected route: Get user info (Me)
router.get('/me', authenticateToken, (req, res) => {
    res.status(200).json({ message: `Welcome, ${req.user.username}!` });
});

// Protected route: Add a new Todo task
router.post('/add', authenticateToken, async (req, res) => {
    try {
        const { taskName } = req.body;  // Use taskName instead of todoname

        if (!taskName) {
            return res.status(400).json({ message: "Task name is required" });
        }

        const username = req.user.username; // Extract username from JWT payload
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Create a new Todo object
        const newTodo = new Todo({
            taskName: taskName,  // Use taskName in the object creation
            streak: 0,
            addedDate: new Date(),
            contributions: [],
            user: user._id
        });

        await newTodo.save(); // Save the new Todo to the database

        res.status(201).json({ message: 'Todo added successfully', todo: newTodo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/addContribution/:todoId', authenticateToken, async (req, res) => {
    try {
        const { contribution } = req.body;
        const { todoId } = req.params;

        if (!contribution) {
            return res.status(400).json({ message: "Contribution is required" });
        }

        if (typeof contribution !== 'string') {
            return res.status(400).json({ message: "Contribution must be a string" });
        }

        const todo = await Todo.findById(todoId);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        const now = new Date();

        // Add the new contribution
        todo.contributions.push({
            contribution: contribution,
            date: now,
        });

        const contributionsLength = todo.contributions.length;

        if (todo.streak === 0) {
            // If the streak was reset, start the streak for the first contribution after reset
            todo.streak = 1;
        } else if (contributionsLength > 1) {
            // Compare n and n-1 contributions for streak calculations
            const lastContributionTime = new Date(todo.contributions[contributionsLength - 1].date);
            const secondLastContributionTime = new Date(todo.contributions[contributionsLength - 2].date);
        
            const timeDifference = (lastContributionTime - secondLastContributionTime) / (1000 * 60 * 60); // Difference in hours
        
            // Increment streak if the time difference is between 23 and 24 hours
            if (timeDifference >= 24 && timeDifference < 48) {
                todo.streak += 1;
            }
        }

        await todo.save();

        res.status(200).json({
            message: 'Contribution added successfully',
            todo: todo,
        });
    } catch (err) {
        console.error(err);
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error' });
        }
    }
});

router.get('/getmy', authenticateToken, async (req, res) => {
    try {
        // Extract user ID from the authenticated token
        const userId = req.user.id; // Ensure `req.user` contains the user's ID from the token
        
        // Fetch all todos belonging to the authenticated user
        const gettodos = await Todo.find({ user: userId });

        // Check if the user has any todos
        if (!gettodos || gettodos.length === 0) {
            return res.status(404).json({ message: "No todos found for this user" });
        }

        // Return the todos for the user
        res.status(200).json({
            message: "User's todos fetched successfully",
            todos: gettodos,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});


router.delete('/del/:todoId', authenticateToken, async (req, res) => {
    try {
        const { todoId } = req.params;

        if (!todoId) {
            return res.status(400).json({ message: "Todo ID is required" });
        }

        // Find and delete the todo by ID
        const deletedTodo = await Todo.findByIdAndDelete(todoId);

        if (!deletedTodo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        res.status(200).json({ message: "Todo deleted successfully", todo: deletedTodo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
