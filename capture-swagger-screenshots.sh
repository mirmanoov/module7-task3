#!/bin/bash

# Swagger UI Screenshot Capture Script
# This script helps you capture screenshots of all Swagger UI endpoints
# 
# INSTRUCTIONS:
# 1. Open http://localhost:3000/api-docs/ in your browser
# 2. Run this script: ./capture-swagger-screenshots.sh
# 3. Follow the prompts to capture each screenshot

echo "🎯 Swagger UI Screenshot Capture Tool"
echo "======================================"
echo ""
echo "Make sure you have http://localhost:3000/api-docs/ open in your browser!"
echo ""
read -p "Press Enter when ready to start capturing screenshots..."

# Create screenshots directory if it doesn't exist
mkdir -p screenshots

echo ""
echo "📸 Screenshot 1: Swagger UI Overview"
echo "   - Show all endpoints collapsed/listed"
echo "   - Click on the browser window to focus it"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/swagger-overview.png
echo "   ✅ Saved: screenshots/swagger-overview.png"

echo ""
echo "📸 Screenshot 2: GET /orders - Expanded View"
echo "   - Expand the GET /orders endpoint"
echo "   - Show all query parameters"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/get-orders-expanded.png
echo "   ✅ Saved: screenshots/get-orders-expanded.png"

echo ""
echo "📸 Screenshot 3: GET /orders - Try it out"
echo "   - Click 'Try it out'"
echo "   - Fill in: page=1, limit=5, status=pending"
echo "   - Click 'Execute'"
echo "   - Show the response"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/get-orders-response.png
echo "   ✅ Saved: screenshots/get-orders-response.png"

echo ""
echo "📸 Screenshot 4: GET /orders/export - CSV"
echo "   - Expand GET /orders/export"
echo "   - Click 'Try it out'"
echo "   - Set format=csv"
echo "   - Click 'Execute'"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/get-export-csv.png
echo "   ✅ Saved: screenshots/get-export-csv.png"

echo ""
echo "📸 Screenshot 5: GET /orders/export - JSON"
echo "   - Change format=json"
echo "   - Click 'Execute'"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/get-export-json.png
echo "   ✅ Saved: screenshots/get-export-json.png"

echo ""
echo "📸 Screenshot 6: POST /orders - Success"
echo "   - Expand POST /orders"
echo "   - Click 'Try it out'"
echo "   - Fill in: {\"item_name\":\"Test Item\",\"amount\":99.99,\"status\":\"pending\"}"
echo "   - Click 'Execute'"
echo "   - Show 201 response"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/post-orders-success.png
echo "   ✅ Saved: screenshots/post-orders-success.png"

echo ""
echo "📸 Screenshot 7: POST /orders - Validation Error"
echo "   - Change amount to 0"
echo "   - Click 'Execute'"
echo "   - Show 400 error response"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/post-orders-error.png
echo "   ✅ Saved: screenshots/post-orders-error.png"

echo ""
echo "📸 Screenshot 8: PUT /orders/{id} - Request"
echo "   - Expand PUT /orders/{id}"
echo "   - Click 'Try it out'"
echo "   - Set id=1"
echo "   - Fill in: {\"status\":\"shipped\",\"amount\":150.00}"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/put-orders-request.png
echo "   ✅ Saved: screenshots/put-orders-request.png"

echo ""
echo "📸 Screenshot 9: PUT /orders/{id} - Response"
echo "   - Click 'Execute'"
echo "   - Show the 200 success response"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/put-orders-response.png
echo "   ✅ Saved: screenshots/put-orders-response.png"

echo ""
echo "📸 Screenshot 10: DELETE /orders/{id} - Success"
echo "   - Expand DELETE /orders/{id}"
echo "   - Click 'Try it out'"
echo "   - Set id=60"
echo "   - Click 'Execute'"
echo "   - Show 204 response"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/delete-orders-success.png
echo "   ✅ Saved: screenshots/delete-orders-success.png"

echo ""
echo "📸 Screenshot 11: DELETE /orders/{id} - Not Found"
echo "   - Change id=9999"
echo "   - Click 'Execute'"
echo "   - Show 404 error"
read -p "Press Enter to capture (you have 5 seconds)..."
sleep 5
screencapture -w screenshots/delete-orders-notfound.png
echo "   ✅ Saved: screenshots/delete-orders-notfound.png"

echo ""
echo "🎉 All screenshots captured!"
echo ""
echo "📁 Screenshots saved in: screenshots/"
ls -lh screenshots/*.png
echo ""
echo "✅ Done! You can now use these screenshots in your documentation."
