# MERN Wishlist Application

A minimal MERN (MongoDB, Express, React, Node) wishlist application that demonstrates a simple CRUD API and a React frontend using that API. This repository contains a Node/Express backend (backend folder) and a React frontend (frontend folder).

##  Production-Ready Features

**Health Check Endpoint** - `/health` for monitoring and load balancer health checks
**Graceful Shutdown** - Handles SIGTERM and SIGINT signals properly
**Structured Logging** - Daily log files with timestamps and log levels
**Environment Configuration** - Environment-based API URL switching
**Input Validation** - Request validation middleware on all endpoints
**Error Handling** - Global error handlers and proper error responses
**CORS Enabled** - Cross-origin resource sharing configured
**Request Logging** - HTTP request/response logging with duration tracking

## Stack

- **Language(s)**: JavaScript, HTML, CSS
- **Backend**: Node.js + Express, Mongoose for MongoDB
- **Frontend**: React (Create React App)
- **Notable packages**: express, mongoose, cors, dotenv (backend); react, axios (frontend)

## Features

- Add, list, update, and delete wishlist items
- Backend exposes a REST API under `/api/wishlist`
- Frontend consumes the API and provides a simple UI
- Health check endpoint for monitoring
- Comprehensive error handling and logging
- Production-ready configuration

## Repo structure

```
backend/                       # Express API + models and routes
  package.json                 # backend scripts (start, dev)
  server.js                    # server entrypoint with graceful shutdown
  .env.example                 # environment configuration template
  config/
    db.js                      # database connection (uses MONGO_URI)
  models/
    Wishlist.js                # Mongoose schema for wishlist item
  routes/
    wishlistRoutes.js          # CRUD routes for /api/wishlist with validation
  utils/
    logger.js                  # logging utility

frontend/                      # React app (Create React App)
  package.json                 # frontend scripts (start, build, test)
  .env.example                 # environment configuration template
  public/
    index.html
  src/
    App.js
    config/
      api.js                   # environment-based API configuration
    components/
      WishList.js
      WishlistForm.js

README.md
.gitignore
```

## Environment Setup

### Backend

The backend reads configuration from environment variables. Copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Then edit `backend/.env` with your configuration:

```env
# Server Port
PORT=5000

# Node Environment
NODE_ENV=development

# MongoDB URI - Required
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

**MongoDB Atlas Setup:**
- Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Set your connection string in `MONGO_URI`
- For production, ensure IP whitelist is configured (not 0.0.0.0/0)

### Frontend

The frontend loads the API URL from environment variables. Copy `.env.example` to `.env`:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000

# Environment
REACT_APP_ENV=development
```

For production deployments, set `REACT_APP_API_URL` to your production API URL.

## How to run (development)

Start the backend and frontend in separate terminals.

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGO_URI
npm run dev      # uses nodemon for development
```

The backend listens on `process.env.PORT` (default 5000) and exposes:
- `GET  /api/wishlist`       - list all items
- `POST /api/wishlist/add`   - add a new item
- `PUT  /api/wishlist/:id`   - update an item
- `DELETE /api/wishlist/:id` - delete an item
- `GET  /health`             - health check endpoint

### 2) Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The frontend runs on `http://localhost:3000` and is configured to call the backend API at the URL specified in `.env`.

## Production Deployment

### Backend

1. Set environment variables:
   ```bash
   export NODE_ENV=production
   export PORT=8080
   export MONGO_URI=your_production_mongodb_uri
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will:
- Log all requests to daily log files in `logs/` directory
- Respond to health checks at `/health`
- Gracefully shutdown on SIGTERM/SIGINT signals
- Handle all errors properly

### Frontend

1. Build for production:
   ```bash
   npm run build
   ```

2. Set production API URL in `.env`:
   ```env
   REACT_APP_API_URL=https://your-api-domain.com
   ```

3. Deploy the `build/` folder to your hosting service

### Docker (Optional)

You can containerize both services for easy deployment.

## Package scripts

### Backend (backend/package.json)
- `start`: `NODE_ENV=production node server.js` - Production start
- `dev`: `nodemon server.js` - Development with auto-reload

### Frontend (frontend/package.json - Create React App)
- `start`: `react-scripts start` - Development server
- `build`: `react-scripts build` - Production build
- `test`: `react-scripts test` - Run tests
- `eject`: `react-scripts eject` - Eject configuration

## Data Model (backend/models/Wishlist.js)

The Wishlist schema contains:
- `name`: String (required) - Product name
- `price`: Number (required) - Product price
- `link`: String (optional) - Product URL
- `remark`: String (optional) - User remarks
- `timestamps`: createdAt / updatedAt - Auto-managed timestamps

## API Response Examples

### Health Check
```bash
GET /health
```
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### List Items
```bash
GET /api/wishlist
```
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Laptop",
    "price": 999,
    "link": "https://example.com/laptop",
    "remark": "Gaming laptop",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

### Create Item
```bash
POST /api/wishlist/add
Content-Type: application/json

{
  "name": "Laptop",
  "price": 999,
  "link": "https://example.com/laptop",
  "remark": "Gaming laptop"
}
```

Response:
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Laptop",
  "price": 999,
  "link": "https://example.com/laptop",
  "remark": "Gaming laptop",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

## Logging

All server logs are written to `backend/logs/app-YYYY-MM-DD.log`. Log levels include:
- `[INFO]` - Informational messages
- `[ERROR]` - Error messages
- `[WARN]` - Warning messages
- `[DEBUG]` - Debug messages (only in development)

Example log entry:
```
[2024-01-15T10:30:00.000Z] [INFO] Server running on port 5000 in production mode
[2024-01-15T10:30:01.234Z] [INFO] GET /api/wishlist 200 45ms
[2024-01-15T10:30:02.567Z] [INFO] Creating new wishlist item
[2024-01-15T10:30:02.890Z] [INFO] Wishlist item created 507f1f77bcf86cd799439011
```

## Troubleshooting

### Database Connection Issues
- Ensure `MONGO_URI` is set correctly
- Check MongoDB Atlas IP whitelist includes your server IP
- Verify database user credentials and permissions

### API Connection Issues
- Ensure backend is running and accessible
- Check `REACT_APP_API_URL` in frontend `.env` is correct
- Verify CORS is enabled on backend (default)
- Check browser console for specific error messages

### Port Already in Use
- Backend: `lsof -i :5000` and kill the process
- Frontend: `lsof -i :3000` and kill the process

### Production Deployment
- Use environment variables for all configuration
- Never commit `.env` files to source control
- Use strong MongoDB credentials
- Monitor logs regularly for errors
- Set up proper error alerting

## Next Steps

- 🔐 Add authentication to protect API endpoints
- 🧪 Add comprehensive unit and integration tests
- 🎨 Enhance UI with sorting, filtering, and search
- 📱 Add responsive mobile design
- 🔔 Add real-time updates with WebSockets
- 📦 Add Docker support for easy deployment
- 🚀 Set up CI/CD pipeline
