# Real-Time Chat Application

## Overview
A full-stack real-time chat application built using React, Node.js, Express, MongoDB, and Socket.io. 

## Features

### 1. User Authentication
- **User Registration**: New users can register with a username, email, and password.
- **User Login**: Existing users can log in using their credentials.
- **JWT-Based Authorization**: Uses JSON Web Tokens (JWT) for secure user sessions.
- **In-Memory Token Storage**: Authentication tokens are stored securely in-memory on the frontend for security.

### 2. Chat Rooms
- **Room Creation**: Users can create new chat rooms with a unique name.
- **Room Listing**: Real-time listing of all available chat rooms on the dashboard.
- **Member Tracking**: Tracks the number of members in each room.
- **Premium UI**: Modern, responsive dashboard with glassmorphism effects and smooth transitions.

### 3. Real-Time Messaging
- **Live Chat**: Send and receive messages instantly using Socket.io.
- **Message Persistence**: Chat history is saved in MongoDB and retrieved when entering a room.
- **Real-Time Broadcasting**: Messages are instantly broadcast to all members currently in the room.
- **Auto-Scroll**: Chat window automatically scrolls to the latest message for a seamless experience.

---
*More features will be added here as they are developed.*
