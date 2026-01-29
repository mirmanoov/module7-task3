const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. Setup Database Connection
const dbPath = path.resolve(__dirname, 'orders.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// 2. Data Generators
const statuses = ['pending', 'shipped', 'delivered', 'cancelled'];
const items = ['Wireless Mouse', 'Gaming Keyboard', 'USB-C Cable', 'Monitor Stand', 'Webcam', 'Headphones'];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 3. Main Seeding Logic
db.serialize(() => {
  // Drop table if exists to ensure a clean slate for testing
  // (Optional: remove if you want to keep data)
  db.run('DROP TABLE IF EXISTS orders');

  // Re-create the table
  db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            item_name TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT NOT NULL,
            date_created TEXT NOT NULL
        )
    `);

  console.log('Table "orders" created/reset.');

  // Prepare statement for bulk insertion (Performance Best Practice)
  const stmt = db.prepare('INSERT INTO orders (item_name, amount, status, date_created) VALUES (?, ?, ?, ?)');

  console.log('Seeding 50 orders...');

  for (let i = 0; i < 50; i += 1) {
    const item = getRandomElement(items);
    // Generate amount between $10 and $500
    const amount = parseFloat((Math.random() * (500 - 10) + 10).toFixed(2));
    const status = getRandomElement(statuses);

    // Generate a date within the last 30 days
    const date = new Date();
    date.setDate(date.getDate() - getRandomInt(0, 30));
    const dateStr = date.toISOString();

    stmt.run(item, amount, status, dateStr);
  }

  stmt.finalize();
  console.log('Seeding complete. 50 orders inserted.');
});

// 4. Close Connection
db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Database connection closed.');
});
