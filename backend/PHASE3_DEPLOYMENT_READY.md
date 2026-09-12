═══════════════════════════════════════════════════════════════════════════════
                     PHASE 3 — BACKEND APPLICATION
                         DEPLOYMENT READY CHECKLIST
═══════════════════════════════════════════════════════════════════════════════

PROJECT: MERN Wishlist Application
PHASE: 3 (Backend Application) 
STATUS: ✅ PRODUCTION-READY FOR EC2 DEPLOYMENT

───────────────────────────────────────────────────────────────────────────────
CORE REQUIREMENTS STATUS
───────────────────────────────────────────────────────────────────────────────

✅ Project Structure
   └─ backend/
      ├── server.js              ✅ Production-ready entry point
      ├── package.json           ✅ Correct start command
      ├── config/db.js           ✅ Fixed: No process.exit() on DB failure
      ├── routes/                ✅ API routes configured
      ├── models/                ✅ Database models
      ├── utils/logger.js        ✅ Structured logging
      └── .env.example           ✅ Updated with FRONTEND_URL

✅ Start Command
   "start": "NODE_ENV=production node server.js"
   → Uses node directly (no nodemon in production)
   → Sets NODE_ENV=production automatically
   → ALB will invoke: npm start

✅ Health Check Endpoint
   GET /health → HTTP 200
   Response: { status: 'healthy', timestamp, uptime, environment }
   → Does NOT require database connectivity
   → ALB Target Group health checks every 30 seconds
   → Instance will NOT be terminated if DB is temporarily down

✅ Graceful Shutdown
   → SIGTERM handler: Closes HTTP server, closes DB connection
   → SIGINT handler: Same behavior (for local debugging)
   → 10-second timeout: Forces exit if shutdown hangs
   → ALB connection draining: Works with this handler

✅ Server Binding
   app.listen(PORT, '0.0.0.0', ...)
   → Listens on all interfaces (0.0.0.0)
   → ALB in private subnet can reach app on internal IP
   → NOT limited to localhost

✅ CORS Configuration
   origin: process.env.FRONTEND_URL || '*'
   credentials: true
   → Local dev: Allows all origins (dev convenience)
   → Production: Locked to CloudFront domain via FRONTEND_URL env var
   → Tightened in Phase 6 when CloudFront is deployed

✅ Dependencies
   ✅ express: ^5.2.1
   ✅ mongoose: ^9.6.2
   ✅ dotenv: ^17.4.2
   ✅ cors: ^2.8.6
   ✅ nodemon: ^3.1.14 (devDependency only)

✅ Error Handling
   ✅ Global error handler: Catches all errors
   ✅ 404 handler: Returns { error: 'Route not found' }
   ✅ Unhandled rejection handler: Logs and continues
   ✅ Uncaught exception handler: Logs and exits

✅ .gitignore
   ✅ node_modules/
   ✅ .env (prevents secrets from being committed)
   ✅ .env.local
   ✅ *.log
   ✅ dist/, build/
   Secrets are SAFE from accidental Git commits

✅ Logging
   ✅ Structured logging via logger utility
   ✅ Logs to console (CloudWatch for EC2)
   ✅ Logs to daily rotating files (backend/logs/)
   ✅ Includes timestamps, levels, request duration

───────────────────────────────────────────────────────────────────────────────
CRITICAL FIXES APPLIED (Deployment-Ready Updates)
───────────────────────────────────────────────────────────────────────────────

FIX #1: backend/config/db.js
  ❌ OLD: process.exit(1) on MongoDB connection failure
         → Would crash the app if Atlas was unreachable
         → ASG would loop trying to restart crashed instances
         → ALB health checks would fail

  ✅ NEW: Removed process.exit(1)
         → Logs warning if MONGO_URI is missing
         → Logs error but continues if connection fails
         → /health endpoint returns 200 (ALB keeps instance)
         → API routes return 503 if they need DB but it's down
         → App stays running and recovers when DB is available again

FIX #2: backend/server.js
  ❌ OLD: app.listen(PORT, ...)
         → Defaults to localhost only
         → ALB cannot reach it from private subnet

  ✅ NEW: app.listen(PORT, '0.0.0.0', ...)
         → Listens on all interfaces
         → ALB can reach via internal IP (10.x.x.x)
         → Health check succeeds

FIX #3: backend/server.js CORS
  ❌ OLD: app.use(cors())
         → Allows ALL origins (security risk in production)

  ✅ NEW: app.use(cors({
           origin: process.env.FRONTEND_URL || '*',
           credentials: true
         }))
         → Local dev: '*' (convenient)
         → EC2 production: Locked to FRONTEND_URL env var
         → Set FRONTEND_URL to CloudFront domain in Phase 6

FIX #4: backend/.env.example
  ❌ OLD: Missing FRONTEND_URL example

  ✅ NEW: Added FRONTEND_URL with:
         → Explanation of use case
         → Note that it's updated in Phase 6
         → Default: http://localhost:3000 for local dev

