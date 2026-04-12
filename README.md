# Talk to Data

> Ask questions about your data in plain English. Get instant, verified answers.

---

## Overview

**Talk to Data** is an AI-powered data analytics web application that allows users to upload any CSV file and query it using natural language — no SQL knowledge required. It solves the problem of business users being locked out of data insights due to technical barriers by providing an intelligent, conversational interface over tabular data. The system automatically strips sensitive personal information before any data is processed by the AI. The intended users are business analysts, data teams, and non-technical stakeholders who need quick, trustworthy answers from datasets without writing code.

---

## Features

- **Natural language querying** — Ask questions like "What was revenue by region in Q3?" and receive a precise, data-backed answer.
- **Three-stage AI agent pipeline** — An Intent Clarifier interprets the question, an SQL Generator writes a safe query, and a Validator Explainer summarizes the result in plain English.
- **Automatic PII detection & removal** — Columns with sensitive names (e.g. `email`, `name`, `phone`, `ssn`, `password`, `username`, `salary`) are automatically stripped before data enters the database or is seen by the AI.
- **One-click Executive Summary** — A single button automatically runs four batch analytics queries and produces a professional 3-sentence business brief.
- **Metric Definition Dictionary** — Business terms like "revenue" and "refund rate" are mapped to precise SQL formulas so the AI always uses consistent, correct definitions.
- **SQL Transparency** — Every AI answer shows the exact SQL query it ran and a plain-English explanation of that query.
- **Source Trust sidebar** — A dual-tab panel shows detected dataset columns alongside all formal metric definitions, so users can verify exactly how every calculation is made.
- **SQL safety layer** — All generated SQL is sanitized to block destructive commands (`DROP`, `DELETE`, `UPDATE`, `INSERT`) before execution.
- **Temporal date awareness** — The backend dynamically detects the date range of the uploaded dataset and injects it into the AI context to prevent hallucinated time references.
- **Comparison queries** — The AI can produce side-by-side comparisons using SQL CTEs (e.g., "Region A vs Region B", "This month vs last month").
- **Session reset** — The in-memory database can be wiped and a new file uploaded without restarting the server.

---

## Install and Run Instructions

### Prerequisites

