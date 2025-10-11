# ORGA Flowlist

## Overview

ORGA Flowlist is a web application designed to help users manage their daily tasks and events with ease.
It seamlessly integrates with Google Calendar for cross-platform access and leverages Gemini Flash 2.5 AI as a personal assistant to handle tasks faster and smarter.

---

## Features

* Google Calendar integration
* AI-powered task management (create, update, delete, query)
* Multi-task handling in a single query
* Category-based time analysis
* Free time detection
* Secure OAuth 2.0 login (Google & Facebook)
* Password recovery via email
* Profile picture upload with Cloudinary

---

## Tech Stack

* **Frontend:** React + Vite + Bootstrap
* **Backend:** Node.js + Express
* **Database:** MySQL
* **Authentication:** OAuth 2.0, Passport Local Strategy + Express Session
* **AI:** Gemini Flash 2.5 API
* **Storage:** Cloudinary
* **Email:** SMTP (Gmail)

---

## Security & Access Control

This project includes a simple **email-based access control system** for security and internal testing purposes.

### Allowed Users

Access is limited to a predefined list of emails specified in the `.env` file under:

```bash
ALLOWED_USERS=demo@example.com,test@example.com
```

Only users with these emails can:

* Register or log in using **local authentication**
* Log in via **Google** or **Facebook OAuth**

If a user outside this list attempts to sign in, they will receive:

* A `403 Access Denied` response for local login
* A redirect back to the login page with an error for OAuth login

---

## Google Calendar Integration Notice

> **Important:**
> To use the Google Calendar integration, users **must log in through Google OAuth**.
> Local and Facebook logins **do not** have access to Google Calendar sync features.

Reason:

* The app requests specific Google API scopes (`https://www.googleapis.com/auth/calendar`) during OAuth login.
* This permission is required for event synchronization and calendar automation.

---

## How AI Works

The AI assistant is powered by Gemini Flash 2.5.
It acts like a lightweight agent that translates natural language commands into structured JSON actions for the backend.

### Flow:

1. **User Input**
   Example:
   `Create a meeting tomorrow at 10 AM titled "Team Sync"`

2. **System Instruction**

   * AI is instructed to act as a friendly and helpful assistant
   * AI must always return a single JSON object containing:

     * `summary`: Human-readable explanation of what happened
     * `actions`: List of actions to execute
   * Context provided includes:

     * Current time (Asia/Bangkok timezone)
     * User profile (display name)
     * User's current events
     * Categories

3. **AI Processing**
   The AI translates user input into structured CRUD actions.

**Create Event Example**

```json
{
  "action": "createEvent",
  "title": "Meeting with Team",
  "details": "Discuss Q3 goals",
  "start_time": "2025-09-15T10:00:00+07:00",
  "end_time": "2025-09-15T11:00:00+07:00",
  "priority": "high",
  "category_id": 2,
  "newCategoryName": "Work"
}
```

**Update Event Example**

```json
{
  "action": "updateEvent",
  "event_id": 123,
  "updates": {
    "title": "Updated Meeting Title",
    "start_time": "2025-09-15T14:00:00+07:00"
  }
}
```

**Delete Event Example**

```json
{
  "action": "deleteEvent",
  "event_id": 123
}
```

4. **Backend Execution**

* The backend parses the actions
* Executes database operations or calls Google Calendar API accordingly

5. **Result Summary**

* All results (success/failure) are aggregated into a concise summary
* Example:
  ✅ Event "Team Sync" created on Oct 1, 10:00

**Notes:**

* Multiple actions in a single query are supported
* Each result is clearly marked: ✅ Success, ❌ Failure

---

## Notes for Live Demo

For testing purposes, you can use the following demo account:

```
Email: demo@gmail.com
Password: demo
```

This account is included in `ALLOWED_USERS` for quick access during live demonstrations.

---

## Demo Account Behavior

The **demo account** (`demo@gmail.com`) is designed for testing and presentation purposes only.

### 🔄 Automatic Data Reset
To ensure a clean environment for each user session, the system automatically **resets demo data every 12 hours** using a scheduled background job.

The reset process includes:

* Deleting all **events** created by the demo user  
* Deleting all **custom categories** (type: `custom`)  
* Preserving default system categories for consistency

This reset is handled automatically by a server-side cron job (`node-cron`), and no manual action is required.

---

### ⏰ Demo Session Expiration

For security and performance reasons, demo sessions are temporary.  
Each demo session automatically **expires after 30 minutes** of inactivity.  
After expiration, the user must log in again using the demo credentials.

> This prevents long-lived demo sessions from occupying server memory and ensures a consistent testing environment.

---

### Summary

| Feature | Behavior |
|----------|-----------|
| **Data Reset** | Every 12 hours (cron job) |
| **Session Expiry** | 30 minutes of inactivity |
| **Demo Email** | `demo@gmail.com` |
| **Demo Password** | `demo` |
| **Demo Limitations** | Cannot modify system categories or user data persistence |

---

