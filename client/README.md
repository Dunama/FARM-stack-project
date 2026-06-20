# React client

This folder contains the React + Bootstrap frontend for the student CRUD app.

## What it does

- Adds a student
- Lists all students
- Updates a student
- Deletes a student

## Setup

1. Make sure the FastAPI backend is running on `http://localhost:8000`.
2. Start the React app from this folder:

```bash
npm start
```

## API connection

The app calls these backend endpoints:

- `GET /students/get`
- `POST /students/create`
- `PUT /students/update/{student_id}`
- `DELETE /students/delete/{student_id}`

If your backend runs on a different host or port, set:

```bash
REACT_APP_API_URL=http://localhost:8000
```
