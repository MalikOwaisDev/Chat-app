# Real-Time Chat Application

## Overview
A full-stack real-time chat application built using React, Node.js, Express, MongoDB, and Socket.io. 

## Features

### 1. User Authentication
- **User Registration**: New users can register with a username, email, and password.
- **User Login**: Existing users can log in using their credentials.
- **JWT-Based Authorization**: Uses JSON Web Tokens (JWT) for secure user sessions.
- **Persistent Sessions**: Authentication tokens are stored in `localStorage` to maintain user sessions across page refreshes.

### 2. Chat Rooms
- **Room Creation**: Users can create new chat rooms with a unique name.
- **Room Listing**: Real-time listing of all available chat rooms on the dashboard.
- **Member Tracking**: Tracks the number of members in each room.
- **Premium UI**: Modern, responsive dashboard with glassmorphism effects and smooth transitions.

### 3. Real-Time Messaging (Core Feature)
- **Live Chat**: Send and receive messages instantly using Socket.io.
- **Real-Time Broadcasting**: Messages are instantly broadcast to all members currently in the room.

### 4. Message Persistence
- **Database Storage**: Chat history is reliably saved in MongoDB.
- **Message Retrieval**: Full message history is seamlessly fetched from the backend when entering a chat room.

### 5. Online / Offline Status
- **Global Presence**: Track and display all users who are currently online globally on the main Chat Rooms dashboard.
- **Room Presence**: See a live count and the names of all active users inside a specific chat room.

### 6. Typing Indicator
- **Instant Notifications**: Visually see when other users are currently typing a message.
- **Debounced Input**: Smooth integration that automatically detects and broadcasts typing states.

### 7. Notifications
- **Toast Notifications**: Get real-time popup alerts anywhere on the dashboard when a new message arrives in a room you belong to.
- **Auto-Dismiss**: Notifications automatically hide after 5 seconds to keep the interface clean.
- **Quick Navigation**: Click on a notification to immediately jump into the relevant chat room.

## Additional Functionality
- **Forgot/Reset Password**: Complete flow using Nodemailer to securely send reset links to your Gmail account.
- **Fixed UI Layouts**: Refined CSS so the chat room header remains perfectly fixed at the top while the message feed scrolls independently.
- **Secure Configuration**: Best practices followed by ignoring `.env` and `node_modules` via `.gitignore`.
