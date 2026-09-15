# 🚀 Software Engineer Roadmap
# Made by Shubham Vishwakarma
A full-stack roadmap management application designed to help software engineers **plan, customize, organize, and track their learning journey**.

Users can create personalized roadmaps, manage learning steps, track progress, add notes and resources, and use starter roadmap templates.

---

## ✨ Features

### 🔐 Authentication
- User registration
- User login
- JWT-based authentication
- Password hashing using `bcryptjs`
- Persistent login session
- Logout functionality
- Demo login support

### 🗺️ Roadmap Management
- Create custom software engineering roadmaps
- Edit roadmap details
- Delete roadmaps
- View individual roadmap details
- Set roadmap category and difficulty level
- Add target dates
- Add custom tags

### 📚 Roadmap Steps
Each roadmap can contain multiple learning steps.

Users can:

- Add new steps
- Edit existing steps
- Delete steps
- Change step status
- Reorder steps
- Add topics/skills
- Add personal notes
- Add learning resources
- Track estimated study hours

### 📊 Progress Tracking
The dashboard provides:

- Total roadmaps
- Roadmaps in progress
- Completed steps
- Overall progress percentage
- Completed roadmaps
- Not-started roadmaps
- In-progress roadmaps

### 🔎 Search, Filter & Sort

Roadmaps can be:

- Searched by title
- Searched by description
- Searched by tags
- Searched by topics
- Filtered by category
- Filtered by status
- Sorted by progress
- Sorted alphabetically
- Sorted by creation date
- Sorted by recently updated

### 📋 Starter Templates

The application includes predefined roadmap templates that users can clone and customize for their own learning journey.

Example categories include:

- Frontend
- Backend
- Fullstack
- DevOps
- Mobile
- AI & Data
- System Design

---

## 🛠️ Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Motion
- Axios

### Backend

- Node.js
- Express.js
- TypeScript
- JWT
- bcryptjs

### Database

The application supports:

- MongoDB / MongoDB Atlas
- Local persistent JSON database as a fallback

### Additional Technologies

- Google Gemini API
- dotenv
- MongoDB Node.js Driver
- esbuild

---

## 🏗️ Project Architecture

```text
software-engineer-roadmap/
│
├── src/
│   ├── api/
│   │   └── client.ts
│   │
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── AuthModal.tsx
│   │   ├── Dashboard.tsx
│   │   ├── RoadmapDetail.tsx
│   │   ├── RoadmapModal.tsx
│   │   ├── StepModal.tsx
│   │   └── TemplatesModal.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── types.ts
│
├── server/
│   ├── data/
│   │   └── templates.ts
│   │
│   ├── middleware/
│   │   └── auth.ts
│   │
│   ├── routes/
│   │   ├── auth.ts
│   │   └── roadmaps.ts
│   │
│   ├── db.ts
│   └── types.ts
│
├── data/
│   └── db.json
│
├── .env.example
├── index.html
├── package.json
├── server.ts
├── tsconfig.json
└── vite.config.ts
```

---

## ⚙️ Requirements

Before running the project, make sure you have installed:

- Node.js 18+
- npm
- MongoDB or MongoDB Atlas *(optional because the application can use local JSON storage)*

---

## 📥 Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
```

### 2. Open the project

```bash
cd software-engineer-roadmap
```

### 3. Install dependencies

```bash
npm install
```

---

## 🔑 Environment Variables

Create a `.env` file in the root directory.

```env
GEMINI_API_KEY=your_gemini_api_key
APP_URL=http://localhost:3000
JWT_SECRET=your_secure_jwt_secret
MONGODB_URI=your_mongodb_connection_string
```

### Environment Variable Description

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | API key for Gemini AI functionality |
| `APP_URL` | Application URL |
| `JWT_SECRET` | Secret used for JWT authentication |
| `MONGODB_URI` | MongoDB connection string |

> If `MONGODB_URI` is not configured, the application can fall back to local persistent JSON storage.

---

## ▶️ Running the Application

Start the development server:

```bash
npm run dev
```

The application will start using the configured development server.

Open the URL shown in your terminal, usually:

```text
http://localhost:3000
```

---

## 🏭 Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 🧪 Type Checking

Run TypeScript validation:

```bash
npm run lint
```

This runs:

```bash
tsc --noEmit
```

---

## 🔐 Authentication Flow

The application uses JWT authentication.

### Registration

```text
User
 ↓
Registration Form
 ↓
Express API
 ↓
Validate User Data
 ↓
Hash Password
 ↓
