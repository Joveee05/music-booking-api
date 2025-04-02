# Music Booking API

A RESTful API for managing music events, artist profiles, and booking transactions.

## Features

- Artist profile management
- Event listing and management
- Booking system for events
- User authentication and authorization
- Secure payment processing

## Tech Stack

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Express Validator for input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd music-booking-api
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your environment variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/music-booking
JWT_SECRET=your-secret-key
NODE_ENV=development
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Artists
- GET /api/artists - Get all artists
- GET /api/artists/:id - Get artist by ID
- POST /api/artists - Create new artist profile
- PUT /api/artists/:id - Update artist profile
- DELETE /api/artists/:id - Delete artist profile

### Events
- GET /api/events - Get all events
- GET /api/events/:id - Get event by ID
- POST /api/events - Create new event
- PUT /api/events/:id - Update event
- DELETE /api/events/:id - Delete event

### Bookings
- GET /api/bookings - Get all bookings
- GET /api/bookings/:id - Get booking by ID
- POST /api/bookings - Create new booking
- PUT /api/bookings/:id - Update booking status
- DELETE /api/bookings/:id - Cancel booking

## Testing

Run the test suite:
```bash
npm test
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS enabled
- Helmet for security headers

## License

MIT 