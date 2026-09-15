const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const DB_PATH = './scr/users.json';

// function to read users from the JSON file
const readUsers = () => {
    if (!fs.existsSync(DB_PATH)) {
        return [];
    }
    const data = fs.readFileSync(DB_PATH);
    return JSON.parse(data || []);
};

// function to save users to the JSON file
const saveUsers = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// registration route (signup)
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = readUsers();
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: 'Username already exists' });
    }

    // hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);

    // create a new user object
    const newUser = {
        username,
        password: hashedPassword
    };

    // add the new user to the users array
    users.push(newUser);

    // save the updated users array to the JSON file
    saveUsers(users);

    res.status(201).json({ message: 'User registered successfully' });
});

// login route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    const users = readUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // compare the provided password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.json({ message: 'Login successful' });
});