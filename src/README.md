# Mergington High School Activities

A website application that allows students to browse extracurricular activities and enables teachers to manage student registrations.

## Features

- View all available extracurricular activities
- Search activities by name or description
- Filter activities by category (Sports, Arts, Academic, Community, Technology)
- Filter activities by day of the week
- Filter activities by time of day (Before School, After School, Weekend)
- Teacher login to authenticate and manage registrations
- Sign up students for activities (requires teacher login)
- Unregister students from activities (requires teacher login)

## Technology Stack

- **Backend**: Python with FastAPI
- **Database**: MongoDB
- **Frontend**: HTML, CSS, and JavaScript

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/activities` | Get all activities (optional filters: `day` for day of week, `start_time`/`end_time` in 24-hour format for time of day) |
| GET | `/activities/days` | Get a list of all days that have activities scheduled |
| POST | `/activities/{activity_name}/signup` | Sign up a student for an activity (requires `teacher_username`) |
| POST | `/activities/{activity_name}/unregister` | Remove a student from an activity (requires `teacher_username`) |
| POST | `/auth/login` | Log in as a teacher |
| GET | `/auth/check-session` | Check if a teacher session is valid |

## Development Guide

For detailed setup and development instructions, please refer to our [Development Guide](../docs/how-to-develop.md).
