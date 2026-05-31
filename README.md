# LuxeCinema

Premium full-stack movie ticket booking platform with a dark cinematic UI, JWT authentication, and MongoDB backend.

https://luxe-cinema.vercel.app/

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB
- **Auth:** JWT with bcrypt password hashing

## Features

- Landing page with hero, featured carousel, trending & upcoming sections
- User registration & login with form validation
- Movie listings with search and genre/language filters
- Show details with trailers, cast, theater & showtime selection
- Interactive seat booking (available/selected/booked)
- Mock payment flow with booking confirmation
- User dashboard (tickets, history, profile, cancel booking)
- Admin panel (movies, shows, theaters, bookings, analytics)

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [MongoDB](https://www.mongodb.com/) running locally (or MongoDB Atlas URI)

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Seed database with sample movies, theaters, shows & users
npm run seed

# Start the server
npm start
```

Open **http://localhost:3000** in your browser.

### Demo Accounts

| Role  | Email                 | Password  |
|-------|-----------------------|-----------|
| Admin | admin@luxecinema.com  | admin123  |
| User  | user@luxecinema.com   | user1234  |

## Environment Variables

| Variable        | Description                          |
|-----------------|--------------------------------------|
| `PORT`          | Server port (default: 3000)          |
| `MONGODB_URI`   | MongoDB connection string            |
| `JWT_SECRET`    | Secret key for JWT signing           |
| `JWT_EXPIRES_IN`| Token expiry (default: 7d)           |

## Project Structure

```
luxecinema/
├── server/
│   ├── index.js           # Express app entry
│   ├── config/db.js       # MongoDB connection
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── middleware/auth.js # JWT protection
│   └── utils/seed.js      # Database seeder
└── public/
    ├── css/               # Stylesheets
    ├── js/                # Client scripts
    └── *.html             # Pages
```

## API Routes

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/auth/register`        | Register user            |
| POST   | `/api/auth/login`           | Login                    |
| GET    | `/api/movies`               | List movies              |
| GET    | `/api/shows?movie=id`       | Shows for a movie        |
| POST   | `/api/bookings`             | Create booking (auth)    |
| POST   | `/api/payments`             | Process mock payment     |
| GET    | `/api/admin/analytics`      | Admin dashboard stats    |

## License

MIT
