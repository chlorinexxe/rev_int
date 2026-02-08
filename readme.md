# Revenue Intelligence Console

A single-page application designed to help Chief Revenue Officers (CROs) answer critical questions about revenue performance using sales data. This project leverages React, TypeScript, Material UI, D3.js for the frontend, and TypeScript with SQL for the backend.

## Table of Contents
1. [Installation](#installation)
2. [Backend API Endpoints](#backend-api-endpoints)
3. [Frontend Usage](#frontend-usage)
4. [Project Structure](#project-structure)
5. [Running the Project](#running-the-project)
6. [Reflection](#reflection)

## Installation

To get started, you will need to set up both the backend and frontend.

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn
- TypeScript
- SQL database (SQLite, PostgreSQL, MySQL, or an in-memory database for development)

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/chlorinexxe/rev-int/git
    cd rev-int
    ```

2. Install dependencies for both frontend and backend:

    - For the backend:

    ```bash
    cd backend
    npm install
    ```

    - For the frontend:

    ```bash
    cd frontend
    npm install
    ```

3. Set up your database (SQLite, PostgreSQL, or MySQL) and import the provided data files (`accounts.json`, `reps.json`, `deals.json`, `activities.json`, `targets.json`) into your chosen database. Make sure to configure the database connection in the backend accordingly.

4. Run both the backend and frontend:

    - Start the backend server (in the `backend` directory):

    ```bash
    npm run dev
    ```

    - Start the frontend server (in the `frontend` directory):

    ```bash
    npm start
    ```

The frontend should now be available at [http://localhost:5173](http://localhost:5173), and the backend API will be running on [http://localhost:4000](http://localhost:4000).

## Backend API Endpoints

Here are the key API endpoints that the frontend will interact with:

### 1. Summary - `/api/summary`
- **GET**: Returns current quarter revenue, target, gap percentage, and YoY or QoQ change.
- **Response**:
    ```json
    {
  "quarter": "Q1 2026",
  "currentQuarterRevenue": 5000000,
  "target": 5000000,
  "gapPercent": 4,
  "qoqChangePercent": -5,}    
  ```

### 2. Revenue Drivers - `/api/drivers`
- **GET**: Returns insights into pipeline size, win rate, average deal size, and sales cycle time.
- **Response**:
    ```json
            {
        "year": 2025,
        "monthly": [
            {
            "month": "2025-01",
            "pipelineValue": 335174,
            "winRate": null,
            "avgDealSize": 0,
            "salesCycleDays": 0
            }
        ]
        }
    ```

### 3. Risk Factors - `/api/risk-factors`
- **GET**: Returns potential risk factors such as stale deals, underperforming reps, and low activity accounts.
- **Response**:
    ```json
            {
        "staleDeals": [
            {"deal_id": "D376", "accountName": "Company_47", "daysSinceActivity": 403}
        ],
        "underperformingReps": [
            {"rep_id": "R10", "repName": "Suresh", "percentOfTarget": 0}
        ],
        "lowActivityAccounts": [
            {"account_id": "A1", "accountName": "Company_1"}
        ]
        }
    ```

### 4. Recommendations - `/api/recommendations`
- **GET**: Returns actionable suggestions to improve sales performance.
- **Response**:
    ```json
    [
      "Focus on Enterprise deals older than 30 days",
      "Coach Rep A on win rate",
      "Increase activity for Segment B"
    ]
    ```

## Frontend Usage

The frontend uses Material UI for UI components and D3.js for charts. It interacts with the backend API to display revenue, drivers, risk factors, and recommendations in a clean and interactive UI.

1. **Dashboard View**: Displays current quarter revenue, targets, gap, and YoY/QoQ change.
2. **Revenue Drivers**: Visualizes performance using pipeline size, win rate, average deal size, and sales cycle time.
3. **Risk Factors**: Highlights stale deals, underperforming reps, and low-activity accounts.
4. **Recommendations**: Provides actionable recommendations to improve sales performance.

## Project Structure

# Project Structure

This project is divided into three main directories: `/backend`, `/frontend`, and `/data`. Below is an overview of the directory structure and their respective responsibilities.

## /backend
The backend is responsible for handling API requests, business logic, and database interactions.

- **/src/loaders**:Loads the data from Data/ and stores to data.db
- **/db.ts**:Creates the Database when database not present 
- **/src/routes**: Defines the API route mappings.
- **/src/services**: Contains business logic, such as summary generation, risk calculations, and recommendations.

- **index.ts**: The entry point for the backend application, initializing the server and routes.

## /frontend
The frontend is responsible for rendering the user interface and interacting with the backend API.

- **/src/components**: Contains reusable React components for the UI.
- **/src/pages**: Defines the Dashboard of the application.
- **/src/api**: API service layer for making requests to the backend
- **App.tsx**: The main entry point for the React app.

## /data
Contains static JSON files for initial application data. These files simulate a data source before a database is integrated.

- **accounts.json**: Contains data related to user accounts.
- **reps.json**: Contains data related to sales representatives.
- **deals.json**: Contains data related to deals.
- **activities.json**: Contains data on activities such as meetings, calls, etc.
- **targets.json**: Contains data related to sales targets.



## Running the Project

1. Follow the installation steps mentioned above to set up the project.
2. Start the backend server and frontend server in parallel.
3. Visit [http://localhost:5173/](http://localhost:5173) in your browser to access the dashboard and interact with the data.

