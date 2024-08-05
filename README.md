# Stud-Com Platform Backend

## Introduction

This is the backend for the Study-Co platform, a system designed to facilitate study groups, resource sharing, and progress tracking. The backend is built using Node.js and Express, with MongoDB as the database and Socket.IO for real-time communication.

## Base URL

All API endpoints are relative to `http://local_ip:3000`

## Authentication

Most endpoints require a JWT token for authentication. This token should be included in the request body as the `token` field.

## API Categories

1. User Management
2. Study Group Management
3. Resource Management

## Getting Started

### Prerequisites

- Node.js
- MongoDB

### Installation

1. Clone the repository
2. Navigate to the backend directory
3. Install dependencies:
   ```
   npm install
   ```
4. Set up your environment variables (create a `.env` file)
5. Start the server:
   ```
   npm start
   ```

## API Documentation

### User Management

#### 1. Sign Up
- **URL:** `/signup`
- **Method:** POST
- **Body:**
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string"
  }
  ```

#### 2. Sign In
- **URL:** `/signin`
- **Method:** POST
- **Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

#### 3. Fetch User
- **URL:** `/api/fetchUser`
- **Method:** POST
- **Body:**
  ```json
  {
    "userID": "string"
  }
  ```

### Study Group Management

#### 1. Create Community
- **URL:** `/api/createCommunity`
- **Method:** POST
- **Body:**
  ```json
  {
    "token": "string",
    "communityName": "string",
    "tags": ["string"]
  }
  ```

#### 2. Create Channel
- **URL:** `/api/createChannel`
- **Method:** POST
- **Body:**
  ```json
  {
    "communityID": "string",
    "channelName": "string"
  }
  ```

(Additional endpoints for Study Group Management are available in the full API documentation)

### Resource Management

#### 1. Set Progress Track
- **URL:** `/progressTrack`
- **Method:** POST
- **Body:**
  ```json
  {
    "token": "string",
    "commnuityID": "string",
    "channelID": "string",
    "liveTask": ["string"],
    "subtask": ["string"]
  }
  ```

(Additional endpoints for Resource Management are available in the full API documentation)

## Socket Server

The backend includes a Socket.IO server for real-time communication. Key events include:

- `signin`: User sign-in
- `messagep2c`: Messages from user to community
- `messagep2p`: Direct messages between users

## Database Schema

The backend uses MongoDB with the following main collections:

- Users
- Communities
- Channels
- Chats
- P2P Chats
- Progress

Detailed schema information is available in the full documentation.

## Error Handling

The API uses standard HTTP status codes for error responses. Common error codes include:

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 500: Internal Server Error

