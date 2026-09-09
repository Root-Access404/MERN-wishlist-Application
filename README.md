# MERN Wishlist Application

A minimal MERN (MongoDB, Express, React, Node) wishlist application that demonstrates a simple CRUD API and a React frontend using that API. This repository contains a Node/Express backend and a React frontend designed for deployment to AWS infrastructure.

## Production-Ready Features

- **Health Check Endpoint** - `/health` for monitoring and load balancer health checks
- **Graceful Shutdown** - Handles SIGTERM and SIGINT signals properly
- **Structured Logging** - Daily log files with timestamps and log levels
- **Environment Configuration** - Environment-based API URL switching for development, staging, and production
- **Input Validation** - Request validation middleware on all API endpoints
- **Error Handling** - Global error handlers and proper HTTP status codes
- **CORS Enabled** - Cross-origin resource sharing configured
- **Request Logging** - HTTP request/response logging with duration tracking
- **No Hardcoded Secrets** - All configuration via environment variables
- **Database Connection Management** - Proper MongoDB connection with retry logic

## Stack

- **Language(s)**: JavaScript, HTML, CSS
- **Backend**: Node.js + Express, Mongoose for MongoDB
- **Frontend**: React (Create React App)
- **Database**: MongoDB Atlas
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

# Node Environment (development, production)
NODE_ENV=development

# MongoDB URI - Required
# For MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/wishlist_db?retryWrites=true&w=majority
# For local MongoDB:
# MONGO_URI=mongodb://localhost:27017/wishlist_db
MONGO_URI=
```

**MongoDB Atlas Setup:**
- Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Set your connection string in `MONGO_URI`
- For production, ensure IP whitelist is configured properly (restrict to your application's IP)
- Never commit real MongoDB credentials

### Frontend

The frontend loads the API URL from environment variables. Copy `.env.example` to `.env`:

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
# Backend API URL
# Development: http://localhost:5000
# Production: https://your-api-domain.com
REACT_APP_API_URL=http://localhost:5000

# Environment (development, production, staging)
REACT_APP_ENV=development
```

**Important**: Do NOT hardcode production domain in the repository. The DevOps engineer will provide environment-specific configuration during deployment.

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

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment variables:
   ```bash
   export NODE_ENV=production
   export PORT=5000
   export MONGO_URI=your_production_mongodb_uri
   ```

3. Start the server:
   ```bash
   npm start
   ```

The server will:
- Log all requests to daily log files in `logs/` directory
- Respond to health checks at `/health`
- Gracefully shutdown on SIGTERM/SIGINT signals
- Handle all errors properly without exposing sensitive information

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set production API URL in `.env`:
   ```env
   REACT_APP_API_URL=https://api.your-domain.com
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Deploy the `build/` folder to your static hosting service (e.g., S3 + CloudFront)

## AWS Three-Tier Architecture

This application is designed for deployment to the following AWS architecture:

```
Internet
|
+--> CloudFront --> S3 --> React frontend
|
+--> ALB --> Private EC2 instances (Port 5000) --> Node.js/Express
                                                    |
                                                    +--> MongoDB Atlas
```

**Backend Requirements:**
- Runs on port 5000 (configurable via PORT environment variable)
- Health check endpoint at `/health` responds with HTTP 200
- Connects to MongoDB Atlas via MONGO_URI environment variable
- Gracefully handles SIGTERM for clean shutdown during instance termination
- All configuration externalized via environment variables

**Frontend Requirements:**
- Static build artifact deployed to S3
- API URL configured at build time via REACT_APP_API_URL environment variable
- Works behind CloudFront CDN

## Package scripts

### Backend (backend/package.json)
- `start`: `NODE_ENV=production node server.js` - Production start
- `dev`: `nodemon server.js` - Development with auto-reload

### Frontend (frontend/package.json - Create React App)
- `start`: `react-scripts start` - Development server
- `build`: `react-scripts build` - Production build
- `test`: `react-scripts test` - Run tests
- `eject`: `react-scripts eject` - Eject configuration (irreversible)

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

Response (HTTP 201):
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

### Update Item
```bash
PUT /api/wishlist/:id
Content-Type: application/json

