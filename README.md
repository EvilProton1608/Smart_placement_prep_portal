# Smart Placement Prep Portal
Full-stack web portal that helps students prepare for campus placements through aptitude practice, coding challenges, performance tracking, and personalized learning insights.

## Features
- Aptitude quizzes and mock tests with analytics
- Coding challenges with submissions and test cases
- Resume analyzer uploads and scoring
- User authentication and personalized progress tracking

## Tech Stack
- Client: React 19, Vite, Tailwind CSS, React Router, Axios
- Server: Node.js, Express, Prisma, PostgreSQL, JWT, Multer

## Project Structure
```
Smart_placement_prep_portal/
	client/              # Vite + React app
	server/              # Express API + Prisma
	docs/                # API docs and screenshots
```

## Getting Started
### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd Smart_placement_prep_portal
    ```
### Setup
1) Install dependencies
```
cd server
npm install
cd ../client
npm install
```

2) Configure environment variables
Create a `.env` file in `server/` with:
```
PORT=5000
JWT_SECRET=replace_me
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
```

3) Initialize database (Prisma)
```
cd server
npx prisma generate
npx prisma migrate dev
```

4) Run the app (two terminals)
```
cd server
npm run dev
```
```
cd client
npm run dev
```

The client uses the API base URL set in [client/src/services/api.js](client/src/services/api.js#L3). Update it if your server runs on a different host/port.

## Scripts
### Server
- `npm run dev` - start API with nodemon
- `npm start` - start API

### Client
- `npm run dev` - start Vite dev server
- `npm run build` - build for production
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Documentation
- API docs placeholder: [docs/API-documentation.md](docs/API-documentation.md)
- Screenshots: [docs/screenshots](docs/screenshots)

## License
TBD
