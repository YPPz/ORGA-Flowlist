# ORGA Flowlist

## Overview

ORGA Flowlist is a web application designed to help users manage their daily tasks and events with ease.
It seamlessly integrates with Google Calendar for cross-platform access and leverages Gemini Flash 2.5 AI as a personal assistant to handle tasks faster and smarter.

## Features

* Google Calendar integration
* AI-powered task management (create, update, delete, query)
* Multi-task handling in a single query
* Category-based time analysis
* Free time detection
* Secure OAuth 2.0 login (Google & Facebook)
* Password recovery via email
* Profile picture upload with Cloudinary

## Tech Stack

* Frontend: React + Vite + Bootstrap
* Backend: Node.js + Express
* Database: MySQL
* Authentication: OAuth 2.0, Passport Local Strategy + Express Session
* AI: Gemini Flash 2.5 API
* Storage: Cloudinary
* Email: SMTP (Gmail)

## How AI Works

The AI assistant is powered by Gemini Flash 2.5.
It acts like a lightweight agent that translates natural language commands into structured JSON actions for the backend.

Flow:

1. User Input
   Example:
   Create a meeting tomorrow at 10 AM titled "Team Sync"

2. System Instruction

   * AI is instructed to act as a friendly and helpful assistant.
   * AI must always return a single JSON object containing:

     * summary: Human-readable explanation of what happened
     * actions: List of actions to execute
   * Context provided includes:

     * Current time (Asia/Bangkok timezone)
     * User profile (display name)
     * User's current events
     * Categories

3. AI Processing
   The AI translates user input into structured CRUD actions.

   Create Event
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

   Update Event
   {
   "action": "updateEvent",
   "event_id": 123,
   "updates": {
   "title": "Updated Meeting Title",
   "start_time": "2025-09-15T14:00:00+07:00"
   }
   }

   Delete Event
   {
   "action": "deleteEvent",
   "event_id": 123
   }

4. Backend Execution

   * The backend parses the actions.
   * Executes database operations or calls Google Calendar API accordingly.

5. Result Summary

   * All results (success/failure) are aggregated into a concise summary.
   * Example:
     ✅ Event "Team Sync" created on Oct 1, 10:00

Notes:
* Multiple actions in a single query are supported.
* Each result is clearly marked: ✅ Success, ❌ Failure
