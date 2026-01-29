const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const rateLimit = require('express-rate-limit');
const { Parser } = require('json2csv');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the 100 requests in 15 minutes limit!',
    retryAfter: '15 minutes',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Orders Management API',
      version: '1.0.0',
      description: 'A REST API for managing orders with pagination and filtering support',
      contact: {
        name: 'API Support',
        email: 'support@ordersapi.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Orders',
        description: 'Order management endpoints',
      },
    ],
  },
  apis: ['./server.js'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to all routes
app.use('/orders', limiter);

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Retrieve a list of orders
 *     description: Get orders with pagination and optional filtering by status and amount range
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled]
 *         description: Filter by order status
 *       - in: query
 *         name: min_amount
 *         schema:
 *           type: number
 *         description: Minimum order amount (inclusive)
 *       - in: query
 *         name: max_amount
 *         schema:
 *           type: number
 *         description: Maximum order amount (inclusive)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders created on or after this date (YYYY-MM-DD format)
 *         example: "2026-01-01"
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter orders created on or before this date (YYYY-MM-DD format)
 *         example: "2026-01-31"
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, date_created, amount, status, item_name]
 *           default: date_created
 *         description: Field to sort results by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Sort order (ascending or descending)
 *     responses:
 *       200:
 *         description: Successfully retrieved orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       item_name:
 *                         type: string
 *                         example: "Wireless Mouse"
 *                       amount:
 *                         type: number
 *                         example: 415.14
 *                       status:
 *                         type: string
 *                         example: "pending"
 *                       date_created:
 *                         type: string
 *                         format: date-time
 *                         example: "2026-01-14T05:08:44.152Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalRecords:
 *                       type: integer
 *                       example: 50
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 details:
 *                   type: string
 *                   example: "Connection failed"
 */
