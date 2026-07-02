# hTracker

A minimal habit tracker with a GitHub-style contribution heatmap for daily check-ins.

Create habits, check them off day by day, and watch a full year of consistency build up in a
heatmap, using the same visual language as GitHub's contribution graph, applied to your own habits.

## Features

- **Auth**: sign up / log in with a username and password (JWT-based sessions)
- **Habit management**: create, edit, and delete habits
- **Daily check-ins**: toggle a habit done/not-done for any past or current day (future dates are blocked)
- **Heatmap view**: a 53-week GitHub-style grid per habit, with month labels, hover tooltips, and click-to-toggle
- **Landing page**: a public marketing page for signed-out visitors; signed-in users are routed straight to their dashboard

## Tech stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, both the UI and the API routes live in this one app)
- **Database:** MongoDB via [Prisma](https://www.prisma.io/)
- **Auth:** JWT (`jsonwebtoken`) + password hashing (`bcryptjs`)
- **Validation:** [Zod](https://zod.dev/)
- **UI:** [shadcn/ui](https://ui.shadcn.com/) on [Tailwind CSS v4](https://tailwindcss.com/), built on [Base UI](https://base-ui.com/) primitives
- **Icons:** [lucide-react](https://lucide.dev/)
- **Toasts:** [sonner](https://sonner.emilkowal.ski/)

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster works fine)

### Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with:

   ```bash
   DATABASE_URL="<your MongoDB connection string>"
   JWT_SECRET="<any random string>"
   ```

3. Generate the Prisma client:

   ```bash
   npx prisma generate
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000). You'll land on the marketing page; sign up to create an account and start tracking habits.

### Other scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the project |

## Project structure

```
app/
  api/                    API routes (auth, habits, check-ins, logs)
    @lib/                 Prisma client singleton
    @utils/               Auth guard, validators
  login/, signup/         Public auth pages
  (protected)/            Dashboard + habit detail, gated behind auth
  page.tsx                Public landing page
components/
  ui/                     shadcn/ui primitives
  *.tsx                   App-specific components (Heatmap, HabitCard, etc.)
lib/                       Client-side API helper, auth context, heatmap date utilities
prisma/schema.prisma       User / Habit / HabitLog models
```

## API overview

All routes below are under `/api`. Authenticated routes expect an `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/signup` | No | Register a new user |
| POST | `/login` | No | Log in, returns a JWT |
| GET | `/habits` | Yes | List the current user's habits |
| POST | `/habits` | Yes | Create a habit |
| PUT | `/habits/:habitId` | Yes | Update a habit |
| DELETE | `/habits/:habitId` | Yes | Delete a habit and its check-in history |
| POST | `/habits/:habitId/check` | Yes | Toggle a check-in for a given date |
| GET | `/logs?start=&end=` | Yes | Fetch check-ins in a date range, for the heatmap |

## Data model

```
User (1) ──< Habit (N) ──< HabitLog (N)
```

Each `HabitLog` row is one filled-in day on the heatmap for a given habit, unique per
`(habitId, date)`.
