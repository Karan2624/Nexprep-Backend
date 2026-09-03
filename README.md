# 🚀 NexPrep - Full-Stack Interview Preparation Platform

<div align="center">
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Access_Now-brightgreen?style=for-the-badge&logo=vercel)](https://nexprep-frontend.vercel.app/)
  [![Backend Repo](https://img.shields.io/badge/Backend-Repository-black?style=for-the-badge&logo=github)](https://github.com/Karan2624/Nexprep-Backend)
  [![Recommender API](https://img.shields.io/badge/Recommender_API-Repository-blueviolet?style=for-the-badge&logo=github)](https://github.com/RadhapyariDevi/Nexprep-coding-problem-recommender-API)

  <p><strong>A comprehensive, full-stack platform designed to help candidates master algorithms, practice company-specific questions (PYQs), track their progress, and engage with a thriving community.</strong></p>
  <p>This repository serves as the primary documentation for both the <strong>Frontend</strong> and <strong>Backend</strong> ecosystems of NexPrep.</p>
</div>

---

## 🔗 Project Links

- **🌐 Live Demo (Frontend):** [https://nexprep-frontend.vercel.app/](https://nexprep-frontend.vercel.app/)
- **⚙️ Backend Repository:** [https://github.com/Karan2624/Nexprep-Backend](https://github.com/Karan2624/Nexprep-Backend)
- **🤖 Coding Problem Recommender API:** [https://github.com/RadhapyariDevi/Nexprep-coding-problem-recommender-API](https://github.com/RadhapyariDevi/Nexprep-coding-problem-recommender-API)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features In-Depth](#-key-features-in-depth)
- [Architecture & Tech Stack](#-architecture--tech-stack)
  - [Frontend Stack](#frontend-stack)
  - [Backend Stack](#backend-stack)
- [Folder Structure](#-folder-structure)
  - [Frontend Repository](#frontend-repository)
  - [Backend Repository](#backend-repository)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#1-backend-setup)
  - [Frontend Setup](#2-frontend-setup)
- [Environment Variables Guide](#-environment-variables-guide)
- [Available Scripts](#-available-scripts)
- [API Endpoints Overview](#-api-endpoints-overview)
- [Coding Problem Recommender API](#-coding-problem-recommender-api)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About the Project

**NexPrep** is built for modern developers preparing for technical interviews. Aiming for top tech companies requires consistency, targeted practice, and peer support. 

Instead of juggling multiple tools for tracking tasks, finding previous year questions, and discussing with peers, NexPrep brings it all together. It provides curated resources, progress analytics, daily task scheduling, and a real-time collaborative chat environment—all tightly integrated into one sleek, highly-responsive platform.

---

## ✨ Key Features In-Depth

1. **🔐 Robust Authentication & Security**
   - Secure JWT-based authentication using Access and Refresh tokens.
   - Passwords securely hashed via `bcrypt`.
   - Protected routes in Next.js ensuring only authenticated users can access the dashboard.

2. **📊 Personalized Dashboard & Task Management**
   - Centralized view of your daily goals and overall learning trajectory.
   - **Task Management:** Create, update, and organize your study plan, allowing you to set daily/weekly schedules seamlessly.

3. **📈 Comprehensive Analytics Engine**
   - Track your coding consistency, strengths, and areas of improvement.
   - Interactive data visualizations powered by `recharts` to give you a bird's-eye view of your progress over time.

4. **🏢 Company-Specific PYQs (Previous Year Questions)**
   - Curated collections of questions historically asked by top tech giants like Google, Amazon, Microsoft, and Meta.
   - Filter and practice targeted questions to optimize your prep time.

5. **💬 Real-time Community Chat**
   - Built-in community forums and chat rooms using **Socket.io**.
   - Instantly connect with peers, share resources, ask doubts, and collaborate in real-time.

6. **☁️ Cloud Storage Integration**
   - Profile avatars and media uploads are handled securely and efficiently via **Cloudinary**, ensuring fast delivery and optimized image sizes.

7. **🎨 Modern UI/UX**
   - Fully responsive design crafted with **Tailwind CSS v4**.
   - Fast navigation and smooth transitions utilizing Next.js App Router.

---

## 🛠️ Architecture & Tech Stack

NexPrep operates on a robust MERN-inspired stack, modernized with Next.js on the frontend.

### Frontend Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) | React framework utilizing the App Router. |
| **Library** | [React 19](https://react.dev/) | Component-based UI library. |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework. |
| **State Management**| [Zustand](https://zustand-demo.pmnd.rs/) | Small, fast, and scalable global state management. |
| **Data Visualization**| [Recharts](https://recharts.org/) | Composable charting library. |
| **HTTP Client** | [Axios](https://axios-http.com/) | Promise-based HTTP client for robust API requests. |
| **Real-time Comms** | [Socket.io-client](https://socket.io/) | Real-time bidirectional event-based communication. |

### Backend Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) | JavaScript runtime environment. |
| **Framework** | [Express.js](https://expressjs.com/) | Fast, unopinionated, minimalist web framework. |
| **Database** | [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/) | NoSQL database and Object Data Modeling (ODM) library. |
| **Authentication** | [JWT](https://jwt.io/) & [Bcrypt](https://www.npmjs.com/package/bcrypt) | Secure password hashing and token-based authentication. |
| **Real-time Comms** | [Socket.io](https://socket.io/) | WebSockets server for real-time chat. |
| **File Uploads** | [Multer](https://www.npmjs.com/package/multer) & [Cloudinary](https://cloudinary.com/) | Middleware for handling `multipart/form-data` and cloud media management. |
| **Task Scheduling** | [Node-cron](https://www.npmjs.com/package/node-cron) | Task scheduler in pure JavaScript for cron-like jobs. |

---

## 📂 Folder Structure

### Frontend Repository (`frontend-nexprep`)

```text
frontend-nexprep/
├── app/                  # Next.js App Router (Pages & Layouts)
│   ├── analytics/        # Analytics dashboard
│   ├── community/        # Real-time chat & forums
│   ├── company-pyqs/     # Company-specific questions
│   ├── dashboard/        # Main user dashboard
│   └── tasks/            # Task management page
├── components/           # Reusable React components (auth, ui, dashboard)
├── hooks/                # Custom React Hooks (e.g., useSocket, useFetch)
├── lib/                  # Utility functions, Axios setup, formatters
├── store/                # Zustand global state stores (useAuthStore, etc.)
└── public/               # Static assets
```

### Backend Repository (`nexPrep-Backend`)

```text
nexPrep-Backend/
├── src/
│   ├── controllers/      # Core business logic (auth, tasks, chat)
│   ├── db/               # Database connection setup
│   ├── middlewares/      # JWT verification, Multer upload handlers
│   ├── models/           # Mongoose schemas (User, Task, Message)
│   ├── routes/           # Express API route definitions
│   ├── socket/           # Socket.io event listeners and emitters
│   ├── index.js          # Entry point, Express app initialization
│   └── app.js            # App configuration and middleware setup
└── utils/                # Helper utilities (AsyncHandler, ApiError, ApiResponse)
```

---

## 🚀 Getting Started

Follow these steps to set up the full-stack project locally on your machine.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or MongoDB Atlas cluster)
- Cloudinary Account (for image uploads)

### 1. Backend Setup

1. **Clone and navigate to the backend repository:**
   ```bash
   git clone <backend-repository-url>
   cd nexPrep-Backend
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (see [Environment Variables Guide](#-environment-variables-guide) below).
4. **Start the server:**
   ```bash
   npm run dev
   ```
   *(The server usually runs on `http://localhost:8000`)*

### 2. Frontend Setup

1. **Clone and navigate to the frontend repository:**
   ```bash
   git clone <frontend-repository-url>
   cd frontend-nexprep
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory (see [Environment Variables Guide](#-environment-variables-guide) below).
4. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   *(Open [http://localhost:3000](http://localhost:3000) in your browser)*

---

## 🔐 Environment Variables Guide

To run this project, you will need to add the following environment variables to your respective `.env` files.

### Frontend `.env`
```env
# URL of your running backend server (e.g., local or deployed)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend `.env`
```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0...
CORS_ORIGIN=http://localhost:3000

# Authentication Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🌐 API Endpoints Overview

The backend exposes a structured RESTful API. Below is a high-level overview of the major route groups:

- `/api/v1/users` - User registration, login, logout, profile updates, and token refreshing.
- `/api/v1/tasks` - CRUD operations for user tasks and study schedules.
- `/api/v1/analytics` - Fetch user progress and performance statistics.
- `/api/v1/chat` - Real-time chat history retrieval.

---

## 🤖 Coding Problem Recommender API

NexPrep integrates a dedicated **Coding Problem Recommender** microservice, developed separately to provide intelligent, personalised problem suggestions to users.

> **Repository:** [RadhapyariDevi/Nexprep-coding-problem-recommender-API](https://github.com/RadhapyariDevi/Nexprep-coding-problem-recommender-API)

### 📌 What It Does

The recommender API analyses a user's coding history, skill level, and areas of weakness to surface the most relevant LeetCode / DSA problems for their next practice session. Rather than random browsing, users receive a curated, prioritised list of problems that maximise learning efficiency.

### ⚙️ How It Integrates with NexPrep

The frontend calls this API to power the **problem recommendation** feature on the dashboard. The flow is:

```
User Dashboard (Next.js)
       │
       ▼
Node.js / Express Backend
       │  (Authenticates user via verifyJWT)
       ▼
 Recommender API  ──►  Returns ranked list of problems
       │
       ▼
 Displayed in NexPrep UI with difficulty, topic & company tags
```

### 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Language** | Python |
| **Framework** | FastAPI |
| **Algorithm** | Content-based Filtering |
| **Data** | LeetCode problem metadata & user history |

### 🔌 API Endpoint

```http
GET /api/v1/recommend/{username}
GET /api/cf/recommend/{cf_handle}
GET /api/v1/weakspots/{username}
```

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | The authenticated user's ID |
| `limit` | `number` | Number of problems to return (default: `10`) |

**Sample Response:**
```json
{
  "username": "coder123",
  "topics": [
    { "topic": "dynamic-programming", "mastery": 0.18, "level": "beginner" },
    { "topic": "binary-search", "mastery": 0.54, "level": "intermediate" },
    { "topic": "two-pointers", "mastery": 0.82, "level": "strong" }
  ],
  "strongest": [ { "topic": "two-pointers", "mastery": 0.82 } ],
  "weakest": [ { "topic": "dynamic-programming", "mastery": 0.18 } ]
}
```

### 🚀 Running the Recommender API Locally

```bash
# Clone the recommender repository
git clone https://github.com/RadhapyariDevi/Nexprep-coding-problem-recommender-API.git
cd Nexprep-coding-problem-recommender-API

# Install Python dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

Once running, point the frontend environment variable to its local URL:

```env
# Backend .env
NEXT_PUBLIC_RECOMMENDER_API_URL=http://localhost:5000
```

---

## 💻 Available Scripts

### Frontend Scripts
- `npm run dev` - Runs the Next.js app in development mode.
- `npm run build` - Builds the optimized production application.
- `npm run start` - Starts the Next.js production server.
- `npm run lint` - Runs ESLint to maintain code quality.

### Backend Scripts
- `npm run dev` - Runs the Express server using Nodemon for hot-reloading.
- `npm run start` - Starts the Express server normally using Node.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
