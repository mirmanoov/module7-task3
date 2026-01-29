# 🛒 Orders Management API

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-v5.2.1-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-v5.1.7-003B57?style=flat&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Jest](https://img.shields.io/badge/Tests-21%20Passed-C21325?style=flat&logo=jest&logoColor=white)](https://jestjs.io/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?style=flat&logo=swagger&logoColor=black)](https://swagger.io/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [API Endpoints](#-api-endpoints)
  - [GET /orders](#-get-orders---retrieve-orders)
  - [POST /orders](#-post-orders---create-order)
  - [PUT /orders/{id}](#️-put-ordersid---update-order)
  - [DELETE /orders/{id}](#️-delete-ordersid---delete-order)
  - [GET /orders/export](#-get-ordersexport---export-data)
- [Interactive Documentation (Swagger UI)](#-interactive-api-documentation-swagger-ui)
- [Testing](#-testing)
- [Rate Limiting](#-rate-limiting)
- [Security](#-security-features)
- [Project Structure](#-project-structure)
- [Tech Stack](#️-tech-stack)
- [Database Schema](#-database-schema)

---

## 🎯 Overview

The **Orders Management API** is a production-ready REST API designed for managing e-commerce orders with enterprise-grade features. Built with modern Node.js technologies, this API demonstrates best practices in:

- **RESTful Design**: Proper HTTP methods, status codes, and resource naming
- **Data Validation**: Comprehensive input validation with meaningful error messages
- **Security**: SQL injection prevention, rate limiting, and parameterized queries
- **Documentation**: Interactive Swagger UI with complete OpenAPI 3.0 specification
- **Testing**: 21 automated tests covering all endpoints and edge cases

### 🌐 Base URL

```
http://localhost:3000
```

### 📖 Interactive Documentation

```
http://localhost:3000/api-docs
```

---

## ✨ Features

### Core Functionality

| Feature | Description |
|---------|-------------|
| **Full CRUD Operations** | Create, Read, Update, and Delete orders through RESTful endpoints |
| **Advanced Pagination** | Navigate large datasets with customizable page size (1-100 items) |
| **Multi-Field Filtering** | Filter by status, amount range, and date range simultaneously |
| **Dynamic Sorting** | Sort by any field (id, date, amount, status, item_name) in ascending or descending order |
| **Data Export** | Download complete order data as CSV or pretty-printed JSON files |

### Enterprise Features

| Feature | Description |
|---------|-------------|
| **Rate Limiting** | Protect API from abuse with 100 requests per 15 minutes per IP |
| **Input Validation** | Comprehensive validation with detailed error messages |
| **SQL Injection Prevention** | All queries use parameterized statements |
| **Swagger Documentation** | Interactive API testing directly in the browser |
| **Comprehensive Testing** | 21 automated tests with Jest + Supertest |

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm** v9.0.0 or higher (included with Node.js)

### Installation

#### Step 1: Clone and Install Dependencies

```bash
# Navigate to the project directory
cd module7-task3

# Install all dependencies
npm install
```

This installs the following packages:
- `express` - Web framework
- `sqlite3` - Database driver
- `swagger-ui-express` & `swagger-jsdoc` - API documentation
- `express-rate-limit` - Rate limiting middleware
- `json2csv` - CSV export functionality
- `jest` & `supertest` - Testing framework

#### Step 2: Initialize the Database

```bash
# Create and seed the database with 50 sample orders
node seed.js
```

**Expected Output:**
```
Connected to SQLite database
Orders table created/verified
Inserted 50 sample orders
Database seeding complete!
```

The seed script creates orders with:
- Random item names (Laptop, Wireless Mouse, Gaming Keyboard, etc.)
- Prices ranging from $10.00 to $500.00
- Various statuses (pending, shipped, delivered, cancelled)
- Dates spanning the past 30 days

#### Step 3: Start the Server

```bash
# Production mode
npm start

# Development mode (with auto-reload)
npm run dev
```

**Expected Output:**
```
Connected to SQLite
Orders table ready
Server is running on http://localhost:3000
Swagger UI available at http://localhost:3000/api-docs
```

### Available Scripts

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm start` | Start production server | Deployment, testing |
| `npm run dev` | Start with nodemon (auto-reload) | Development |
| `npm test` | Run all 21 test cases | CI/CD, validation |

---

## 📚 API Endpoints

### Endpoint Summary

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/orders` | Retrieve orders with filtering/sorting/pagination | No |
| `POST` | `/orders` | Create a new order | No |
| `PUT` | `/orders/{id}` | Update order status and/or amount | No |
| `DELETE` | `/orders/{id}` | Remove an order from the database | No |
| `GET` | `/orders/export` | Export all orders (CSV or JSON) | No |
| `GET` | `/health` | Server health check | No |

---

## 🔍 GET /orders - Retrieve Orders

Retrieve orders from the database with powerful filtering, sorting, and pagination capabilities.

### Endpoint

```
GET /orders
```

### Query Parameters

| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `page` | integer | `1` | 1 - ∞ | Page number for pagination |
| `limit` | integer | `10` | 1 - 100 | Number of orders per page |
| `status` | string | - | `pending`, `shipped`, `delivered`, `cancelled` | Filter by order status |
| `min_amount` | number | - | 0 - ∞ | Minimum order amount (inclusive) |
| `max_amount` | number | - | 0 - ∞ | Maximum order amount (inclusive) |
| `start_date` | string | - | YYYY-MM-DD | Orders created on or after this date |
| `end_date` | string | - | YYYY-MM-DD | Orders created on or before this date |
| `sort_by` | string | `date_created` | `id`, `date_created`, `amount`, `status`, `item_name` | Field to sort by |
| `order` | string | `asc` | `asc`, `desc` | Sort direction |

### Response Schema

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "item_name": "Wireless Mouse",
      "amount": 49.99,
      "status": "pending",
      "date_created": "2026-01-14T05:08:44.152Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalRecords": 50,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data` | array | Array of order objects matching the query |
| `pagination.page` | integer | Current page number |
| `pagination.limit` | integer | Number of items per page |
| `pagination.totalRecords` | integer | Total number of matching orders |
| `pagination.totalPages` | integer | Total number of pages available |
| `pagination.hasNextPage` | boolean | Whether more pages exist after current |
| `pagination.hasPrevPage` | boolean | Whether pages exist before current |

### HTTP Status Codes

| Code | Description | Scenario |
|------|-------------|----------|
| `200` | OK | Orders retrieved successfully |
| `429` | Too Many Requests | Rate limit exceeded (100 req/15min) |
| `500` | Internal Server Error | Database connection failed |

### Examples

#### Basic Request (Default Pagination)

```bash
curl "http://localhost:3000/orders"
```

Returns the first 10 orders sorted by date_created ascending.

#### Pagination

```bash
# Get page 2 with 5 items per page
curl "http://localhost:3000/orders?page=2&limit=5"
```

#### Filter by Status

```bash
# Get only pending orders
curl "http://localhost:3000/orders?status=pending"

# Get only shipped orders
curl "http://localhost:3000/orders?status=shipped"
```

#### Filter by Amount Range

```bash
# Orders between $50 and $200
curl "http://localhost:3000/orders?min_amount=50&max_amount=200"

# Orders over $100
curl "http://localhost:3000/orders?min_amount=100"
```

#### Filter by Date Range

```bash
# Orders from January 2026
curl "http://localhost:3000/orders?start_date=2026-01-01&end_date=2026-01-31"

# Orders from the last week
curl "http://localhost:3000/orders?start_date=2026-01-22"
```

#### Sorting

```bash
# Sort by amount, highest first
curl "http://localhost:3000/orders?sort_by=amount&order=desc"

# Sort by item name alphabetically
curl "http://localhost:3000/orders?sort_by=item_name&order=asc"

# Most recent orders first
curl "http://localhost:3000/orders?sort_by=date_created&order=desc"
```

#### Combined Filters

```bash
# Pending orders over $100, sorted by amount descending, page 1 with 5 results
curl "http://localhost:3000/orders?status=pending&min_amount=100&sort_by=amount&order=desc&page=1&limit=5"
```

### Swagger UI Screenshot

![GET Orders - Expanded Interface](./screenshots/get-orders-expanded.png)

**What This Screenshot Shows:**

The GET /orders endpoint expanded in Swagger UI reveals all 9 query parameters:

1. **page** (integer, default: 1) - Page number for pagination
2. **limit** (integer, default: 5 shown) - Number of results per page
3. **status** (string, dropdown: "pending") - Filter by order status
4. **min_amount** (number) - Minimum order amount filter
5. **max_amount** (number) - Maximum order amount filter
6. **start_date** (string: "2026-01-01") - Start date for date range filter
7. **end_date** (string: "2026-01-31") - End date for date range filter
8. **sort_by** (string: "date_created") - Field to sort by
9. **order** (string: "asc") - Sort direction

Each parameter includes its type, description, and format hints (e.g., "YYYY-MM-DD format" for dates).

### Response Screenshots

![GET Orders - Response Part 1](./screenshots/get-orders-response-part1.png)

**Response Analysis:**

The screenshot shows the server response after executing a GET request with filters:

- **Request URL**: `http://localhost:3000/orders?page=1&limit=5&status=pending&start_date=2026-01-01&end_date=2026-01-31&sort_by=date_created&order=asc`
- **Status Code**: `200 OK` - Request successful
- **Response Body**: JSON array containing 5 pending orders matching the date range filter

**Key Observations:**
- All returned orders have `"status": "pending"` (filter working correctly)
- Orders are sorted by `date_created` in ascending order
- Dates fall within the specified range (January 2026)
- Response headers show rate limit information (`ratelimit-remaining: 91`)

![GET Orders - Response Part 2](./screenshots/get-orders-response-part2.png)

**Documentation Section:**

The lower portion shows Swagger's response documentation:

- **200 Response Schema**: Example of successful response structure
- **Pagination Object**: Shows all pagination fields with example values
- **500 Error Schema**: Documents the database error response format

---

## ➕ POST /orders - Create Order

Create a new order in the database with automatic validation.

### Endpoint

```
POST /orders
```

### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |
| `Accept` | `application/json` | Recommended |

### Request Body Schema

```json
{
  "item_name": "Laptop",
  "amount": 999.99,
  "status": "pending"
}
```

### Request Fields

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `item_name` | string | ✅ Yes | Non-empty string, describes the ordered item |
| `amount` | number | ✅ Yes | Must be greater than 0 (positive decimal) |
| `status` | string | ✅ Yes | Must be one of: `pending`, `shipped`, `delivered`, `cancelled` |

### Response Schema (201 Created)

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 51,
    "item_name": "Laptop",
    "amount": 999.99,
    "status": "pending",
    "date_created": "2026-01-29T14:31:38.120Z"
  }
}
```

### Auto-Generated Fields

| Field | Description |
|-------|-------------|
| `id` | Auto-incrementing unique identifier |
| `date_created` | ISO 8601 timestamp of order creation (UTC) |

### HTTP Status Codes

| Code | Description | Scenario |
|------|-------------|----------|
| `201` | Created | Order successfully created |
| `400` | Bad Request | Validation failed (see error types below) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Database insert failed |

### Validation Error Types

| Error | Cause | Example Response |
|-------|-------|------------------|
| Missing required fields | `item_name`, `amount`, or `status` not provided | `{"error": "Missing required fields", "required": ["item_name", "amount", "status"]}` |
| Invalid amount | Amount is 0, negative, or not a number | `{"error": "Invalid amount", "message": "Amount must be a positive number greater than 0"}` |
| Invalid status | Status not in allowed values | `{"error": "Invalid status", "message": "Status must be one of: pending, shipped, delivered, cancelled"}` |

### Examples

#### Successful Creation

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "item_name": "MacBook Pro 16-inch",
    "amount": 2499.99,
    "status": "pending"
  }'
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 63,
    "item_name": "MacBook Pro 16-inch",
    "amount": 2499.99,
    "status": "pending",
    "date_created": "2026-01-29T15:00:00.000Z"
  }
}
```

#### Validation Error - Missing Fields

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"item_name": "Test"}'
```

**Response (400 Bad Request):**
```json
{
  "error": "Missing required fields",
  "required": ["item_name", "amount", "status"]
}
```

#### Validation Error - Invalid Amount

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"item_name": "Test", "amount": 0, "status": "pending"}'
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid amount",
  "message": "Amount must be a positive number greater than 0"
}
```

#### Validation Error - Invalid Status

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"item_name": "Test", "amount": 50, "status": "processing"}'
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid status",
  "message": "Status must be one of: pending, shipped, delivered, cancelled"
}
```

### Swagger UI Screenshots

![POST Orders - Request Interface](./screenshots/post-orders-expanded.png)

**Interface Analysis:**

The POST endpoint interface in Swagger UI shows:

- **Endpoint**: `POST /orders - Create a new order`
- **Description**: "Add a new order to the database with validation"
- **Parameters**: None (no query parameters for POST)
- **Request body**: Required, with `application/json` content type

**Request Body Editor:**
```json
{
  "item_name": "Laptop",
  "amount": 999.99,
  "status": "pending"
}
```

The editor shows:
- Pre-filled example values for quick testing
- JSON syntax highlighting
- Edit Value / Schema toggle to view the schema definition
- Execute button (blue) to send the request
- Clear button to reset the form

![POST Orders - Response Part 1](./screenshots/post-orders-response-part1.png)

**Successful Response Analysis:**

After clicking Execute, Swagger displays:

1. **Curl Command**: The exact curl command that was executed
   ```bash
   curl -X 'POST' \
     'http://localhost:3000/orders' \
     -H 'accept: application/json' \
     -H 'Content-Type: application/json' \
     -d '{"item_name": "Laptop", "amount": 999.99, "status": "pending"}'
   ```

2. **Request URL**: `http://localhost:3000/orders`

3. **Server Response**:
   - **Code**: `201` (Created - success!)
   - **Response Body**:
     ```json
     {
       "success": true,
       "message": "Order created successfully",
       "data": {
         "id": 64,
         "item_name": "Laptop",
         "amount": 999.99,
         "status": "pending",
         "date_created": "2026-01-29T14:42:18.991Z"
       }
     }
     ```

4. **Response Headers**:
   - `content-type: application/json; charset=utf-8`
   - `ratelimit-limit: 100` (rate limit active)
   - `ratelimit-remaining: 58`

![POST Orders - Response Part 2](./screenshots/post-orders-response-part2.png)

**Documentation Section:**

Shows the possible response codes:

- **201 - Order created successfully**: Schema with example response
- **400 - Validation error**: Example showing missing fields error
- **500 - Database error**: Example showing insert failure

---

## ✏️ PUT /orders/{id} - Update Order

Update the status and/or amount of an existing order.

### Endpoint

```
PUT /orders/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ Yes | The unique identifier of the order to update |

### Request Headers

| Header | Value | Required |
|--------|-------|----------|
| `Content-Type` | `application/json` | Yes |

### Request Body Schema

```json
{
  "amount": 1299.99,
  "status": "shipped"
}
```

**Note**: Both fields are optional. You can update:
- Only `amount`
- Only `status`
- Both `amount` and `status`

### Request Fields

| Field | Type | Required | Validation Rules |
|-------|------|----------|-----------------|
| `amount` | number | Optional | If provided, must be greater than 0 |
| `status` | string | Optional | If provided, must be: `pending`, `shipped`, `delivered`, or `cancelled` |

### Response Schema (200 OK)

```json
{
  "success": true,
  "message": "Order updated successfully",
  "data": {
    "id": 8,
    "item_name": "Laptop",
    "amount": 1299.99,
    "status": "shipped",
    "date_created": "2026-01-15T08:30:00.000Z"
  }
}
```

### HTTP Status Codes

| Code | Description | Scenario |
|------|-------------|----------|
| `200` | OK | Order updated successfully |
| `400` | Bad Request | Invalid amount or status value |
| `404` | Not Found | No order exists with the given ID |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Database update failed |

### Examples

#### Update Status Only

```bash
curl -X PUT http://localhost:3000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

#### Update Amount Only

```bash
curl -X PUT http://localhost:3000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"amount": 599.99}'
```

#### Update Both Fields

```bash
curl -X PUT http://localhost:3000/orders/1 \
  -H "Content-Type: application/json" \
  -d '{"amount": 1299.99, "status": "delivered"}'
```

### Swagger UI Screenshots

![PUT Orders - Request Interface](./screenshots/orders-put-expanded.png)

**Interface Analysis:**

The PUT endpoint interface shows:

- **Endpoint**: `PUT /orders/{id} - Update an existing order`
- **Description**: "Update the status and/or amount of an order by ID"
- **Path Parameter**: `id` (required integer) - "Order ID" with example value `8`
- **Request Body**: Optional fields `amount` and `status`

**Request Configuration Shown:**
- ID: `8` (updating order with ID 8)
- Request body:
  ```json
  {
    "amount": 1299.99,
    "status": "shipped"
  }
  ```

![PUT Orders - Response Part 1](./screenshots/orders-put-response-part1.png)

**Response Analysis:**

After executing the PUT request:

1. **Curl Command Generated**:
   ```bash
   curl -X 'PUT' \
     'http://localhost:3000/orders/8' \
     -H 'accept: application/json' \
     -H 'Content-Type: application/json' \
     -d '{"amount": 1299.99, "status": "shipped"}'
   ```

2. **Server Response**:
   - **Code**: `200` (OK - success!)
   - **Response Body**: Updated order object with new values
   - Note: `item_name` and `date_created` remain unchanged

![PUT Orders - Response Part 2](./screenshots/orders-put-response-part2.png)

**Error Documentation:**

Shows possible error responses:
- **404 - Order not found**: When the specified ID doesn't exist
- **400 - Validation error**: When amount or status values are invalid

---

## 🗑️ DELETE /orders/{id} - Delete Order

Permanently remove an order from the database.

### Endpoint

```
DELETE /orders/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | ✅ Yes | The unique identifier of the order to delete |

### Response Codes

| Code | Description | Response Body |
|------|-------------|---------------|
| `204` | No Content | Empty (order deleted successfully) |
| `404` | Not Found | `{"error": "Order not found", "message": "No order found with ID {id}"}` |
| `429` | Too Many Requests | Rate limit error |
| `500` | Internal Server Error | Database error |

### Examples

#### Successful Deletion

```bash
curl -X DELETE http://localhost:3000/orders/62
```

**Response**: HTTP 204 No Content (empty body)

#### Delete Non-Existent Order

```bash
curl -X DELETE http://localhost:3000/orders/999
```

**Response (404 Not Found):**
```json
{
  "error": "Order not found",
  "message": "No order found with ID 999"
}
```

### Swagger UI Screenshots

![DELETE Orders - Request Interface](./screenshots/delete-orders-expanded.png)

**Interface Analysis:**

The DELETE endpoint interface shows:

- **Endpoint**: `DELETE /orders/{id} - Delete an order`
- **Description**: "Remove an order from the database by ID"
- **Visual Styling**: Red background indicating destructive operation
- **Path Parameter**: `id` (required integer) with example value `999`
- **No Request Body**: DELETE operations don't require a body

![DELETE Orders - 404 Response](./screenshots/delete-orders-response.png)

**Error Response Demonstration:**

The screenshot shows what happens when deleting a non-existent order:

1. **Curl Command**:
   ```bash
   curl -X 'DELETE' \
     'http://localhost:3000/orders/999' \
     -H 'accept: */*'
   ```

2. **Server Response**:
   - **Code**: `404` - Error: Not Found
   - **Response Body**:
     ```json
     {
       "error": "Order not found",
       "message": "No order found with ID 999"
     }
     ```

3. **Response Headers**: Standard headers with rate limit info

**Documentation Section**:
- **204 - Order deleted successfully (no content)**: Successful deletion returns empty body
- **404 - Order not found**: Detailed error when ID doesn't exist
- **500 - Database error**: When deletion fails due to database issues

---

## 📤 GET /orders/export - Export Data

Export all orders from the database as a downloadable file in CSV or JSON format.

### Endpoint

```
GET /orders/export
```

### Query Parameters

| Parameter | Type | Required | Values | Description |
|-----------|------|----------|--------|-------------|
| `format` | string | ✅ Yes | `csv`, `json` | The export file format |

### Response Headers

#### CSV Export

| Header | Value |
|--------|-------|
| `Content-Type` | `text/csv; charset=utf-8` |
| `Content-Disposition` | `attachment; filename=orders.csv` |

#### JSON Export

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Content-Disposition` | `attachment; filename=orders.json` |

### CSV Format

```csv
"id","item_name","amount","status","date_created"
1,"Wireless Mouse",500,"shipped","2026-01-14T05:08:44.152Z"
2,"Gaming Keyboard",171.09,"shipped","2026-01-11T05:08:44.154Z"
```

**CSV Fields:**
- Properly quoted string values
- Headers as first row
- All orders included (no pagination)

### JSON Format

```json
[
  {
    "id": 1,
    "item_name": "Wireless Mouse",
    "amount": 500,
    "status": "shipped",
    "date_created": "2026-01-14T05:08:44.152Z"
  },
  {
    "id": 2,
    "item_name": "Gaming Keyboard",
    "amount": 171.09,
    "status": "shipped",
    "date_created": "2026-01-11T05:08:44.154Z"
  }
]
```

**JSON Features:**
- Pretty-printed with 2-space indentation
- Array of all order objects
- Easy to import into other applications

### HTTP Status Codes

| Code | Description | Scenario |
|------|-------------|----------|
| `200` | OK | Export successful, file download initiated |
| `400` | Bad Request | Invalid or missing format parameter |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Database query or CSV conversion failed |

### Examples

#### Export as CSV

```bash
# Download and save as orders.csv
curl "http://localhost:3000/orders/export?format=csv" -o orders.csv
```

#### Export as JSON

```bash
# Download and save as orders.json
curl "http://localhost:3000/orders/export?format=json" -o orders.json
```

#### Invalid Format Error

```bash
curl "http://localhost:3000/orders/export?format=xml"
```

**Response (400 Bad Request):**
```json
{
  "error": "Invalid format",
  "message": "Format must be either \"json\" or \"csv\""
}
```

### Swagger UI Screenshots

![Export - Interface](./screenshots/orders-export-expanded.png)

**Interface Analysis:**

The export endpoint shows:

- **Endpoint**: `GET /orders/export - Export all orders`
- **Description**: "Export all orders in JSON or CSV format"
- **Query Parameter**: `format` (required)
  - Dropdown with options: `json`, `csv`
  - Description: "Export format (json or csv)"

![Export - CSV Response](./screenshots/orders-export-response-csv.png)

**CSV Export Response:**

After executing with `format=csv`:

1. **Request URL**: `http://localhost:3000/orders/export?format=csv`

2. **Server Response**:
   - **Code**: `200` (OK)
   - **Response Body**: "Download file" link
   
3. **Response Headers**:
   - `content-disposition: attachment; filename=orders.csv`
   - `content-type: text/csv; charset=utf-8`
   - `content-length: 3834` (file size in bytes)

![CSV File Opened](./screenshots/orders-export-response-csv-file-opened.png)

**Downloaded CSV File:**

The screenshot shows the exported CSV file opened in an editor/viewer:

- **First Row**: Column headers (`id`, `item_name`, `amount`, `status`, `date_created`)
- **Data Rows**: All orders with properly formatted values
- **Quoted Strings**: String values are quoted to handle special characters
- **Consistent Format**: Ready for import into Excel, databases, or other applications

![Export - JSON Response Part 1](./screenshots/orders-export-response-json-part1.png)

**JSON Export Response:**

Shows the response headers and download link for JSON format.

![Export - JSON Response Part 2](./screenshots/orders-export-json-part2.png)

**Documentation Section:**

Shows:
- **200 - Successfully exported orders**: File download response
- **400 - Invalid format parameter**: Error when format is not `json` or `csv`
- **500 - Database error**: When query fails

![JSON File Opened](./screenshots/orders-export-response-json-file-opened.png)

**Downloaded JSON File:**

The screenshot shows the exported JSON file opened in VS Code:

- **Pretty-Printed**: 2-space indentation for readability
- **Complete Data**: All order fields present
- **Array Structure**: Easy to parse programmatically
- **Syntax Highlighting**: JSON recognized by editor
- **Multiple Tabs Visible**: Shows orders.csv is also available

---

## 📖 Interactive API Documentation (Swagger UI)

### Accessing Swagger UI

```
http://localhost:3000/api-docs
```

![Swagger UI Overview](./screenshots/swagger-overview.png)

**Swagger UI Interface:**

The main Swagger UI page displays:

1. **API Title**: "Orders Management API" with version badge (1.0.0)
2. **API Description**: "A REST API for managing orders with pagination and filtering support"
3. **Contact Link**: API Support email
4. **Server Dropdown**: Development server at `http://localhost:3000`
5. **Collapsible Tags**: "Orders" section containing all endpoints

**Endpoint Color Coding:**
- 🟦 **GET** (Blue): `/orders` - Retrieve a list of orders
- 🟩 **POST** (Green): `/orders` - Create a new order
- 🟦 **GET** (Blue): `/orders/export` - Export all orders
- 🟧 **PUT** (Orange): `/orders/{id}` - Update an existing order
- 🟥 **DELETE** (Red): `/orders/{id}` - Delete an order

### Using Swagger UI

1. **Expand an Endpoint**: Click on any endpoint row to expand it
2. **View Parameters**: See all available query/path parameters
3. **Click "Try it out"**: Enable the parameter editors
4. **Fill in Values**: Enter your test data
5. **Click "Execute"**: Send the request to the API
6. **View Response**: See the status code, headers, and body

### Benefits of Swagger UI

| Feature | Benefit |
|---------|---------|
| **Interactive Testing** | Test API without writing code or curl commands |
| **Auto-Generated Curl** | Copy-paste ready curl commands for scripts |
| **Schema Visualization** | Understand request/response structure instantly |
| **Validation Feedback** | See exactly what went wrong with 400 errors |
| **Rate Limit Visibility** | Monitor remaining requests in headers |

---

## 🧪 Testing

The project includes a comprehensive test suite with **21 automated tests** built with **Jest** and **Supertest**. The tests cover all CRUD operations, pagination, filtering, and edge cases to ensure the API behaves correctly in all scenarios.

### Test Summary

| Category | Tests | Coverage |
|----------|-------|----------|
| **CRUD Operations (POST)** | 6 | Create orders, input validation, error handling |
| **Pagination (GET)** | 4 | Default behavior, custom limits, page navigation |
| **Filtering (GET)** | 5 | Status, amount range, combined filters |
| **Date Filtering (GET)** | 4 | Date range queries, boundary conditions |
| **Edge Cases** | 2 | Invalid parameters, graceful degradation |
| **Total** | **21** | **100% endpoint coverage** |

---

### 📝 CRUD Operations Tests (6 Tests)

These tests verify the **Create** operation through the POST /orders endpoint, ensuring proper validation and error handling.

#### Test 1: Successful Order Creation
```javascript
test('Should create a new order successfully (201 status)')
```
**What it tests:**
- Sending a valid request with `item_name`, `amount`, and `status`
- Server responds with HTTP 201 Created
- Response includes auto-generated `id` and `date_created`
- Response body has `success: true` and the complete order object

**Request:**
```json
{ "item_name": "Test Item", "amount": 99.99, "status": "pending" }
```
**Expected:** 201 status, order object with generated ID

---

#### Test 2: Missing item_name Validation
```javascript
test('Should fail if item_name is missing (400 status)')
```
**What it tests:**
- Sending a request without the `item_name` field
- Server correctly identifies the missing required field
- Returns descriptive error message

**Request:**
```json
{ "amount": 99.99, "status": "pending" }
```
**Expected:** 400 status, error: "Missing required fields"

---

#### Test 3: Missing amount Validation
```javascript
test('Should fail if amount is missing (400 status)')
```
**What it tests:**
- Sending a request without the `amount` field
- Server validates all required fields are present

**Request:**
```json
{ "item_name": "Test", "status": "pending" }
```
**Expected:** 400 status, error: "Missing required fields"

---

#### Test 4: Negative Amount Validation
```javascript
test('Should fail if amount is negative (400 status)')
```
**What it tests:**
- Sending a request with a negative amount value
- Server validates that amount must be positive

**Request:**
```json
{ "item_name": "Test", "amount": -50, "status": "pending" }
```
**Expected:** 400 status, error: "Invalid amount"

---

#### Test 5: Zero Amount Validation
```javascript
test('Should fail if amount is zero (400 status)')
```
**What it tests:**
- Sending a request with amount = 0
- Server correctly rejects zero as an invalid amount
- **Important edge case:** JavaScript treats 0 as falsy, but our validation specifically checks for this

**Request:**
```json
{ "item_name": "Test", "amount": 0, "status": "pending" }
```
**Expected:** 400 status, error: "Invalid amount"

---

#### Test 6: Invalid Status Validation
```javascript
test('Should fail with invalid status (400 status)')
```
**What it tests:**
- Sending a request with a status not in the allowed values
- Server validates status against whitelist: `pending`, `shipped`, `delivered`, `cancelled`

**Request:**
```json
{ "item_name": "Test", "amount": 50, "status": "processing" }
```
**Expected:** 400 status, error: "Invalid status"

---

### 📄 Pagination Tests (4 Tests)

These tests verify the pagination functionality of GET /orders, ensuring proper data slicing and navigation.

#### Test 7: Default Pagination Behavior
```javascript
test('Should return 10 orders by default')
```
**What it tests:**
- Calling GET /orders without any query parameters
- Server applies default pagination: page=1, limit=10
- Response includes exactly 10 orders
- Pagination metadata is accurate

**Request:** `GET /orders`
**Expected:** 200 status, 10 orders in data array, correct pagination object

---

#### Test 8: Custom Limit Parameter
```javascript
test('Should return 5 orders when limit=5')
```
**What it tests:**
- Custom limit parameter is respected
- Returns exactly the requested number of items
- Pagination metadata reflects the custom limit

**Request:** `GET /orders?limit=5`
**Expected:** 200 status, exactly 5 orders, `pagination.limit: 5`

---

#### Test 9: Page Navigation
```javascript
test('Should return the correct page 2 results')
```
**What it tests:**
- Navigating to page 2 returns different orders than page 1
- OFFSET calculation works correctly (page 2, limit 10 = offset 10)
- Orders are correctly sliced from the dataset

**Request:** `GET /orders?page=2`
**Expected:** 200 status, orders 11-20 from dataset, `pagination.page: 2`

---

#### Test 10: Empty Page Handling
```javascript
test('Should handle page 999 gracefully (empty array, not error)')
```
**What it tests:**
- Requesting a page beyond available data
- Server returns empty array, not an error
- This is a graceful degradation pattern

**Request:** `GET /orders?page=999`
**Expected:** 200 status, empty data array `[]`, `pagination.page: 999`

---

### 🔍 Filtering Tests (5 Tests)

These tests verify the filtering functionality of GET /orders, covering status filters, amount ranges, and combinations.

#### Test 11: Filter by Status (pending)
```javascript
test('Should filter by status=pending')
```
**What it tests:**
- Status filter correctly filters orders
- Only orders with "pending" status are returned
- Database WHERE clause works correctly

**Request:** `GET /orders?status=pending`
**Expected:** 200 status, all returned orders have `status: "pending"`

---

#### Test 12: Filter by Status (shipped)
```javascript
test('Should filter by status=shipped')
```
**What it tests:**
- Status filter works for different status values
- Verifies filter is not hardcoded to a single value

**Request:** `GET /orders?status=shipped`
**Expected:** 200 status, all returned orders have `status: "shipped"`

---

#### Test 13: Amount Range Filter
```javascript
test('Should filter by min_amount and max_amount')
```
**What it tests:**
- Both min_amount and max_amount filters work together
- Boundary values are inclusive (>= min, <= max)
- Range filtering in SQL works correctly

**Request:** `GET /orders?min_amount=50&max_amount=150`
**Expected:** 200 status, all orders have amount between 50 and 150 (inclusive)

---

#### Test 14: Empty Filter Results
```javascript
test('Should return empty list if no orders match filters')
```
**What it tests:**
- When filters match no orders, API returns empty array
- No error is thrown for zero results
- Pagination shows totalRecords: 0

**Request:** `GET /orders?min_amount=999999`
**Expected:** 200 status, empty data array `[]`, `pagination.totalRecords: 0`

---

#### Test 15: Combined Filters
```javascript
test('Should combine multiple filters (status + amount range)')
```
**What it tests:**
- Multiple filters can be applied simultaneously
- AND logic is used (all conditions must match)
- Complex WHERE clauses are built correctly

**Request:** `GET /orders?status=pending&min_amount=100&max_amount=500`
**Expected:** 200 status, orders matching ALL criteria

---

### 📅 Date Filtering Tests (4 Tests)

These tests verify date range filtering functionality, testing the start_date and end_date parameters.

#### Test 18: Date Range Filter
```javascript
test('Should filter by date range')
```
**What it tests:**
- Both start_date and end_date filters work together
- Date comparison uses SQLite date() function
- Orders within the range are returned

**Request:** `GET /orders?start_date=2026-01-01&end_date=2026-01-31`
**Expected:** 200 status, orders created within January 2026

---

#### Test 19: Empty Date Range Results
```javascript
test('Should return empty if no orders in date range')
```
**What it tests:**
- Date range with no matching orders returns empty array
- No errors for zero results in date filtering

**Request:** `GET /orders?start_date=1999-01-01&end_date=1999-12-31`
**Expected:** 200 status, empty data array `[]`

---

#### Test 20: Start Date Only Filter
```javascript
test('Should filter by start_date only')
```
**What it tests:**
- Using only start_date without end_date
- Returns orders created on or after the specified date
- Open-ended date range works correctly

**Request:** `GET /orders?start_date=2026-01-15`
**Expected:** 200 status, orders from Jan 15, 2026 onwards

---

#### Test 21: End Date Only Filter
```javascript
test('Should filter by end_date only')
```
**What it tests:**
- Using only end_date without start_date
- Returns orders created on or before the specified date
- Open-ended date range works correctly

**Request:** `GET /orders?end_date=2026-01-15`
**Expected:** 200 status, orders up to and including Jan 15, 2026

---

### ⚠️ Edge Case Tests (2 Tests)

These tests verify graceful handling of invalid or unexpected input.

#### Test 16: Invalid Page Parameter
```javascript
test('Should handle invalid page parameter gracefully')
```
**What it tests:**
- Non-numeric page parameter (e.g., "abc")
- Server defaults to page 1 instead of crashing
- Type coercion and fallback logic

**Request:** `GET /orders?page=abc`
**Expected:** 200 status, defaults to page 1, no error

---

#### Test 17: Invalid Limit Parameter
```javascript
test('Should handle invalid limit parameter gracefully')
```
**What it tests:**
- Non-numeric limit parameter
- Server defaults to limit 10 instead of crashing
- Prevents SQL injection through numeric params

**Request:** `GET /orders?limit=xyz`
**Expected:** 200 status, defaults to limit 10, no error

---

### 🚀 Running Tests

```bash
# Run all tests
npm test

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode (development)
npm test -- --watch
```

### Test Output Screenshot

![Jest Test Output](./screenshots/jest-test-output-terminal.png)

**Test Execution Analysis:**

The screenshot shows the complete Jest test output in the terminal:

1. **Command Executed**: `npm test` which runs `NODE_ENV=test jest`
   - The `NODE_ENV=test` flag ensures the server doesn't start listening (prevents port conflicts)
   
2. **Database Initialization Logs**:
   - `Connected to SQLite` - In-memory database created
   - `Orders table ready` - Schema applied and test data seeded

3. **Test Results by Category**:
   ```
   PASS  ./orders.test.js
   
   POST /orders
     ✓ Should create a new order successfully (201 status) (37 ms)
     ✓ Should fail if item_name is missing (400 status) (2 ms)
     ✓ Should fail if amount is missing (400 status) (1 ms)
     ✓ Should fail if amount is negative (400 status) (1 ms)
     ✓ Should fail if amount is zero (400 status) (1 ms)
     ✓ Should fail with invalid status (400 status) (1 ms)
   
   GET /orders - Pagination
     ✓ Should return 10 orders by default (2 ms)
     ✓ Should return 5 orders when limit=5 (2 ms)
     ✓ Should return the correct page 2 results (3 ms)
     ✓ Should handle page 999 gracefully (empty array, not error) (1 ms)
   
   GET /orders - Filtering
     ✓ Should filter by status=pending (2 ms)
     ✓ Should filter by status=shipped (6 ms)
     ✓ Should filter by min_amount and max_amount (2 ms)
     ✓ Should return empty list if no orders match filters (2 ms)
     ✓ Should combine multiple filters (status + amount range) (2 ms)
   
   GET /orders - Edge Cases
     ✓ Should handle invalid page parameter gracefully (1 ms)
     ✓ Should handle invalid limit parameter gracefully (2 ms)
   
   GET /orders - Date Filtering
     ✓ Should filter by date range (1 ms)
     ✓ Should return empty if no orders in date range (1 ms)
     ✓ Should filter by start_date only (1 ms)
     ✓ Should filter by end_date only (2 ms)
   ```

4. **Summary Metrics**:
   - **Test Suites**: 1 passed, 1 total
   - **Tests**: 21 passed, 21 total (100% pass rate)
   - **Snapshots**: 0 total
   - **Time**: 0.627 seconds (fast execution)

### Test Configuration Details

#### In-Memory Database

Tests use **SQLite in-memory mode** (`:memory:`):

```javascript
// In test setup
const db = new sqlite3.Database(':memory:');
```

**Benefits:**
- **Isolation**: Tests don't affect the production `orders.db` file
- **Speed**: In-memory operations are significantly faster than disk I/O
- **Reproducibility**: Fresh database state for each test run
- **No Cleanup**: Database disappears when tests complete

#### Test Environment Setup

```javascript
// package.json script
"test": "NODE_ENV=test jest"
```

The `NODE_ENV=test` environment variable:
- Prevents the Express server from calling `app.listen()`
- Allows Supertest to bind to the app directly
- Avoids "port already in use" errors during testing

#### Test Structure

```javascript
const request = require('supertest');
const app = require('./server');

describe('POST /orders', () => {
  test('Should create a new order successfully', async () => {
    const response = await request(app)
      .post('/orders')
      .send({ item_name: 'Test', amount: 99.99, status: 'pending' })
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBeDefined();
  });
});

---

## 🛡️ Rate Limiting

The API includes rate limiting to protect against abuse and ensure fair usage.

### Configuration

| Setting | Value |
|---------|-------|
| **Window Duration** | 15 minutes |
| **Max Requests** | 100 per window |
| **Scope** | Per IP address |
| **Protected Routes** | All `/orders` endpoints |

### Response Headers

Every response includes rate limit information:

```http
RateLimit-Limit: 100
RateLimit-Remaining: 97
RateLimit-Reset: 827
RateLimit-Policy: 100;w=900
```

| Header | Description |
|--------|-------------|
| `RateLimit-Limit` | Maximum requests allowed |
| `RateLimit-Remaining` | Requests remaining in current window |
| `RateLimit-Reset` | Seconds until limit resets |
| `RateLimit-Policy` | Policy configuration (100 requests per 900 seconds) |

### Rate Limit Exceeded Response

When you exceed the limit:

**Status**: `429 Too Many Requests`

```json
{
  "error": "Too many requests",
  "message": "You have exceeded the 100 requests in 15 minutes limit!",
  "retryAfter": "15 minutes"
}
```

---

## 🔒 Security Features

| Feature | Implementation | Protection Against |
|---------|---------------|-------------------|
| **Parameterized Queries** | All SQL uses `?` placeholders | SQL Injection |
| **Input Validation** | All fields validated before processing | Malformed data, type errors |
| **Rate Limiting** | 100 req/15min per IP | DoS, brute force attacks |
| **Whitelist Sorting** | Sort fields validated against allowed list | SQL injection via sorting |
| **Error Sanitization** | Internal errors not exposed to clients | Information disclosure |
| **Type Coercion** | Numeric params converted and validated | Type confusion attacks |

### SQL Injection Prevention Example

```javascript
// ❌ Vulnerable (never do this)
const query = `SELECT * FROM orders WHERE status = '${status}'`;

// ✅ Safe (parameterized query)
const query = 'SELECT * FROM orders WHERE status = ?';
db.all(query, [status], callback);
```

---

## 🗂️ Project Structure

```
module7-task3/
├── 📄 database.js           # SQLite connection and schema definition
├── 📄 server.js             # Express app, routes, middleware (750+ lines)
├── 📄 seed.js               # Database seeding script (50 orders)
├── 📄 orders.test.js        # Jest test suite (21 tests)
├── 📦 orders.db             # SQLite database (created by seed.js)
├── 📄 package.json          # Dependencies and npm scripts
├── 📁 screenshots/          # API documentation screenshots (19 files)
│   ├── swagger-overview.png
│   ├── get-orders-*.png
│   ├── post-orders-*.png
│   ├── orders-put-*.png
│   ├── delete-orders-*.png
│   ├── orders-export-*.png
│   └── jest-test-output-terminal.png
├── 📄 COPILOT_REPORT.md     # GitHub Copilot metrics report
└── 📄 README.md             # This comprehensive documentation
```

---

## 🛠️ Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Runtime** | Node.js | v18+ | JavaScript runtime |
| **Framework** | Express.js | v5.2.1 | Web application framework |
| **Database** | SQLite3 | v5.1.7 | Embedded SQL database |
| **Testing** | Jest | v29.7.0 | Test runner and assertions |
| **Testing** | Supertest | v6.3.4 | HTTP testing library |
| **Documentation** | swagger-ui-express | v5.x | Swagger UI middleware |
| **Documentation** | swagger-jsdoc | v6.x | JSDoc to OpenAPI generator |
| **Security** | express-rate-limit | v7.x | Rate limiting middleware |
| **Export** | json2csv | v6.x | JSON to CSV converter |
| **Development** | Nodemon | v3.0.3 | Auto-reload on file changes |

---

## 📝 Database Schema

### `orders` Table

```sql
CREATE TABLE orders (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name    TEXT    NOT NULL,
    amount       REAL    NOT NULL,
    status       TEXT    NOT NULL,
    date_created TEXT    NOT NULL
);
```

### Column Details

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique identifier, auto-generated |
| `item_name` | TEXT | NOT NULL | Name of the ordered product |
| `amount` | REAL | NOT NULL | Order price (supports decimals) |
| `status` | TEXT | NOT NULL | Order status (pending/shipped/delivered/cancelled) |
| `date_created` | TEXT | NOT NULL | ISO 8601 timestamp of creation |

### Sample Data

```sql
INSERT INTO orders (item_name, amount, status, date_created) VALUES
('Wireless Mouse', 49.99, 'pending', '2026-01-29T10:30:00.000Z'),
('Gaming Keyboard', 149.99, 'shipped', '2026-01-28T14:45:00.000Z'),
('USB-C Hub', 79.99, 'delivered', '2026-01-27T09:15:00.000Z');
```

---

## 📜 License

ISC License

---

## 👨‍💻 Author

Module 7 Task 3 - Orders Management API

Built with ❤️ using Node.js, Express.js, and SQLite