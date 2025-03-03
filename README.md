# Dating App Backend

## Project Overview

This project is the backend service for a real-time dating application. It provides a comprehensive suite of APIs and Socket.io functionality to enable real-time chat, user authentication, and profile management.

## Features

- **Real-time Communication**: Implemented using Socket.io for instantaneous messaging
- **User Authentication**: Secure login and registration system
- **User Profiles**: Store and retrieve user profiles with customizable information
- **Message Persistence**: All messages are stored in the database for retrieval across sessions
- **Online Status Tracking**: Real-time tracking of user online status
- **Typing Indicators**: Shows when users are typing messages

## Tech Stack

- **Node.js**: Server-side JavaScript runtime
- **Express**: Web framework for handling HTTP requests
- **Socket.io**: Real-time bidirectional event-based communication
- **Prisma**: Modern database ORM for PostgreSQL
- **Redis**: In-memory data structure store for session management
- **PostgreSQL**: Relational database for persistent storage

## Screenshots

### Registration Page
![Registration Page](https://images.coderfolks.me/images/reg_page.png)

### Login Page
![Login Page](https://images.coderfolks.me/images/login_page.png)

### Chat Interface
![Chat Interface](https://images.coderfolks.me/images/chat_section.png)

## Getting Started

### Prerequisites
- Node.js (v14.x or higher)
- PostgreSQL
- Redis

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/dating-app-backend.git
   cd dating-app-backend