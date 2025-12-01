# Real Estate Analysis Chatbot – React + Django Project

A full-stack AI-style real estate analytics chatbot application built using **React (frontend)** and **Django + Pandas (backend)**.
The system processes locality-wise real estate data from an Excel file and returns:

* AI-style summary
* Price trend charts
* Demand/Supply insights
* Clean data tables

Built as part of the **Full Stack Developer Assignment**.

---

## 🚀 Features Overview

### 🧠 Chatbot Features

* User can chat with the system using plain text
* “Analyze <locality>” triggers data analysis
* Excel data loaded in backend
* Locality-based summary generation
* Smooth AI-typing animation
* Mobile-friendly UI

### 📊 Data Analysis Features

* Read `.xlsx` dataset dynamically
* Filter localities (Wakad, Baner, Viman Nagar etc.)
* Generate summary (price movement, demand, supply trends)
* Prepare chart datasets
* Year-wise aggregation

### 🎨 UI / UX Features

* WhatsApp-style chat interface
* Bubble-based messages (User + Bot)
* Chart cards
* Summary cards
* Data table with stripes
* Responsive layout

---

## 🔐 Backend Features (Django + Pandas)

* Django REST API
* Single analysis endpoint
* Pandas for dataset filtering
* Data cleaning + calculations
* Error handling for invalid localities
* Structured JSON response

---

## 🧱 Project Structure

```
REAL_ESTATE_CHATBOT/
│
├── backend/
│   ├── analyzer/
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── realestate_api/
│   │   ├── settings.py
│   │   └── urls.py
│   ├── dataset.xlsx
│   ├── manage.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── styles/
│   │   └── App.jsx
│   └── package.json
│
└── README.md
```

---

# 🛠️ Backend (Django + Pandas)

## 📌 Technologies Used

* Django
* Django REST Framework
* Pandas
* OpenPyXL
* Python 3+
* CORS Headers

---

## 🔗 API Endpoints (Backend)

### **Analysis Route** `/api/analyze/`

#### Request (POST)

```
{
  "location": "Wakad"
}
```

#### Response

```
{
  "summary": "Wakad shows increasing price trends ...",
  "chartData": {
      "years": [...],
      "prices": [...]
  },
  "tableData": [...]
}
```

---

# 📊 Data Processing Workflow

### 1. Load Excel File

Backend loads dataset using Pandas.

### 2. Filter Locality

Example: Wakad → filter rows containing that locality.

### 3. Prepare Summary

Average prices, new launches, demand/supply insights.

### 4. Prepare Chart Data

Year-wise price & demand.

### 5. Return JSON Response

Frontend receives → renders charts + summary.

---

# 📦 Backend Setup

### 1. Install Dependencies

```
cd backend
pip install -r requirements.txt
```

### 2. Run Backend Server

```
python manage.py runserver
```

Backend runs at:
[http://localhost:8000](http://localhost:8000)

---

# 🎨 Frontend (React.js)

## 📌 Technologies Used

* React
* Axios
* Tailwind CSS
* Recharts / Chart.js
* Vite / CRA

---

# 🖥️ Frontend Pages

### Chat Interface

* Message Input
* User bubble
* Bot bubble
* Typing animation

### Results Section

* Summary card
* Line chart
* Data table

---

# 🧩 Frontend Setup

```
cd frontend
npm install
npm run dev
```

Frontend runs at:
[http://localhost:5173](http://localhost:5173)

---

# 🔌 API Communication Flow

### 1. User sends query from frontend

### 2. Axios makes POST request to Django

### 3. Django processes Excel

### 4. Returns summary + charts

### 5. React renders UI components

---

# 🔐 Error Handling

* Invalid locality → Bot returns “Location not found”
* Missing dataset → API exception
* API failure → front-end snackbar alert

---

# 📈 Charts & Data Table

**Charts include:**

* Year-wise price trend
* Demand trend
* Supply trend

**Table includes:**

* Price
* Demand
* Inventory
* Units sold

---

# 📦 Deployment Guide

### Frontend

* Deploy on Netlify / Vercel
* Add env API base URL

### Backend

* Deploy on Render / Railway
* Use CORS whitelist
* Keep dataset.xlsx in server

---

# ✔️ Final Notes

* Fully responsive UI
* Clean chatbot-style design
* Accurate Excel data processing
* Ideal for interview assignment
* Can be extended with LLM APIs (ChatGPT / Gemini)
