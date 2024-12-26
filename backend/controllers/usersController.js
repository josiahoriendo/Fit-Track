const db = require("../db");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const registerUser = async (req, res) => {
    const { user, pass } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(pass, 10);

        db.run(
            'INSERT INTO users (username, password) VALUES (?, ?)',
            [user, hashedPassword],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint')) {
                        res.status(400).json({ error: 'Username already exists' });
                    } else {
                        res.status(500).json({ error: 'Database error' });
                    }
                    return;
                }
                res.status(201).json({ id: this.lastID, username: user });
            }
        );
    } catch (err) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

const loginUser = (req, res) => {
    const { username, pass } = req.body;

    db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        async (err, user) => {
            if (err) {
                res.status(500).json({ error: "Database error" });
                return;
            }
            if (!user) {
                res.status(401).json({ error: "Invalid username or password" });
                return;
            }
            try {
                const isMatch = await bcrypt.compare(pass, user.password);
                if (!isMatch) {
                    res.status(401).json({ error: 'Invalid username or password' });
                    return;
                }

                // Generate a token
                const token = jwt.sign({ id: user.id, username: user.username }, 'your-secret-key', { expiresIn: '1h' });
                res.json({ message: 'Login successful', token });
            } catch (err) {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    );
};

module.exports = {
    registerUser,
    loginUser,
};
