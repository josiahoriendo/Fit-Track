const sqlite = require('sqlite3').verbose();
const path = require('path');

// Connect to the SQLite database
const db = new sqlite.Database(path.resolve(__dirname, 'mydatabase.db'), (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Enable foreign key constraints
db.exec('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
        console.error('Error enabling foreign keys:', err.message);
    } else {
        console.log('Foreign key constraint enabled');
    }
});

// SQL to create tables
const createTables = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        duration INTEGER NOT NULL,
        date TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        food TEXT NOT NULL,
        meal TEXT NOT NULL CHECK (meal IN ('breakfast', 'lunch', 'dinner', 'snack')),
        calories INTEGER NOT NULL,
        protein INTEGER DEFAULT 0,
        carbs INTEGER DEFAULT 0,
        fat INTEGER DEFAULT 0,
        date TEXT NOT NULL,
        user_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );
`;

// Execute the SQL to create tables
db.exec(createTables, (err) => {
    if (err) {
        console.error('Error creating tables:', err.message);
    } else {
        console.log('Tables created successfully');
    }
});

// Export the database instance for use in other files
module.exports = db;
