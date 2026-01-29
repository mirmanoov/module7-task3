const request = require('supertest');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a test database
let db;
let app;

beforeAll((done) => {
  // Create an in-memory database for testing
  db = new sqlite3.Database(':memory:', (err) => {
    if (err) {
      console.error('Error creating test database:', err);
      done(err);
      return;
    }

    // Create orders table
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
        console.error('Error creating table:', err);
        done(err);
        return;
      }

      // Seed test data - 20 orders with various statuses and amounts
      const insertQuery = `
        INSERT INTO orders (item_name, amount, status, date_created)
        VALUES (?, ?, ?, ?)
      `;

      const testOrders = [
        ['Laptop', 999.99, 'pending', '2026-01-01T10:00:00.000Z'],
        ['Mouse', 25.50, 'shipped', '2026-01-02T10:00:00.000Z'],
        ['Keyboard', 75.00, 'delivered', '2026-01-03T10:00:00.000Z'],
        ['Monitor', 350.00, 'pending', '2026-01-04T10:00:00.000Z'],
        ['Headphones', 150.00, 'shipped', '2026-01-05T10:00:00.000Z'],
        ['Webcam', 80.00, 'delivered', '2026-01-06T10:00:00.000Z'],
        ['USB Cable', 15.00, 'pending', '2026-01-07T10:00:00.000Z'],
        ['Desk Lamp', 45.00, 'shipped', '2026-01-08T10:00:00.000Z'],
        ['Phone Stand', 20.00, 'delivered', '2026-01-09T10:00:00.000Z'],
        ['Tablet', 500.00, 'pending', '2026-01-10T10:00:00.000Z'],
        ['Charger', 30.00, 'shipped', '2026-01-11T10:00:00.000Z'],
        ['Speaker', 120.00, 'delivered', '2026-01-12T10:00:00.000Z'],
        ['Router', 90.00, 'pending', '2026-01-13T10:00:00.000Z'],
        ['SSD Drive', 200.00, 'shipped', '2026-01-14T10:00:00.000Z'],
        ['RAM Module', 180.00, 'delivered', '2026-01-15T10:00:00.000Z'],
        ['Graphics Card', 800.00, 'pending', '2026-01-16T10:00:00.000Z'],
        ['Cooling Fan', 40.00, 'shipped', '2026-01-17T10:00:00.000Z'],
        ['Power Supply', 110.00, 'delivered', '2026-01-18T10:00:00.000Z'],
        ['Case', 85.00, 'pending', '2026-01-19T10:00:00.000Z'],
        ['Motherboard', 250.00, 'shipped', '2026-01-20T10:00:00.000Z']
      ];

      let completed = 0;
      testOrders.forEach((order) => {
        db.run(insertQuery, order, (err) => {
          if (err) {
            console.error('Error inserting test data:', err);
            done(err);
            return;
          }
          completed++;
          if (completed === testOrders.length) {
            // Override the database module for testing
            require.cache[require.resolve('./database')] = {
              exports: db
            };
            
            // Load the app after database is ready
            app = require('./server');
            done();
          }
        });
      });
    });
  });
});

afterAll((done) => {
  // Close database connection
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      }
      done();
    });
  } else {
    done();
  }
});

describe('POST /orders', () => {
  test('Should create a new order successfully (201 status)', async () => {
    const newOrder = {
      item_name: 'Test Product',
      amount: 99.99,
      status: 'pending'
    };

    const response = await request(app)
      .post('/orders')
      .send(newOrder)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Order created successfully');
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.item_name).toBe(newOrder.item_name);
    expect(response.body.data.amount).toBe(newOrder.amount);
    expect(response.body.data.status).toBe(newOrder.status);
  });

  test('Should fail if item_name is missing (400 status)', async () => {
    const invalidOrder = {
      amount: 50.00,
      status: 'pending'
    };

    const response = await request(app)
      .post('/orders')
      .send(invalidOrder)
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });

  test('Should fail if amount is missing (400 status)', async () => {
    const invalidOrder = {
      item_name: 'Test Item',
      status: 'pending'
    };

    const response = await request(app)
      .post('/orders')
      .send(invalidOrder)
      .expect(400);

    expect(response.body.error).toBe('Missing required fields');
  });

  test('Should fail if amount is negative (400 status)', async () => {
    const invalidOrder = {
      item_name: 'Test Item',
      amount: -10,
      status: 'pending'
    };

    const response = await request(app)
      .post('/orders')
      .send(invalidOrder)
      .expect(400);

    expect(response.body.error).toBe('Invalid amount');
  });

  test('Should fail if amount is zero (400 status)', async () => {
    const invalidOrder = {
      item_name: 'Test Item',
      amount: 0,
      status: 'pending'
    };

    const response = await request(app)
      .post('/orders')
      .send(invalidOrder)
      .expect(400);

    expect(response.body.error).toBe('Invalid amount');
  });

  test('Should fail with invalid status (400 status)', async () => {
    const invalidOrder = {
      item_name: 'Test Item',
      amount: 50.00,
      status: 'invalid_status'
    };

    const response = await request(app)
      .post('/orders')
      .send(invalidOrder)
      .expect(400);

    expect(response.body.error).toBe('Invalid status');
  });
});

