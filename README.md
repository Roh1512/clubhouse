# Clubhouse App

A social media app where users can sign up and post content on the app. User can also view, like and comment on other posts created by other users. Only signed up users can like and comment on the posts and create posts.

---

## Features

- Browse posts added by other users.
- Like and comment on posts.
- Manage profile details.

---

## Tech Stack

### **Frontend**

- **Library**: React (with TypeScript)
- **UI Framework**: React Bootstrap
- **Routing**: React Router v6

### **Backend**

- **Framework**: ExpressJS
- **ORM**: mongoose
- **Database**: MongoDB
- **Authentication**: session cookie
- **Storage**: Cloudinary (for media uploads and storage)

### **Hosting**

- **Server**: Render
- **Front end**: Served by express app

## Installation

- Node.js 16+
- MongoDB database instance

### Backend setup

1. Fork and clone the repository.
2. Navigate to project folder.
   ```bash
   cd <project_folder_name>
   ```
3. Configure the environment variables in .env
4. Install dependencies
   ```bash
   npm install
   ```
5. Run development server
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Access the app at 'http://localhost:5173'

## Deployment

### Frontend Deployment

1. ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the front end application
   ```bash
   npm run build
   ```
4. Deliver the index.html file in "dist" folder from express app

### Backend deployment

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the app
   ```bash
   npm start
   ```

## Contact

For any questions or feedback, please reach out to:

- **Email**: rohithashok19@gmail.com
- **GitHub**: [Roh1512](https://github.com/roh1512)