Save User
 ↓
Generate JWT
 ↓
Return Token
```

### Login

```text
User
 ↓
Login Form
 ↓
Express API
 ↓
Find User
 ↓
Compare Password
 ↓
Generate JWT
 ↓
Return Token
 ↓
Store Token in Local Storage
```

Protected roadmap APIs require a valid authentication token.

---

## 🗺️ Roadmap Workflow

```text
Login / Register
       ↓
    Dashboard
       ↓
 ┌─────┴─────┐
 ↓           ↓
Create     Templates
Roadmap      ↓
 ↓         Clone
 ↓           ↓
 └─────┬─────┘
       ↓
 Roadmap Detail
       ↓
 ┌─────┼───────────────┐
 ↓     ↓               ↓
Steps  Topics       Resources
 ↓
Status Tracking
 ↓
Progress Calculation
 ↓
Dashboard Statistics
```

---

## 📡 API Endpoints

### Authentication

#### Register

```http
POST /api/auth/register
```

Request:

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Login

```http
POST /api/auth/login
```

#### Current User

```http
GET /api/auth/me
```

Requires authentication.

---

### Roadmaps

#### Get Roadmaps

```http
GET /api/roadmaps
```

Supports:

```text
search
category
status
sort
```

#### Get Roadmap

```http
GET /api/roadmaps/:id
```

#### Create Roadmap

```http
POST /api/roadmaps
```

#### Update Roadmap

```http
PUT /api/roadmaps/:id
```

#### Delete Roadmap

```http
DELETE /api/roadmaps/:id
```

#### Get Statistics

```http
GET /api/roadmaps/stats
```

#### Get Templates

```http
GET /api/roadmaps/templates
```

#### Clone Template

```http
POST /api/roadmaps/templates/:templateId/clone
```

---

### Roadmap Steps

The application also supports APIs for:

```http
POST   /api/roadmaps/:roadmapId/steps
PUT    /api/roadmaps/:roadmapId/steps/:stepId
DELETE /api/roadmaps/:roadmapId/steps/:stepId
PUT    /api/roadmaps/:roadmapId/steps-reorder
```

These endpoints allow users to manage their learning steps and track progress.

---

## 📈 Roadmap Progress

Every roadmap calculates progress based on its steps.

A step can have one of three statuses:

```text
not_started
in_progress
completed
```

Progress is calculated using:

```text
Completed Steps / Total Steps × 100
```

For example:

```text
Total Steps:     10
Completed Steps: 6

Progress: 60%
```

---

## 💾 Database

The application supports MongoDB.

Example MongoDB Atlas connection:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roadmap_app
```

If MongoDB is not configured, the application can use the local database:

```text
data/db.json
```

This makes local development easier without requiring a MongoDB server.

---

## 🎨 UI

The application uses a modern dashboard-style interface with:

- Responsive layout
- Clean card-based design
- Progress indicators
- Search and filters
- Modal-based forms
- Roadmap detail pages
- Status indicators
- Icons using Lucide React
- Responsive mobile layout

---

## 🔒 Security

The project includes several security mechanisms:

- Password hashing with bcrypt
- JWT authentication
- Protected roadmap routes
- User-specific roadmap access
- Input validation
- Environment-based secrets
- Normalized email addresses

Passwords are never stored as plain text.

---

## 🚀 Future Improvements

Possible future enhancements include:

- Google/GitHub OAuth
- Email verification
- Password reset
- AI-generated personalized roadmaps
- AI learning recommendations
- Public roadmap sharing
- User profiles
- Social features
- Roadmap comments
- Learning streaks
- Notifications
- Analytics dashboard
- Cloud deployment
- Automated tests
- Role-based access control

---

## 📄 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build frontend and backend |
| `npm start` | Start production server |
| `npm run lint` | Run TypeScript checks |
| `npm run clean` | Remove build files |

## 📜 License

This project is available for educational and development purposes.

---

## 👨‍💻 Project

**Software Engineer Roadmap**

A platform for planning, organizing, and tracking your software engineering learning journey.

> Learn → Practice → Track → Improve → Become a Better Engineer 🚀

<img width="1366" height="768" alt="Screenshot 2026-09-15 124714" src="https://github.com/user-attachments/assets/73586bd0-3693-4488-8965-9beafe2f116c" />
<img width="1366" height="768" alt="Screenshot 2026-09-15 124729" src="https://github.com/user-attachments/assets/c7c3aeee-ac20-4ce0-baaf-f394e6d385d4" />
