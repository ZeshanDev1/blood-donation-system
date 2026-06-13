# Blood Donor Management System - Setup Guide

This is a full-stack application for managing blood donations with a separate Node.js/Express backend and Next.js frontend.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (free tier available)

## Project Structure

```
blood-donor-app/
├── app/                      # Next.js frontend
├── components/               # React components
├── lib/                       # Utilities and context
├── backend/                   # Express.js backend
│   ├── config/               # Database configuration
│   ├── models/               # MongoDB schemas
│   ├── controllers/          # Route handlers
│   ├── routes/               # API routes
│   ├── middleware/           # Authentication middleware
│   └── server.js             # Main server file
└── SETUP.md                  # This file
```

## Backend Setup

### 1. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account or sign in
3. Create a new project named "blood-donor-app"
4. Create a database cluster (select the free tier)
5. Create a database user with username and password
6. Get your connection string (it will look like: `mongodb+srv://username:password@cluster-name.mongodb.net/blood-donor-db`)

### 2. Backend Installation and Configuration

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file
cp .env.example .env

# Edit .env with your MongoDB connection string
# MONGODB_URI=mongodb+srv://username:password@cluster-name.mongodb.net/blood-donor-db
# JWT_SECRET=your_secret_key_here
```

### 3. Start the Backend Server

```bash
# From the backend directory
npm start

# The server will run on http://localhost:5000
```

## Frontend Setup

### 1. Installation

```bash
# From the root directory (blood-donor-app)
npm install
# or
yarn install
```

### 2. Start the Frontend

```bash
# From the root directory
npm run dev
# or
yarn dev

# The frontend will be available at http://localhost:3000
```

## Running the Application

Make sure both servers are running:

1. **Backend**: `http://localhost:5000` (Express server)
2. **Frontend**: `http://localhost:3000` (Next.js dev server)

## Features

### For Blood Donors
- Register with blood type information
- View donation history
- Check eligibility status
- Schedule new donations
- Update profile information
- Track donation statistics

### For Patients
- Register and create blood requests
- Specify blood type needed and quantity
- Set urgency level
- Search for available donors
- Contact donors directly
- Track request status

### Authentication
- JWT-based authentication
- Role-based access control (donor/patient)
- Secure password hashing with bcrypt
- Protected routes and API endpoints

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Donors
- `GET /api/donors/:id` - Get donor profile
- `PUT /api/donors/:id` - Update donor profile
- `GET /api/donors/search?bloodType=X` - Search donors by blood type
- `GET /api/donations/history/:donorId` - Get donation history
- `POST /api/donations/schedule` - Schedule a donation

### Patients
- `GET /api/patients/:id` - Get patient profile
- `POST /api/requests/create` - Create blood request
- `GET /api/requests/patient/:patientId` - Get patient's requests
- `GET /api/requests/:id` - Get request details

### Blood Requests
- `POST /api/requests/create` - Create new request
- `GET /api/requests/patient/:patientId` - Get patient requests
- `PUT /api/requests/:id` - Update request status

## Troubleshooting

### Backend Connection Issues
- Ensure MongoDB Atlas connection string is correct
- Check that the MongoDB user has database access
- Verify JWT_SECRET is set in .env
- Check that port 5000 is not in use

### Frontend Connection Issues
- Ensure backend is running on port 5000
- Check browser console for CORS errors
- Verify API requests are using `http://localhost:5000`

### Authentication Issues
- Clear browser localStorage and try logging in again
- Check that tokens are being stored correctly
- Verify JWT_SECRET matches between frontend and backend

## Database Schema

### Users
```javascript
{
  _id: ObjectId,
  email: String (unique),
  name: String,
  password: String (hashed),
  phone: String,
  address: String,
  role: String (donor|patient),
  // Donor specific fields
  donorInfo: {
    bloodType: String,
    lastDonationDate: Date,
    totalDonations: Number,
    isDonationEligible: Boolean,
    nextEligibleDate: Date
  },
  // Patient specific fields
  patientInfo: {
    bloodType: String,
    medicalCondition: String,
    hospitalName: String,
    doctorName: String
  }
}
```

### Blood Requests
```javascript
{
  _id: ObjectId,
  patientId: ObjectId,
  bloodType: String,
  quantity: Number,
  urgency: String,
  date: Date,
  status: String (open|fulfilled|cancelled),
  createdAt: Date
}
```

### Donations
```javascript
{
  _id: ObjectId,
  donorId: ObjectId,
  date: Date,
  bloodType: String,
  quantity: Number,
  location: String,
  status: String (completed|pending|cancelled)
}
```

## Development

### Frontend Technologies
- Next.js 15+
- React 19+
- TypeScript
- Tailwind CSS
- Shadcn/UI components

### Backend Technologies
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Deployment

### Backend Deployment (Vercel, Railway, Heroku, etc.)
1. Set environment variables (MONGODB_URI, JWT_SECRET)
2. Deploy backend server
3. Update frontend API endpoint to production URL

### Frontend Deployment (Vercel)
1. Update API endpoint in authContext.tsx to production backend URL
2. Push to GitHub
3. Deploy via Vercel

## Additional Notes

- The application uses JWT tokens stored in localStorage
- All API requests include the JWT token in the Authorization header
- Passwords are hashed using bcrypt with 10 salt rounds
- Donation eligibility is calculated based on last donation date (56-day gap required)
- Role-based access control prevents patients from accessing donor endpoints and vice versa

## Support

For issues or questions, please check the backend logs and browser console for error messages.

## License

This project is created for educational purposes.