───────────────────────────────────────────────────────────────────────────────
EC2 DEPLOYMENT VARIABLES (Phase 4 — User-Data Script)
───────────────────────────────────────────────────────────────────────────────

When you deploy to EC2, the Launch Template user-data script will set these
environment variables. The app reads them via process.env:

export NODE_ENV=production
export PORT=5000
export MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/wishlist_db
export FRONTEND_URL=https://your-cloudfront-domain.cloudfront.net

✅ NO .env file on EC2 (it stays local-only)
✅ Variables injected at instance launch time
✅ Secrets NOT stored in AMI or Git
✅ Future: Move MONGO_URI to AWS Secrets Manager (Phase 7)

───────────────────────────────────────────────────────────────────────────────
LOCAL VERIFICATION (Before Pushing)
───────────────────────────────────────────────────────────────────────────────

Run these commands to verify everything works locally:

1. Install dependencies
   $ cd backend
   $ npm install

2. Create .env file (local dev only)
   $ cp .env.example .env
   $ # Edit .env and fill in your MongoDB Atlas connection string

3. Start the server
   $ npm start
   Expected output:
     [timestamp] [INFO] Attempting to connect to MongoDB...
     [timestamp] [INFO] MongoDB Connected: <your-cluster>
     [timestamp] [INFO] Server running on port 5000 in production mode
     [timestamp] [INFO] Health check: http://0.0.0.0:5000/health

4. Test health endpoint (open new terminal)
   $ curl http://localhost:5000/health
   Expected: HTTP 200 with JSON
   {
     "status": "healthy",
     "timestamp": "2026-09-12T19:00:00.000Z",
     "uptime": 2.345,
     "environment": "production"
   }

5. Test API routes
   $ curl http://localhost:5000/api/wishlist

6. Test graceful shutdown
   $ # In server terminal, press Ctrl+C
   Expected output:
     [timestamp] [INFO] Received SIGINT, starting graceful shutdown...
     [timestamp] [INFO] HTTP server closed
     [timestamp] [INFO] MongoDB connection closed

───────────────────────────────────────────────────────────────────────────────
WHAT'S NEXT: PHASE 4 - COMPUTE (AWS EC2)
───────────────────────────────────────────────────────────────────────────────

Phase 4 will deploy this app to EC2 with:

✅ VPC with public and private subnets
✅ Application Load Balancer (ALB) in public subnet
   → Listens on port 80 (HTTP) / 443 (HTTPS)
   → Forwards to backend on port 5000 in private subnet
   → Health check: GET /health every 30 seconds

✅ Auto Scaling Group (ASG) in private subnet
   → 2 EC2 instances (minimum)
   → Launch Template with user-data script
   → User-data sets env vars and runs: npm start
   → Instances can reach MongoDB Atlas via VPC endpoint

✅ Security Groups
   → ALB: Inbound 80/443 from Internet (0.0.0.0/0)
   → EC2: Inbound 5000 from ALB security group only
   → EC2: Outbound 27017 to MongoDB Atlas (via security group)

✅ Monitoring
   → CloudWatch Logs: /aws/ec2/mern-wishlist
   → CloudWatch Metrics: CPU, memory, network
   → ALB Target Group metrics: Active connections, response time
   → ASG metrics: In-service instance count, scaling activities

───────────────────────────────────────────────────────────────────────────────
CRITICAL TESTING IN PHASE 4
───────────────────────────────────────────────────────────────────────────────

After Phase 4 EC2 deployment, verify:

✅ /health endpoint returns 200 (ALB health check passes)
✅ Database connection is established (check logs)
✅ API routes are reachable via ALB (test /api/wishlist)
✅ Graceful shutdown works (test ASG scale-in event)
✅ Auto Scaling Group scales up/down based on demand
✅ Logs appear in CloudWatch
✅ No instance crashes in first 5 minutes

───────────────────────────────────────────────────────────────────────────────
FILES MODIFIED FOR DEPLOYMENT
───────────────────────────────────────────────────────────────────────────────

Commit 1: backend/.env.example
  → Added FRONTEND_URL example
  → Added production deployment notes

Commit 2: backend/server.js
  → Bind to 0.0.0.0 instead of localhost
  → CORS locked to FRONTEND_URL env var
  → Added inline comments explaining production requirements

Commit 3: backend/config/db.js
  → Removed process.exit(1) on connection failure
  → MONGO_URI validation changed to warning
  → App continues if DB is unavailable
  → /health endpoint always returns 200

All files are now Git-committed and ready for Phase 4.

═══════════════════════════════════════════════════════════════════════════════
                        ✅ DEPLOYMENT READY
═══════════════════════════════════════════════════════════════════════════════

Your backend is production-ready for EC2 deployment.

Next Steps:
  1. Verify locally: cd backend && npm start && curl http://localhost:5000/health
  2. Push to GitHub (already done)
  3. Proceed to Phase 4: Build Launch Template, ALB, ASG, and deploy to EC2

Questions? Check the Phase 3 section in your deployment guide.
