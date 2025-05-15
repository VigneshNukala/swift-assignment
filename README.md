# Swift Assignment

A RESTful API built with Express.js, TypeScript, and MongoDB for managing users, posts, and comments.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/VigneshNukala/swift-assignment.git
   cd swift-assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=node_assignment
   PORT=3000
   ```

4. **Start MongoDB**
   ```bash
   # Windows (as Administrator)
   net start MongoDB

   # macOS/Linux
   mongod
   ```

5. **Build and Run**
   ```bash
   npm run ts-node src/index.ts
   ```

The server will start on `http://localhost:3000`

## API Endpoints

### 1. Load Initial Data
- **Method:** GET
- **Endpoint:** `/load`
- **Description:** Loads 10 users with their posts and comments from JSONPlaceholder
- **Response:**
  ```json
  {
    "status": "SUCCESS",
    "message": "Data loaded successfully into the database",
    "data": [
      {
        "id": 1,
        "name": "...",
        "posts": [
          {
            "id": 1,
            "title": "...",
            "comments": [...]
          }
        ]
      }
    ]
  }
  ```

### 2. Add New User
- **Method:** PUT
- **Endpoint:** `/users`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "address": {
      "street": "123 Main St",
      "suite": "Apt 4",
      "city": "Boston",
      "zipcode": "12345",
      "geo": {
        "lat": "42.3601",
        "lng": "-71.0589"
      }
    },
    "phone": "1-234-567-8900",
    "website": "johndoe.com",
    "company": {
      "name": "John's Company",
      "catchPhrase": "Making things happen",
      "bs": "innovative solutions"
    }
  }
  ```
- **Response:**
  ```json
  {
    "message": "User created successfully",
    "userId": "..."
  }
  ```

### 3. Get User by ID
- **Method:** GET
- **Endpoint:** `/users/:userId`
- **Response:**
  ```json
  {
    "id": 1,
    "name": "...",
    "username": "...",
    "email": "...",
    "posts": [...]
  }
  ```

### 4. Delete User
- **Method:** DELETE
- **Endpoint:** `/users/:userId`
- **Response:**
  ```json
  {
    "message": "User deleted"
  }
  ```

### 5. Delete All Users
- **Method:** DELETE
- **Endpoint:** `/users`
- **Response:**
  ```json
  {
    "message": "All users deleted"
  }
  ```

## Error Responses

All endpoints return error responses in this format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Testing

You can use Postman or any other API testing tool to test the endpoints. Make sure MongoDB is running before starting the application.