- **Python 3.10+**
- **Node.js 18+** and **npm**
- A free [Groq API key](https://console.groq.com/)

---

### Step 1 — Clone the repository

```bash
git clone <your-repo-url>
cd talk-to-data
```

---

### Step 2 — Set up the backend

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` directory:

```bash
# backend/.env
GROQ_API_KEY=your_groq_api_key_here
```

Start the backend server:

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.

---

### Step 3 — Set up the frontend

Open a new terminal window:

```bash
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The app will open automatically at `http://localhost:3000`.

---

### Step 4 — Generate sample data (optional)

A sample data generator is provided:

```bash
cd sample_data
python generate_data.py
```

This creates a `sales_data.csv` file with realistic sales records you can upload immediately to test the app.

---

## Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | React, Axios, Recharts, Vanilla CSS |
| **Backend** | Python, FastAPI, Uvicorn |
| **Database** | SQLite (in-memory, per session) |
| **Data Processing** | Pandas |
| **AI / LLM** | Groq API (`llama-3.3-70b-versatile`) |
| **Environment** | python-dotenv |
| **Validation** | Pydantic |

---

## Usage Examples

### Uploading a dataset

1. Open `http://localhost:3000` in your browser.
2. Drag and drop your `.csv` file onto the upload area, or click to browse.
3. The app will show a confirmation of the detected columns and row count, along with any columns it automatically hid for privacy.

---

### Asking questions

Once a file is loaded, type your question in the chat input and press Enter.

**Example questions:**

```
What is total revenue by region?
Show me the top 5 products by units sold.
What was average order value in February?
Compare Q1 revenue vs Q2 revenue.
How many refunded orders do we have?
Which month had the lowest total sales?
What is our overall refund rate?
```

---

### One-click Executive Summary

On the main chat screen (before asking any questions), click the **✨ Generate Executive Summary** button. The backend automatically runs batch analytics and returns a professional paragraph summarizing total revenue, best-performing region, worst-performing region, and top product.

---

### Example API call (direct)

**Upload a file:**
```bash
curl -X POST http://localhost:8000/upload \
  -F "file=@sales_data.csv"
```

**Ask a question:**
```bash
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is total revenue by region?"}'
```

**Example response:**
```json
{
  "answer": "The North region leads with $312,000 in revenue, followed by East at $289,000 and South at $201,000.",
  "confidence": 0.92,
  "confidence_label": "High",
  "key_insight": "North outperforms South by 55%.",
  "sql_used": "SELECT region, SUM(CASE WHEN status='completed' THEN amount ELSE 0 END) AS revenue FROM data GROUP BY region ORDER BY revenue DESC LIMIT 10",
  "results": [
    {"region": "North", "revenue": 312000},
    {"region": "East", "revenue": 289000},
    {"region": "South", "revenue": 201000}
  ]
}
```

**Get metric definitions:**
```bash
curl http://localhost:8000/metrics
```

**Health check:**
```bash
curl http://localhost:8000/health
```

---

## Architecture Notes

The system is structured as a clear separation between frontend, backend logic, and AI agents:

```
┌──────────────┐     HTTP/REST     ┌────────────────────────────────────┐
│  React UI    │ ◄──────────────► │  FastAPI Backend                   │
│  (port 3000) │                  │  (port 8000)                       │
└──────────────┘                  │                                    │
                                  │  ┌─────────────────────────────┐   │
                                  │  │  Privacy Filter (PII strip) │   │
                                  │  └──────────────┬──────────────┘   │
                                  │                 ▼                  │
                                  │  ┌─────────────────────────────┐   │
                                  │  │  SQLite (in-memory engine)  │   │
                                  │  └──────────────┬──────────────┘   │
                                  │                 ▼                  │
                                  │  ┌──────────────────────────────┐  │
                                  │  │  AI Agent Pipeline (Groq)    │  │
                                  │  │  1. Intent Clarifier         │  │
                                  │  │  2. SQL Generator            │  │
                                  │  │  3. Validator / Explainer    │  │
                                  │  └──────────────────────────────┘  │
                                  └────────────────────────────────────┘
```

**Data flow per question:**
1. User types a question in the React chat UI.
2. Backend's Intent Clarifier (Agent 1) interprets the question into a structured JSON intent.
3. SQL Generator (Agent 2) writes a safe, validated SQL query against the in-memory SQLite database.
4. The SQL safety layer blocks any destructive statements.
5. SQLite executes the query and returns raw rows.
6. Validator/Explainer (Agent 3) interprets the raw numbers into a plain-English narrative.
7. The full response (answer, SQL used, results, confidence) is sent back to the React frontend.

---

## Limitations

- **Session-only memory:** Data is stored in an in-memory SQLite database that resets when the backend server restarts. There is no persistent storage between server sessions.
- **Single file per session:** Only one CSV file can be active at a time. Uploading a new file replaces the previous one.
- **English-only queries:** The AI agent pipeline has only been tested with English-language questions.
- **Sales-specific metrics:** The built-in metric dictionary (revenue, refund rate, average order value, etc.) is optimized for sales and e-commerce datasets. Queries on non-sales CSVs will work but may not benefit from predefined metric formulas.
- **Date column assumption:** Advanced temporal queries (monthly/quarterly trends) assume a column named `date` in `YYYY-MM-DD` format exists in the dataset.
- **No user authentication:** This is a prototype and has no multi-user session management.

---

## Future Improvements

- **Temporal fast-path router:** Pre-compute statistical profiles (mean, min, max, std, sum) per month, quarter, and year at upload time, allowing simple temporal queries to be answered directly from cached data without generating SQL — saving API tokens and latency.
- **Multi-file support:** Allow users to upload and query multiple datasets simultaneously with JOIN support.
- **Persistent storage:** Replace the in-memory SQLite with a persistent database (PostgreSQL) so data survives server restarts.
- **Multi-step analytical agent loop:** Enable the AI to run follow-up queries autonomously to perform root-cause analysis (e.g., "Why did revenue drop?" → runs 3 decomposing queries automatically).
- **Export to PDF/CSV:** Allow users to export their chat history and AI-generated insights as a report.
- **Custom metric definitions:** Let users define their own business metrics through the UI rather than editing Python code.
