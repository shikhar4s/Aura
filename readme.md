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
4. Generate a free Gemini API key:
    - Visit [Google AI Studio](https://aistudio.google.com/app/apikey) and sign in with your Google account.
    - Click "Create API key" and copy the generated key.

5. Add the Gemini API key to a `.env` file in the plant_disease_detector directory which is backend directory:
    - Create a file named `.env` (if it doesn't exist).
    - Add the following line, replacing with your actual key:
      ```
      GEMINI_API_KEY = 'Your Gemini API Key Here'
      ```

6. Start the Django server:
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