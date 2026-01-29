const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database file
const db = new sqlite3.Database(
  path.join(__dirname, 'orders.db'),
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
      process.exit(1);
    }
    
    console.log('Connected to SQLite');
    
    // Create orders table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_name TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        date_created TEXT NOT NULL
      )
    `;
    
    db.run(createTableQuery, (err) => {
      if (err) {
        console.error('Error creating orders table:', err.message);
      } else {
        console.log('Orders table ready');
      }
    });
  }
);

// Export the database connection
module.exports = db;
