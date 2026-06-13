# Deployment Guide — QBDS (QIMS Blood Donors Society)

This project uses a three-tier architecture:

```
Next.js (Vercel)
      │  HTTPS API calls  (NEXT_PUBLIC_API_URL)
      ▼
Node.js / Express (Render or Railway)
      │  Mongoose
      ▼
MongoDB Atlas
```

- **Frontend**: Next.js app in the repo root → deploy to **Vercel**.
- **Backend**: Express API in `backend/` → deploy to **Render** or **Railway**.
- **Database**: **MongoDB Atlas** (managed cloud Mongo).

---

## 1. MongoDB Atlas

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Database Access** → add a user with a username/password.
3. **Network Access** → add IP `0.0.0.0/0` (allow from anywhere) so Render/Railway can connect.
4. **Connect → Drivers** → copy the connection string, e.g.:
   ```
   mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/blood-donor-db
   ```
   Keep this for the backend `MONGODB_URI`.

---

## 2. Backend → Render

The backend lives in the `backend/` folder and reads everything from environment variables.

### Option A — Manual Web Service
1. Push the repo to GitHub.
2. On [Render](https://render.com): **New + → Web Service** → connect the repo.
3. Settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/`
4. Add environment variables (see table below) and **Create Web Service**.
5. Copy the resulting URL, e.g. `https://qbds-api.onrender.com`.

### Option B — Blueprint
A `backend/render.yaml` blueprint is included. Use **New + → Blueprint** and fill in the `sync: false` secrets when prompted.

### Backend environment variables

| Key | Example | Notes |
|-----|---------|-------|
| `MONGODB_URI` | `mongodb+srv://…/blood-donor-db` | From Atlas |
| `JWT_SECRET` | a long random string | Used to sign admin tokens |
| `JWT_EXPIRE` | `7d` | Token lifetime |
| `NODE_ENV` | `production` | |
| `PORT` | *(leave unset)* | Render/Railway inject this automatically |
| `FRONTEND_URL` | `https://qbds.vercel.app` | Your Vercel domain. Comma-separate multiple. `*.vercel.app` previews are auto-allowed. |
| `ADMIN_USERNAME` | `admin` | Seeded only on first run if no admin exists |
| `ADMIN_PASSWORD` | a strong password | Seeded only on first run |
| `CLOUDINARY_URL` | `cloudinary://<key>:<secret>@<cloud>` | Image storage (see §5). Omit to use local disk. |

> **Railway** works the same way: create a project from the repo, set the root to `backend`, add the same variables. Railway provides `PORT` automatically.

---

## 3. Frontend → Vercel

1. On [Vercel](https://vercel.com): **Add New → Project** → import the repo.
2. Framework preset: **Next.js** (auto-detected). Root directory: repo root (leave default).
3. **Environment Variables** → add:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://qbds-api.onrender.com` (your backend URL, **no trailing slash**) |

   > This is read at **build time** and inlined into the browser bundle, so it must be set *before* you build. If you change it later, trigger a redeploy.
4. **Deploy**. Your site will be live at e.g. `https://qbds.vercel.app`.
5. Go back to the backend and make sure `FRONTEND_URL` includes this exact domain, then redeploy the backend.

---

## 4. Local development

Frontend (repo root):
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:5000
```
```bash
npm install
npm run dev          # http://localhost:3000
```

Backend (`backend/`):
```bash
# backend/.env  (copy from backend/.env.example)
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:3000
```
```bash
cd backend
npm install
npm run dev          # http://localhost:5000
```

---

## 5. Image storage — Cloudinary

Team / event / story images are uploaded through Cloudinary, so they persist
across restarts and redeploys (free hosting tiers have an **ephemeral filesystem**,
which would otherwise wipe local uploads).

### Set up Cloudinary
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. On the **Dashboard**, copy your **API Environment variable** — it looks like:
   ```
   cloudinary://123456789012345:abcdEFGhIJKlmNOPqrsTUVwxyz0@your-cloud-name
   ```
3. Add it to the **backend** environment as `CLOUDINARY_URL`
   (on Render: the service's *Environment* tab; locally: `backend/.env`).

   Alternatively, set the three separate values instead of the URL:
   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

4. Redeploy the backend. On boot you'll see:
   `Cloudinary configured — uploads will be stored in the cloud.`

### How it works
- When Cloudinary is configured, uploads go to the `qbds/<events|stories|team>` folders
  and the **full secure URL** is stored in MongoDB.
- When it is **not** configured (e.g. local dev without keys), the app transparently
  falls back to local disk under `backend/uploads/` — no code changes needed.
- The frontend's `imageSrc()` helper renders absolute Cloudinary URLs as-is and
  prefixes legacy relative paths with `NEXT_PUBLIC_API_URL`, so both work seamlessly.
- Deleting an event/story/team member also removes its image from Cloudinary.

---

## 6. Post-deploy checklist

- [ ] Visit the backend URL `/` → should return `{"message":"Blood Donor API Server"}`.
- [ ] Visit the Vercel site → homepage loads, events/stories/team fetch correctly.
- [ ] Admin login at `/login` works (uses the seeded `ADMIN_USERNAME` / `ADMIN_PASSWORD`).
- [ ] Submit a donor / volunteer / blood request form → appears in the admin portal.
- [ ] No CORS errors in the browser console (check `FRONTEND_URL` on the backend).