describe('GET /orders - Pagination', () => {
  test('Should return 10 orders by default', async () => {
    const response = await request(app)
      .get('/orders')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(10);
    expect(response.body.pagination.limit).toBe(10);
    expect(response.body.pagination.page).toBe(1);
  });

  test('Should return 5 orders when limit=5', async () => {
    const response = await request(app)
      .get('/orders?limit=5')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.pagination.limit).toBe(5);
  });

  test('Should return the correct page 2 results', async () => {
    const response = await request(app)
      .get('/orders?page=2&limit=5')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(5);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.hasPrevPage).toBe(true);
    
    // Verify that page 2 has different IDs than page 1
    expect(response.body.data[0].id).toBeGreaterThan(5);
  });

  test('Should handle page 999 gracefully (empty array, not error)', async () => {
    const response = await request(app)
      .get('/orders?page=999')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.pagination.page).toBe(999);
  });
});

describe('GET /orders - Filtering', () => {
  test('Should filter by status=pending', async () => {
    const response = await request(app)
      .get('/orders?status=pending')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verify all returned orders have pending status
    response.body.data.forEach(order => {
      expect(order.status).toBe('pending');
    });
  });

  test('Should filter by status=shipped', async () => {
    const response = await request(app)
      .get('/orders?status=shipped')
      .expect(200);

    expect(response.body.success).toBe(true);
    
    // Verify all returned orders have shipped status
    response.body.data.forEach(order => {
      expect(order.status).toBe('shipped');
    });
  });

  test('Should filter by min_amount and max_amount', async () => {
    const response = await request(app)
      .get('/orders?min_amount=50&max_amount=200')
      .expect(200);

    expect(response.body.success).toBe(true);
    
    // Verify all returned orders are within the amount range
    response.body.data.forEach(order => {
      expect(order.amount).toBeGreaterThanOrEqual(50);
      expect(order.amount).toBeLessThanOrEqual(200);
    });
  });

  test('Should return empty list if no orders match filters', async () => {
    const response = await request(app)
      .get('/orders?min_amount=10000&max_amount=20000')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.pagination.totalRecords).toBe(0);
  });

  test('Should combine multiple filters (status + amount range)', async () => {
    const response = await request(app)
      .get('/orders?status=pending&min_amount=100&max_amount=500')
      .expect(200);

    expect(response.body.success).toBe(true);
    
    // Verify all returned orders match both filters
    response.body.data.forEach(order => {
      expect(order.status).toBe('pending');
      expect(order.amount).toBeGreaterThanOrEqual(100);
      expect(order.amount).toBeLessThanOrEqual(500);
    });
  });
});

describe('GET /orders - Edge Cases', () => {
  test('Should handle invalid page parameter gracefully', async () => {
    const response = await request(app)
      .get('/orders?page=abc')
      .expect(200);

    expect(response.body.success).toBe(true);
    // Should default to page 1
    expect(response.body.pagination.page).toBe(1);
  });

  test('Should handle invalid limit parameter gracefully', async () => {
    const response = await request(app)
      .get('/orders?limit=xyz')
      .expect(200);

    expect(response.body.success).toBe(true);
    // Should default to limit 10
    expect(response.body.pagination.limit).toBe(10);
  });
});

describe('GET /orders - Date Filtering', () => {
  test('Should filter by date range', async () => {
    // Test data includes orders from 2026-01-01 to 2026-01-20
    const response = await request(app)
      .get('/orders?start_date=2026-01-10&end_date=2026-01-15')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // Verify all returned orders are within the date range
    response.body.data.forEach(order => {
      const orderDate = new Date(order.date_created);
      const startDate = new Date('2026-01-10');
      const endDate = new Date('2026-01-15');
      
      expect(orderDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
      expect(orderDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });
  });

  test('Should return empty if no orders in date range', async () => {
    // Query for dates far in the future where no orders exist
    const response = await request(app)
      .get('/orders?start_date=2027-01-01&end_date=2027-12-31')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.pagination.totalRecords).toBe(0);
  });

  test('Should filter by start_date only', async () => {
    const response = await request(app)
      .get('/orders?start_date=2026-01-15')
      .expect(200);

    expect(response.body.success).toBe(true);
    
    // Verify all returned orders are on or after start_date
    response.body.data.forEach(order => {
      const orderDate = new Date(order.date_created);
      const startDate = new Date('2026-01-15');
      
      expect(orderDate.getTime()).toBeGreaterThanOrEqual(startDate.getTime());
    });
  });

  test('Should filter by end_date only', async () => {
    const response = await request(app)
      .get('/orders?end_date=2026-01-10')
      .expect(200);

    expect(response.body.success).toBe(true);
    
    // Verify all returned orders are on or before end_date
    response.body.data.forEach(order => {
      const orderDate = new Date(order.date_created);
      const endDate = new Date('2026-01-10');
      
      expect(orderDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
    });
  });
});
