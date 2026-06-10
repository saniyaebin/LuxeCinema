require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');

const movies = [
  {
    title: 'Dune: Part Three',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against those who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he must prevent a terrible future only he can foresee.',
    genre: ['Sci-Fi', 'Adventure'],
    language: 'English',
    duration: 166,
    rating: 8.7,
    poster: 'https://picsum.photos/seed/luxecinema-dune/400/600',
    backdrop: 'https://picsum.photos/seed/luxecinema-dune-bg/1600/900',
    trailer: 'https://www.youtube.com/embed/8g18lT_WJzQ',
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', image: '' },
      { name: 'Zendaya', role: 'Chani', image: '' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', image: '' },
    ],
    releaseDate: new Date('2025-11-14'),
    status: 'now_showing',
    featured: true,
    trending: true,
    price: 14.99,
  },
  {
    title: 'Midnight Eclipse',
    description: 'A detective haunted by visions must solve a series of murders linked to an ancient celestial phenomenon before the next eclipse seals the city in darkness forever.',
    genre: ['Thriller', 'Mystery'],
    language: 'English',
    duration: 128,
    rating: 8.2,
    poster: 'https://picsum.photos/seed/luxecinema-eclipse/400/600',
    backdrop: 'https://picsum.photos/seed/luxecinema-eclipse-bg/1600/900',
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cast: [
      { name: 'Michael B. Jordan', role: 'Det. Cole Mercer', image: '' },
      { name: 'Florence Pugh', role: 'Dr. Elena Voss', image: '' },
    ],
    releaseDate: new Date('2025-10-01'),
    status: 'now_showing',
    featured: true,
    trending: true,
    price: 12.99,
  },
  {
    title: 'Golden Horizon',
    description: 'Two rival pilots compete in the world\'s most dangerous air race while uncovering a conspiracy that threatens global aviation.',
    genre: ['Action', 'Drama'],
    language: 'English',
    duration: 142,
    rating: 7.9,
    poster: 'https://picsum.photos/seed/luxecinema-horizon/400/600',
    backdrop: 'https://picsum.photos/seed/luxecinema-horizon-bg/1600/900',
    trailer: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    cast: [{ name: 'Tom Hardy', role: 'Jack Reeves', image: '' }],
    releaseDate: new Date('2025-09-20'),
    status: 'now_showing',
    trending: true,
    price: 11.99,
  },
  {
    title: 'Whispers of Kyoto',
    description: 'A young artist discovers her paintings predict future events in a quiet Japanese village steeped in centuries of secrets.',
    genre: ['Drama', 'Fantasy'],
    language: 'Japanese',
    duration: 118,
    rating: 8.5,
    poster: 'https://picsum.photos/seed/luxecinema-kyoto/400/600',
    backdrop: 'https://picsum.photos/seed/luxecinema-kyoto-bg/1600/900',
    cast: [{ name: 'Sakura Hayashi', role: 'Yuki Tanaka', image: '' }],
    releaseDate: new Date('2025-12-05'),
    status: 'coming_soon',
    featured: true,
    price: 13.99,
  },
  {
    title: 'Neon Syndicate',
    description: 'In 2087 Neo-Tokyo, a rogue hacker and an ex-cop must infiltrate a megacorp to expose a mind-control program.',
    genre: ['Sci-Fi', 'Action'],
    language: 'English',
    duration: 135,
    rating: 7.6,
    poster: 'https://picsum.photos/seed/luxecinema-neon/400/600',
    backdrop: 'https://picsum.photos/seed/luxecinema-neon-bg/1600/900',
    releaseDate: new Date('2026-01-15'),
    status: 'coming_soon',
    price: 12.99,
  },
  {
    title: 'The Last Symphony',
    description: 'A legendary conductor returns for one final performance with an orchestra of misfits in a crumbling opera house.',
    genre: ['Drama', 'Music'],
    language: 'French',
    duration: 124,
    rating: 8.8,
    poster: 'https://picsum.photos/seed/luxecinema-symphony/400/600',
    backdrop: 'https://picsum.photos/seed/luxecinema-symphony-bg/1600/900',
    releaseDate: new Date('2025-08-10'),
    status: 'now_showing',
    price: 10.99,
  },
];

const theaters = [
  {
    name: 'LuxeCinema Grand IMAX',
    location: '100 Premium Boulevard',
    city: 'Los Angeles',
    screens: 12,
    amenities: ['IMAX', 'Dolby Atmos', 'Recliner Seats', 'VIP Lounge'],
    seatLayout: { rows: 8, cols: 12, premiumRows: [1, 2] },
  },
  {
    name: 'LuxeCinema Royale',
    location: '45 Gold Street',
    city: 'New York',
    screens: 8,
    amenities: ['4DX', 'Dolby Vision', 'Premium Dining'],
    seatLayout: { rows: 8, cols: 12, premiumRows: [1, 2] },
  },
  {
    name: 'LuxeCinema Platinum',
    location: '200 Cinema Drive',
    city: 'Chicago',
    screens: 6,
    amenities: ['Laser Projection', 'Luxury Recliners'],
    seatLayout: { rows: 8, cols: 12, premiumRows: [1, 2] },
  },
];

const times = ['10:00 AM', '1:30 PM', '4:45 PM', '7:30 PM', '10:15 PM'];

async function seed() {
  await connectDB();
  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany({}), Movie.deleteMany({}), Theater.deleteMany({}), Show.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin Luxe',
    email: 'admin@luxecinema.com',
    password: 'admin123',
    role: 'admin',
    phone: '+1 555-0100',
  });

  const user = await User.create({
    name: 'Demo User',
    email: 'user@luxecinema.com',
    password: 'user1234',
    role: 'user',
    phone: '+1 555-0199',
  });

  const createdMovies = await Movie.insertMany(movies);
  const createdTheaters = await Theater.insertMany(theaters);
  console.log("Movies inserted:", createdMovies.length);
console.log("Theaters inserted:", createdTheaters.length);
console.log("Current DB:", mongoose.connection.db.databaseName);

  const shows = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let d = 0; d < 7; d++) {
    const showDate = new Date(today);
    showDate.setDate(showDate.getDate() + d);

    for (const movie of createdMovies.filter((m) => m.status === 'now_showing')) {
      for (const theater of createdTheaters) {
        for (const time of times.slice(0, 3)) {
          const bookedSample = [];
          if (Math.random() > 0.5) {
            for (let i = 0; i < Math.floor(Math.random() * 8); i++) {
              const row = String.fromCharCode(65 + Math.floor(Math.random() * 8));
              const col = Math.floor(Math.random() * 12) + 1;
              bookedSample.push(`${row}${col}`);
            }
          }
          shows.push({
            movie: movie._id,
            theater: theater._id,
            screen: `Screen ${(shows.length % 4) + 1}`,
            date: showDate,
            startTime: time,
            price: movie.price,
            bookedSeats: [...new Set(bookedSample)],
            totalSeats: 96,
          });
        }
      }
    }
  }

  await Show.insertMany(shows);

  console.log('Seed complete!');
  console.log('Admin: admin@luxecinema.com / admin123');
  console.log('User:  user@luxecinema.com / user1234');
  console.log(await Movie.countDocuments());
console.log(await Theater.countDocuments());
console.log(await User.countDocuments());
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
