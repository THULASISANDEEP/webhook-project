# Webhook Dashboard & Translator Workflow

## Overview

This project is used for handling DatoCMS webhook events and managing translator workflow tracking.

The application:
- Receives webhook payloads from DatoCMS
- Stores payload data in MongoDB
- Tracks workflow stages such as:
  - Review
  - Approved
  - Reject
- Displays records in the dashboard
- Tracks translator-related actions using DatoCMS APIs

---

# Technologies Used

## Frontend
- React
- Vite

## Backend
- Node.js ( v20.20.0 )
- Express.js

## Database
- MongoDB Atlas
- Mongoose

## Additional Tools
- Ngrok
- Dotenv

---

# Requirements

Install the following before running the project:

- Node.js
- npm
- MongoDB Atlas
- VS Code
- Ngrok

---

# Project Setup

## 1. Open the project

Open the project folder in VS Code.

---

## 2. Install backend dependencies

Run:

```bash

npm install
```
## 3. Go to frontend folder

Run:

```bash
cd frontend-react
```
## 4. Install frontend dependencies

Run:

```bash
npm install
```

---

## 5. Create `.env` file

Create a `.env` file in the main project folder.

Add all required environment variables.

Example:

```env
MONGO_URI=your_mongodb_connection_string
DATOCMS_API_TOKEN=your_api_token
```

or 

## there is a sample .env file in the project

the required values can be just entered

---

# Running the Project

Create a total of 3 terminals.

---

## Terminal 1 — Start Backend Server

Run:

```bash
node server.js
```

---

## Terminal 2 — Start Ngrok

Run:

```bash
ngrok http 4000
```

Copy the generated HTTPS URL and use it in DatoCMS Webhook settings.

---

## Terminal 3 — Start Frontend

Before running this command, make sure you are inside the `frontend-react` folder.

Run:

```bash
npm run dev
```

---

# Application URLs

## Frontend

```text
http://localhost:5173
```

---

## Backend

```text
http://localhost:4000
```
