# Blood Donor Management System - Quick Start

## 30-Second Setup

### Step 1: Get MongoDB
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account → Create project → Create cluster (free tier)
3. Create a database user with a password
4. Get your connection string: `mongodb+srv://user:password@cluster.mongodb.net/blood-donor-db`

### Step 2: Backend Setup
```bash
cd backend
npm install
echo 'MONGODB_URI=your_connection_string' > .env
echo 'JWT_SECRET=your_secret_key' >> .env
npm start
# Server runs on http://localhost:5000
```

### Step 3: Frontend Setup
```bash
# In a new terminal (from root directory)
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Step 4: Access the App
Open http://localhost:3000 in your browser

## Test the App

### Register as a Donor
1. Click "Get Started" → Select "Blood Donor"
2. Fill in details (blood type: O+, A+, B+, or AB+)
3. Create account

### Register as a Patient
1. Click "Get Started" → Select "Patient in Need"
2. Fill in medical details and blood type needed
3. Create account

### Donor Dashboard
- View donation history
- Check eligibility status
- Update profile
- Schedule donations

### Patient Dashboard
- Create blood requests
- Search for available donors
- View request status
- Contact donors

## API Endpoints (for reference)

```
Authentication:
POST /api/auth/register
POST /api/auth/login

Donors:
GET /api/donors/:id
PUT /api/donors/:id
GET /api/donations/history/:donorId
POST /api/donations/schedule
GET /api/donors/search?bloodType=O+

Patients:
POST /api/requests/create
GET /api/requests/patient/:id
GET /api/donors/search?bloodType=X

Blood Requests:
POST /api/requests/create
GET /api/requests/patient/:patientId
```

## Common Issues

**Backend won't start?**
- Check MongoDB connection string in `backend/.env`
- Ensure port 5000 is not in use
- Verify MongoDB user credentials

**Frontend can't connect to backend?**
- Ensure backend is running on http://localhost:5000
- Check browser console for errors
- Clear localStorage and refresh

**Can't register?**
- Ensure email is unique
- Check password is at least 6 characters
- Verify all required fields are filled

## Project Structure

```
├── app/                    # Next.js pages
│   ├── page.tsx           # Home page
│   ├── login/page.tsx     # Login page
│   ├── register/page.tsx  # Registration page
│   ├── dashboard/page.tsx # Main dashboard
│   └── layout.tsx         # Root layout
├── components/
│   ├── dashboards/        # DonorDashboard, PatientDashboard
│   ├── donors/            # Donor-specific components
│   ├── patients/          # Patient-specific components
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── authContext.tsx    # Authentication context
│   └── ProtectedRoute.tsx # Route protection
├── backend/
│   ├── server.js          # Express server
│   ├── models/            # MongoDB schemas
│   ├── controllers/       # API handlers
│   ├── routes/            # API routes
│   └── config/db.js       # Database config
└── SETUP.md               # Detailed setup guide
```

## Technology Stack

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Shadcn/UI

**Backend:**
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Bcrypt

## Next Steps

1. Set up MongoDB Atlas (free tier is sufficient)
2. Follow Step 1-3 above
3. Test registration for both roles
4. Explore the dashboards
5. Create blood requests or schedule donations

## Documentation

For detailed information, see `SETUP.md`

## Need Help?

Check the console logs for error messages and verify:
- MongoDB connection string is correct
- Both backend and frontend are running
- You're using the correct URLs (http://localhost:3000 and http://localhost:5000)
- Environment variables are set correctly in backend/.env
