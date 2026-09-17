# Candidate Hiring Tracker

A clean, modern, and professional recruitment web application for managing job candidates, tracking them across hiring pipeline stages, and recording recruiter ratings and notes backed directly by **MongoDB**.

---

## 🏗️ Architecture

```text
React UI (Client)
    ↓
API Routes (/api/candidates)
    ↓
MongoDB Driver (lib/mongodb.ts with Connection Pooling)
    ↓
MongoDB Atlas / Server
    ↓
JSON Response
    ↓
React UI
```

All candidate operations (read, create, update, stage changes, star ratings, notes, delete) are performed directly against MongoDB.

---

## 🗄️ Database & Schema

- **Database Name**: `candidate_hiring_tracker` (or configured via `MONGODB_DB`)
- **Collection Name**: `candidates`

### Candidate Document Schema

```json
{
  "_id": "ObjectId(...)",
  "fullName": "Sarah Chen",
  "email": "sarah.chen@example.com",
  "phone": "+1 (555) 234-5678",
  "position": "Senior Frontend Engineer",
  "location": "Austin, TX",
  "resumeUrl": "https://example.com/resumes/sarah-chen.pdf",
  "applicationDate": "2026-03-01",
  "stage": "Applied",
  "rating": 4,
  "notes": "Strong React and TypeScript background.",
  "createdAt": "2026-03-01T10:00:00.000Z",
  "updatedAt": "2026-03-01T10:00:00.000Z"
}
```

---

## ☁️ MongoDB Atlas Setup Guide

To connect the application to MongoDB Atlas:

1. **Create a MongoDB Atlas account**:
   Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.

2. **Create a cluster**:
   Choose the free shared tier (M0) and select your preferred cloud provider and region.

3. **Create a database user**:
   - In Atlas, go to **Security** → **Database Access**.
   - Click **Add New Database User**.
   - Select Password authentication, create a username and strong password, and assign **Read and write to any database** permissions.

4. **Configure Network Access / IP Whitelist**:
   - In Atlas, navigate to **Security** → **Network Access**.
   - Click **Add IP Address**.
   - For cloud development / hosting (such as Vercel or cloud containers), choose **Allow Access From Anywhere (`0.0.0.0/0`)** or add your server's specific static IP address.

5. **Get the MongoDB Connection String**:
   - In Atlas, go to **Database Deployments**.
   - Click **Connect** → **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```text
     mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
     ```

6. **Configure Environment Variables**:
   Create or edit `.env.local`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
   MONGODB_DB=candidate_hiring_tracker
   ```
   Replace `<username>` and `<password>` with your database user credentials.

7. **Seed Initial Data**:
   Populate 6 fictional candidates into MongoDB:
   ```bash
   npm run seed
   ```
   *(The seed script checks whether candidates already exist in MongoDB before inserting to avoid duplicates).*

8. **Run the Application**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🚀 Deploying to Vercel

1. Push your code to your Git repository (GitHub/GitLab).
2. Note: Do **NOT** commit or upload `.env.local` (it is ignored by `.gitignore`).
3. In your **Vercel Project Dashboard**, navigate to **Settings** → **Environment Variables**.
4. Add the following environment variables:
   - `MONGODB_URI`: Your complete MongoDB Atlas connection string.
   - `MONGODB_DB`: `candidate_hiring_tracker`
5. Deploy the project.
6. Verify after deployment:
   - Candidates load from MongoDB Atlas.
   - Adding a new candidate persists upon refreshing the browser.
   - Updating candidate stage, rating, or notes persists upon refreshing the browser.
   - Deleting a candidate removes it permanently from MongoDB Atlas.

---

## 📡 API Endpoints

- `GET /api/candidates`: Returns all candidates from MongoDB (supports optional `search`, `stage`, `position`, and `rating` query parameters).
- `GET /api/candidates/:id`: Returns a single candidate by ID.
- `POST /api/candidates`: Validates and creates a candidate in MongoDB.
- `PUT /api/candidates/:id`: Validates and updates a candidate's full profile in MongoDB.
- `PATCH /api/candidates/:id/stage`: Updates candidate stage (`Applied`, `Interview`, `Test`, `Offer`, `Accepted`, `Rejected`).
- `PATCH /api/candidates/:id/rating`: Updates candidate rating (integer 1 to 5).
- `PATCH /api/candidates/:id/notes`: Updates candidate notes.
- `DELETE /api/candidates/:id`: Deletes candidate from MongoDB.
- `GET /api/status`: Checks live MongoDB connection status and returns ping confirmation.
