# 🎓 Online Learning Platform (MERN Stack + Typescript)

A feature-rich online video learning platform built with the MERN stack (MongoDB, Express.js, React, Node.js) + Typescript that allows students to watch lectures with automatic progress tracking and resume playback. This system makes e-learning more personalized, measurable, and seamless.

## 🚀 Features

- ✅ Smart Lecture Resume – Auto-resumes from the last watched point
- 📊 Real-time Progress Tracking – Updates as you watch
- 🎯 Watch Interval Tracking – Merges overlapping intervals to avoid overcounting
- 🧠 Video Completion Detection – Unlock next step only when the video is 100% completed
- 🧾 JWT-Based Authentication – Secure login, signup, and protected routes
- 🔐 Token Persistence – Auth state stored and reused securely
- 🧪 Instant Save & Debounce – Avoids performance hits while saving frequently
- 📬 Notifications with react-hot-toast – Real-time feedback for user actions

---

## 🖥️ **Setup and Installation**

Follow these steps to set up the project locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/bhaveshjain2603/Online-Learning.git

2. **Navigate to the frontend directory**
   ```bash
   cd Online-Learning/client

3. **Install dependencies**
   ```bash
   npm install

4. **Run the development server**
   ```bash
   npm run dev 

5. **Navigate to the backend directory**
   ```bash
   cd Online-Learning/server

6. **Install dependencies**
   ```bash
   npm install

7. **Run the development server**
   ```bash
   npm start 

---

## ⚙️ **Tech Stack**

- Frontend: React.js, Typescript, Material UI, React Router, react-hot-toast
- Backend: Node.js, Express.js
- Database: MongoDB (Mongoose)
- Authentication: JWT (JSON Web Tokens)
- Video Tracking: Custom watch interval tracking with debounced save
- Other Tools: Lodash (Debounce), Axios

--- 

## 🤝 **Contributing**

Got ideas to improve? Found a bug?
I welcome all contributions! Open issues or PRs to help make Online Learning smarter, faster, and more scalable.