// GET /orders - Retrieve orders with pagination and filtering
app.get('/orders', (req, res) => {
  // Extract and validate query parameters
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  let limit = parseInt(req.query.limit, 10) || 10;

  // SECURITY: Enforce maximum limit of 100
  if (limit > 100) {
    limit = 100;
  }

  // Ensure limit is at least 1
  limit = Math.max(1, limit);

  const { status } = req.query;
  const minAmount = parseFloat(req.query.min_amount);
  const maxAmount = parseFloat(req.query.max_amount);
  const startDate = req.query.start_date;
  const endDate = req.query.end_date;
  const sortBy = req.query.sort_by || 'date_created';
  const order = req.query.order === 'desc' ? 'DESC' : 'ASC';

  // SECURITY: Validate sort_by to prevent SQL injection (whitelist approach)
  const allowedSortFields = ['id', 'date_created', 'amount', 'status', 'item_name'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'date_created';

  // Calculate offset for pagination
  const offset = (page - 1) * limit;

  // SECURITY: Build dynamic WHERE clause using parameterized queries
  // All user inputs are passed as parameters, NOT concatenated into SQL
  const conditions = [];
  const params = [];

  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  if (!Number.isNaN(minAmount)) {
    conditions.push('amount >= ?');
    params.push(minAmount);
  }

  if (!Number.isNaN(maxAmount)) {
    conditions.push('amount <= ?');
    params.push(maxAmount);
  }

  if (startDate) {
    conditions.push('date(date_created) >= date(?)');
    params.push(startDate);
  }

  if (endDate) {
    conditions.push('date(date_created) <= date(?)');
    params.push(endDate);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  // PERFORMANCE: Query to get total count efficiently
  // COUNT(*) is optimized by SQLite and doesn't load actual row data
  const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;

  db.get(countQuery, params, (countErr, countResult) => {
    if (countErr) {
      return res.status(500).json({ error: 'Database error', details: countErr.message });
    }

    const totalRecords = countResult.total;
    const totalPages = Math.ceil(totalRecords / limit);

    // SECURITY: Query to get paginated data with sorting
    // sortField is validated against whitelist, order is hardcoded to DESC/ASC
    // All other values are parameterized
    const dataQuery = `
      SELECT id, item_name, amount, status, date_created 
      FROM orders 
      ${whereClause}
      ORDER BY ${sortField} ${order}
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, limit, offset];

    db.all(dataQuery, dataParams, (dataErr, rows) => {
      if (dataErr) {
        return res.status(500).json({ error: 'Database error', details: dataErr.message });
      }

      res.json({
        success: true,
        data: rows,
        pagination: {
          page,
          limit,
          totalRecords,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    });
  });
});

/**
 * @swagger
 * /orders/export:
 *   get:
 *     summary: Export all orders
 *     description: Export all orders in JSON or CSV format
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *         description: Export format (json or csv)
 *         example: "csv"
 *     responses:
 *       200:
 *         description: Successfully exported orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *           text/csv:
 *             schema:
 *               type: string
 *       400:
 *         description: Invalid format parameter
 *       500:
 *         description: Database error
 */
// GET /orders/export - Export orders data
app.get('/orders/export', (req, res) => {
  const { format } = req.query;

  // Validate format parameter
  if (!format || !['json', 'csv'].includes(format)) {
    return res.status(400).json({
      error: 'Invalid format',
      message: 'Format must be either "json" or "csv"',
    });
  }

  // Fetch all orders from database
  const query = 'SELECT id, item_name, amount, status, date_created FROM orders ORDER BY id ASC';

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (format === 'json') {
      // JSON export with pretty printing
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.json');
      res.send(JSON.stringify(rows, null, 2)); // Pretty print with 2-space indentation
    } else if (format === 'csv') {
      // CSV export
      try {
        const fields = ['id', 'item_name', 'amount', 'status', 'date_created'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(rows);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
        res.send(csv);
      } catch (error) {
        return res.status(500).json({
          error: 'CSV conversion error',
          details: error.message,
        });
      }
    }
  });
});

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Create a new order
 *     description: Add a new order to the database with validation
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_name
 *               - amount
 *               - status
 *             properties:
 *               item_name:
 *                 type: string
 *                 description: Name of the item being ordered
 *                 example: "Laptop"
 *               amount:
 *                 type: number
 *                 description: Price of the order (must be greater than 0)
 *                 example: 999.99
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered]
 *                 description: Current status of the order
 *                 example: "pending"
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 51
 *                     item_name:
 *                       type: string
 *                       example: "Laptop"
 *                     amount:
 *                       type: number
 *                       example: 999.99
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     date_created:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-29T05:20:22.484Z"
 *       400:
 *         description: Validation error (missing fields, invalid amount, or invalid status)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required fields"
 *                 required:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["item_name", "amount", "status"]
 *       500:
 *         description: Database error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Database error"
 *                 details:
 *                   type: string
 *                   example: "Insert failed"
 */
// POST /orders - Create a new order
app.post('/orders', (req, res) => {
  // eslint-disable-next-line camelcase
  const { item_name, amount, status } = req.body;

  // Validation
  // eslint-disable-next-line camelcase
  if (!item_name || amount === undefined || amount === null || !status) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['item_name', 'amount', 'status'],
    });
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'Amount must be a number greater than 0',
    });
  }

  const validStatuses = ['pending', 'shipped', 'delivered'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      message: `Status must be one of: ${validStatuses.join(', ')}`,
    });
  }

  // Insert into database using parameterized query
  const dateCreated = new Date().toISOString();
  const insertQuery = `
    INSERT INTO orders (item_name, amount, status, date_created) /* eslint-disable-line camelcase */
    VALUES (?, ?, ?, ?)
  `;

  // eslint-disable-next-line camelcase
  db.run(insertQuery, [item_name, amount, status, dateCreated], function insertCallback(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: this.lastID,
        item_name, // eslint-disable-line camelcase
        amount,
        status,
        date_created: dateCreated,
      },
    });
  });
});

/**
 * @swagger
 * /orders/{id}:
 *   put:
 *     summary: Update an existing order
 *     description: Update the status and/or amount of an order by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: New order amount (must be greater than 0)
 *                 example: 1299.99
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered]
 *                 description: New order status
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Order updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     item_name:
 *                       type: string
 *                       example: "Laptop"
 *                     amount:
 *                       type: number
 *                       example: 1299.99
 *                     status:
 *                       type: string
 *                       example: "shipped"
 *                     date_created:
 *                       type: string
 *                       format: date-time
 *                       example: "2026-01-29T05:20:22.484Z"
 *       400:
 *         description: Validation error
 *       404:
 *         description: Order not found
 *       500:
 *         description: Database error
 */
// PUT /orders/:id - Update an order
app.put('/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id, 10);
  const { amount, status } = req.body;

  // Validate that at least one field is provided
  if (amount === undefined && !status) {
    return res.status(400).json({
      error: 'Missing update fields',
      message: 'At least one of amount or status must be provided',
    });
  }

  // Validate amount if provided
  if (amount !== undefined && (typeof amount !== 'number' || amount <= 0)) {
    return res.status(400).json({
      error: 'Invalid amount',
      message: 'Amount must be a number greater than 0',
    });
  }

  // Validate status if provided
  if (status) {
    const validStatuses = ['pending', 'shipped', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }
  }

  // First, check if order exists
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: `No order found with ID ${orderId}`,
      });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    params.push(orderId);

    const updateQuery = `UPDATE orders SET ${updates.join(', ')} WHERE id = ?`;

    db.run(updateQuery, params, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ error: 'Database error', details: updateErr.message });
      }

      // Fetch the updated order
      db.get('SELECT * FROM orders WHERE id = ?', [orderId], (getErr, updatedOrder) => {
        if (getErr) {
          return res.status(500).json({ error: 'Database error', details: getErr.message });
        }

        res.json({
          success: true,
          message: 'Order updated successfully',
          data: updatedOrder,
        });
      });
    });
  });
});

/**
 * @swagger
 * /orders/{id}:
 *   delete:
 *     summary: Delete an order
 *     description: Remove an order from the database by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID to delete
 *     responses:
 *       204:
 *         description: Order deleted successfully (no content)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Database error
 */
// DELETE /orders/:id - Delete an order
app.delete('/orders/:id', (req, res) => {
  const orderId = parseInt(req.params.id, 10);

  // First, check if order exists
  db.get('SELECT * FROM orders WHERE id = ?', [orderId], (err, order) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
        message: `No order found with ID ${orderId}`,
      });
    }

    // Delete the order
    db.run('DELETE FROM orders WHERE id = ?', [orderId], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: 'Database error', details: deleteErr.message });
      }

      res.status(204).send();
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Try: http://localhost:${PORT}/orders`);
  });
}

module.exports = app;
