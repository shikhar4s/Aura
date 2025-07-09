# Plant Disease Detector

This project uses Django for the backend and React for the frontend.

## Prerequisites

- Python 3.x
- Node.js & npm
- pip (Python package manager)

## Backend Setup (Django)

1. Navigate to the backend directory:
    ```bash
    cd plant_disease_detector
    ```
2. Create a virtual environment and activate it:
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4. Apply migrations:
    ```bash
    python manage.py migrate
    ```
5. Start the Django server:
    ```bash
    python manage.py runserver
    ```

## Frontend Setup (React)

1. Navigate to the frontend directory:
    ```bash
    cd plant_disease_detector_frontend
    ```
2. Install dependencies:
    ```bash
    npm install
    ```
3. Start the React development server:
    ```bash
    npm run dev
    ```

## Usage

- The backend runs on [http://127.0.0.1:8000](http://127.0.0.1:8000)
- The frontend runs on [http://localhost:5173](http://localhost:5173)

## Notes

- Ensure both servers are running for full functionality.
- Update API endpoints in the React app if the backend URL changes.