# MERN Wishlist Application

A minimal MERN (MongoDB, Express, React, Node) wishlist application that demonstrates a simple CRUD API and a React frontend using that API. This repository contains a Node/Express backend (backend/) and a Create React App frontend (frontend/).

## Stack
- Language(s): JavaScript, HTML, CSS
- Backend: Node.js + Express, Mongoose for MongoDB
- Frontend: React (Create React App)
- Notable packages: express, mongoose, cors, dotenv (backend); react, axios (frontend)

## Features
- Add, list, update, and delete wishlist items
- Backend exposes a REST API under `/api/wishlist`
- Frontend consumes the API and provides a simple UI (components/WishList.js, components/WishlistForm.js)

## Repo structure
```
backend/                 # Express API + models and routes
  package.json           # backend scripts (start, dev)
  server.js              # server entrypoint
  config/
    db.js                # database connection (uses MONGO_URI)
  models/
    Wishlist.js          # Mongoose schema for wishlist item
  routes/
    wishlistRoutes.js    # CRUD routes for /api/wishlist

frontend/                # React app (Create React App)
  package.json           # frontend scripts (start, build, test)
  public/
    index.html
  src/
    App.js
    components/
      WishList.js
      WishlistForm.js

README.md
.gitignore
```

## Environment
The backend reads the MongoDB connection string from the MONGO_URI environment variable.

If you are using MongoDB Atlas (recommended for hosted development), create a cluster and set MONGO_URI to your Atlas connection string, for example:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority
```

Make sure:
- Your Atlas cluster allows connections from your development IP (or add 0.0.0.0/0 for testing — not recommended for production).
- The database user has the required privileges.

You can place environment variables in a `.env` file inside `backend/` (the repo already uses `dotenv`), for example:

```
# backend/.env
MONGO_URI=mongodb+srv://user:pass@cluster0.mongodb.net/wishlist_db?retryWrites=true&w=majority
PORT=5000
```

Do NOT commit your `.env` to source control.

## How to run (development)
Start the backend and frontend in separate terminals.

1) Backend

```bash
cd backend
npm install
# create backend/.env with MONGO_URI (see above)
npm run dev      # uses nodemon (script: dev)
# or: npm start  # runs node server.js (script: start)
```

The backend listens on `process.env.PORT` or `5000` by default and exposes:
- GET  /api/wishlist       - list items
- POST /api/wishlist/add   - add an item
- PUT  /api/wishlist/:id   - update an item
- DELETE /api/wishlist/:id - delete an item

2) Frontend

```bash
cd frontend
npm install
npm start
```

The frontend runs on `http://localhost:3000` by default and is configured to call the backend API (CORS is enabled on the backend).

## Package scripts
- backend/package.json
  - `start`: node server.js
  - `dev`: nodemon server.js

- frontend/package.json (Create React App)
  - `start`: react-scripts start
  - `build`: react-scripts build
  - `test`: react-scripts test
  - `eject`: react-scripts eject

## Model (backend/models/Wishlist.js)
The Wishlist schema contains the following fields:
- name: String (required)
- price: Number (required)
- link: String (optional)
- remark: String (optional)
- timestamps: createdAt / updatedAt

## Notes & troubleshooting
- Ensure MONGO_URI is set correctly before starting the backend. The backend connects using `process.env.MONGO_URI`.
- If you use MongoDB Atlas and see network errors, check the Atlas IP access list and database user credentials.
- For quick testing you can allow access from anywhere in Atlas (0.0.0.0/0) — but do not use this in production.

## Next steps (ideas)
- Add authentication to protect API endpoints
- Add validation and better error handling on the backend
- Add UI features (search, sort, item images)

