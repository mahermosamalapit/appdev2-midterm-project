## Profile

Name: Malapit, Ma. Hermosa C.

Date Submitted: April 19, 2025

## Project Overview

This is my midterm project for AppDev2. It is a simple HTTP server built with Node.js using core modules only (`http`, `fs`, and `events`). It performs CRUD operations on a local `todos.json` file and logs API activity to `logs.txt`

## Endpoints

| Method | Endpoint      | Description                       |
|--------|---------------|-----------------------------------|
| GET    | /todos        | Fetch all todos                   |
| GET    | /todos/:id    | Fetch a specific todo by ID       |
| POST   | /todos        | Create a new todo                 |
| PUT    | /todos/:id    | Update a todo by ID               |
| DELETE | /todos/:id    | Delete a todo by ID               |

Optional: Add `?completed=true` to `/todos` for filtering by completed status.

## 🚀 Installation & Running the Server

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/appdev2-midterm-project.git
   cd appdev2-midterm-project
