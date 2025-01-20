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
        const { contribution } = req.body; // Extract contribution from request body
        const { todoId } = req.params; // Get Todo ID from route parameters

        if (!contribution) {
            return res.status(400).json({ message: "Contribution is required" });
        }

        // Ensure contribution is a string
        if (typeof contribution !== 'string') {
            return res.status(400).json({ message: "Contribution must be a string" });
        }

        // Find the Todo by its ID
        const todo = await Todo.findById(todoId);

        if (!todo) {
            return res.status(404).json({ message: "Todo not found" });
        }

        // Add the new contribution with a timestamp to the contributions array
        todo.contributions.push({
            contribution: contribution, // Store contribution text as a string
            date: new Date() // Add the current timestamp
        });

        // Increment streak
        todo.streak += 1;

        // Save the updated Todo
        await todo.save();

        // Send the success response
        res.status(200).json({
            message: 'Contribution added successfully',
            todo: todo
        });

    } catch (err) {
        console.error(err);
        // Ensure we only send a response in case of errors
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server error' });
        }
    }
});


module.exports = router;