{
  "name": "Gaming Laptop",
  "price": 1299,
  "remark": "High-end gaming laptop"
}
```

### Delete Item
```bash
DELETE /api/wishlist/:id
```

Response:
```json
{
  "message": "Item deleted successfully"
}
```

## Logging

All server logs are written to `backend/logs/app-YYYY-MM-DD.log`. Log levels include:
- `[INFO]` - Informational messages (startup, requests, operations)
- `[ERROR]` - Error messages
- `[WARN]` - Warning messages
- `[DEBUG]` - Debug messages (only in development mode)

Example log entry:
```
[2024-01-15T10:30:00.000Z] [INFO] Server running on port 5000 in production mode
[2024-01-15T10:30:01.234Z] [INFO] GET /api/wishlist 200 45ms
[2024-01-15T10:30:02.567Z] [INFO] Creating new wishlist item
[2024-01-15T10:30:02.890Z] [INFO] Wishlist item created 507f1f77bcf86cd799439011
```

## Environment Variables Reference

### Backend (backend/.env)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `PORT` | Server port | `5000` | No (default: 5000) |
| `NODE_ENV` | Execution environment | `production` | No (default: development) |
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` | **Yes** |

### Frontend (frontend/.env)

| Variable | Purpose | Example | Required |
|----------|---------|---------|----------|
| `REACT_APP_API_URL` | Backend API URL | `https://api.example.com` | No (default: http://localhost:5000) |
| `REACT_APP_ENV` | Environment name | `production` | No (default: development) |

**⚠️ CRITICAL: Never commit real secrets, connection strings, or API keys. Use `.env.example` as a template only.**

## Deployment Readiness Checklist

Before deploying to AWS, verify the following:

- [ ] Application runs locally without errors
- [ ] Backend starts with `npm start` in production mode
- [ ] Frontend builds successfully with `npm run build`
- [ ] MongoDB Atlas connection works (test with backend running)
- [ ] `/health` endpoint returns HTTP 200 with valid JSON
- [ ] No hardcoded production IP addresses or domains in code
- [ ] No hardcoded production URLs (all via REACT_APP_API_URL)
- [ ] No secrets (passwords, tokens, keys) committed to git
- [ ] `.env.example` exists and documents all required variables
- [ ] `.env` is in `.gitignore` and not committed
- [ ] Frontend API URL is configurable via environment variables
- [ ] Existing wishlist CRUD APIs work (GET, POST, PUT, DELETE)
- [ ] Backend gracefully handles SIGTERM signal
- [ ] Logs are written to `backend/logs/` directory
- [ ] Database connection fails clearly if MONGO_URI not set

## Troubleshooting

### Database Connection Issues
- Ensure `MONGO_URI` is set correctly in `.env`
- Check MongoDB Atlas IP whitelist includes your server's IP
- Verify database user credentials and permissions
- Check network connectivity to MongoDB Atlas cluster

### API Connection Issues
- Ensure backend is running and accessible
- Check `REACT_APP_API_URL` in frontend `.env` is correct
- Verify CORS is enabled on backend (default)
- Check browser console for specific error messages

### Port Already in Use
- Backend: `lsof -i :5000` and kill the process
- Frontend: `lsof -i :3000` and kill the process

### Production Deployment Issues
- Use environment variables for all configuration
- Never commit `.env` files to source control
- Use strong MongoDB credentials
- Monitor logs regularly for errors
- Ensure ALB health check is configured to hit `/health` endpoint

## Deployment Handoff for DevOps

This application is designed for environment-agnostic deployment:

1. **No code changes needed** - All configuration is externalized via environment variables
2. **Backend deployment** - Provide `PORT`, `NODE_ENV`, and `MONGO_URI` environment variables
3. **Frontend deployment** - Build with `npm run build`, provide `REACT_APP_API_URL` at build time, deploy `build/` folder to static hosting
4. **Health checks** - ALB can be configured to check `/health` endpoint (no authentication required)
5. **Graceful shutdown** - Application automatically handles SIGTERM signals
6. **Monitoring** - All important events logged to `backend/logs/`

No source code modifications are required for different environments.

## Next Steps

- 🔐 Add authentication to protect API endpoints
- 🧪 Add comprehensive unit and integration tests
- 🎨 Enhance UI with sorting, filtering, and search
- 📱 Add responsive mobile design
- 🔔 Add real-time updates with WebSockets
- 🚀 Set up CI/CD pipeline with GitHub Actions
