# Real Estate Analysis Chatbot – React + Django

A full-stack real estate analytics chatbot application built using React (frontend) and Django + Pandas (backend). The system processes locality-wise real estate data from an Excel file and returns analytical insights including:

* Natural-language summaries
* Price trend charts
* Demand and supply insights
* Structured data tables

This project was developed as part of a technical assignment for **Creasophere Tech Private Limited (SigmaValue)** under the **Full Stack Development Internship** process.

---

## Live Project Link

**Frontend Deployment:**
[https://real-estate-analysis-chatbot-green.vercel.app/](https://real-estate-analysis-chatbot-green.vercel.app/)

## Project Demo Video

**Video Demonstration:**
[https://drive.google.com/file/d/1k0-ahM5RqB7eQFpYWmrCRkVeAQ2Cy9MN/view?usp=sharing](https://drive.google.com/file/d/1k0-ahM5RqB7eQFpYWmrCRkVeAQ2Cy9MN/view?usp=sharing)

---

# Assignment Information (Professional Summary)

This project was created as a submission for the **Full Stack Developer Internship** assignment provided by:

**Creasophere Tech Private Limited (Sigma Value)**
Role: Full Stack Developer Intern
Location: Pune (Work from Office)
Duration: 6 Months

**Stipend Structure**

* First 3 months: ₹7,500 per month
* Next 3 months: ₹10,000 per month

Assessment Guidelines:
The company provided a technical assignment titled *“Mini Real Estate Analysis Chatbot (React + Django)”* and instructed candidates to submit the completed assignment within 3 days of receiving it. The evaluation is based on code quality, functionality, UI/UX clarity, and adherence to requirements. Outstanding performers may also be considered for a full-time role upon internship completion.

---

# Features Overview

## Chatbot Features

* Natural text input support.
* “Analyze <locality>” triggers automatic data processing.
* AI-styled response formatting.
* Smooth typing animation for enhanced interaction.
* Fully responsive and mobile-friendly interface.

## Data Analysis Features

* Excel dataset ingestion using Pandas.
* Locality-based filtering (e.g., Wakad, Baner, Viman Nagar).
* Summary generation for price movement, demand, and supply trends.
* Chart-ready datasets returned through API.
* Year-wise aggregation and data cleaning.

## UI/UX Features

* WhatsApp-style chat interface.
* Bubble-based message design.
* Summary and chart cards.
* Striped data table.
* Clean, modern layout with responsive components.

---

# Backend (Django + Pandas)

## Technologies Used

* Django
* Django REST Framework
* Pandas
* OpenPyXL
* Python 3+
* CORS Headers

---

## API Endpoint

### POST `/api/analyze/`

#### Request

```
{
  "location": "Wakad"
}
```

#### Response

```
{
  "summary": "Wakad shows increasing price trends...",
  "chartData": {
    "years": [...],
    "prices": [...]
  },
  "tableData": [...]
}
```

---

# Data Processing Workflow

1. Load Excel dataset using Pandas.
2. Filter entries based on the requested locality.
3. Generate statistical summary.
4. Prepare chart datasets (price, demand, supply trends).
5. Return structured JSON to frontend.

---

# Backend Setup

```
cd backend
pip install -r requirements.txt
python manage.py runserver
```

Runs at:
[http://localhost:8000/](http://localhost:8000/)

---

# Frontend (React.js)

## Technologies Used

* React
* Axios
* Tailwind CSS
* Recharts / Chart.js
* Vite (Recommended)

---

## Frontend Pages

* Chat interface with message bubbles
* AI-style typing indicator
* Summary display section
* Trend charts
* Data table section

---

## Frontend Setup

```
cd frontend
npm install
npm run dev
```

Runs at:
[http://localhost:5173/](http://localhost:5173/)

---

# API Communication Flow

1. User submits locality query through chat.
2. Axios sends request to Django backend.
3. Backend processes the Excel dataset.
4. Summary, chart data, and tables are returned.
5. Frontend renders the analytical results.

---

# Error Handling

* Invalid locality: appropriate error message returned.
* Dataset errors: backend exception handled.
* API failure: frontend displays alert/notification.

---

# Charts and Data table

**Charts include:**

* Year-wise price trends
* Demand trends
* Supply trends

**Table includes:**

* Year
* Average price
* Demand
* Inventory
* Units sold

---

# Deployment Guide

## Frontend

Deploy on Vercel or Netlify. Add API base URL via environment variables.

## Backend

Deploy using Render or Railway.
CORS must be configured. Dataset file must be included on server.

---

# Final Notes

* Fully responsive and user-friendly design.
* Clean and maintainable code.
* Accurate data transformation using Pandas.
* Suitable for interview and internship technical evaluation.
* Can be extended using LLM APIs for advanced chatbot interaction.
