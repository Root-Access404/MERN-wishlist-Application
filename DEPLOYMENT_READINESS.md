# Deployment readiness

This application remains a simple MERN Wishlist application and is prepared for the following AWS deployment contract:

- React frontend built with Create React App and deployed to S3 behind CloudFront.
- Node.js/Express backend running on private EC2 instances behind an internet-facing ALB.
- MongoDB Atlas accessed by the backend through an environment variable.

## Backend

The backend listens on `PORT`, defaulting to **3000**, and binds to `0.0.0.0` so the ALB can reach private EC2 instances.

ALB health check:

```text
GET /health
```

The endpoint returns HTTP 200 with `{ "status": "ok" }` and does not require MongoDB connectivity.

Required backend variables:

```dotenv
PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000
```

`FRONTEND_URL` may contain a comma-separated list of exact browser origins. In AWS, set it to the deployed CloudFront origin, for example `https://<cloudfront-domain>`.

`MONGO_URI` remains accepted as a backwards-compatible alias, but new deployments should use `MONGODB_URI`.

## Frontend

The frontend uses Create React App. Set the API origin at build time using:

```dotenv
REACT_APP_API_URL=http://localhost:3000
```

Production should use the HTTPS API/ALB domain, without a trailing slash, for example:

```dotenv
REACT_APP_API_URL=https://<api-domain>
```

API paths are supplied by the application as `/api/wishlist` and `/api/wishlist/add`; do not append `/api` to the configured origin.

Build the static files with:

```bash
cd frontend
npm install
REACT_APP_API_URL=https://<api-domain> npm run build
```

Deploy the resulting `frontend/build/` directory to S3 and serve it through CloudFront.

## Local development

Terminal 1:

```bash
cd backend
npm install
cp .env.example .env
# Set MONGODB_URI and leave PORT=3000 and FRONTEND_URL=http://localhost:3000
npm run dev
```

Terminal 2:

```bash
cd frontend
npm install
cp .env.example .env
npm start
```

The React development server normally uses `http://localhost:3000`. If it conflicts with the backend port, choose another React development port and update `FRONTEND_URL` and `REACT_APP_API_URL` accordingly.

For production-style backend execution:

```bash
cd backend
npm start
```

## Node.js compatibility

The backend declares Node.js `>=20.19.0`, matching the installed Mongoose/MongoDB dependency requirements. No major dependency upgrade was introduced.

## AWS-side configuration still required

- Create/configure the S3 bucket and CloudFront distribution for the React build.
- Provide the final API domain or ALB DNS name to `REACT_APP_API_URL` before building.
- Configure the internet-facing ALB listener and target group to forward to port 3000.
- Configure the target group health check as `GET /health` on port 3000.
- Place backend EC2 instances in private subnets and allow ALB-to-EC2 traffic on TCP 3000 using security groups.
- Provide `MONGODB_URI`, `PORT=3000`, `NODE_ENV=production`, and the exact CloudFront origin in `FRONTEND_URL` on the EC2 instances.
- Configure MongoDB Atlas network access and database credentials securely outside Git.
- Configure HTTPS certificates/listeners and DNS as appropriate.

AWS deployment has not been performed or tested by this repository change.
