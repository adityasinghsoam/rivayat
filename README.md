# Rivayat

Rivayat is a Medium-like publishing platform for poetry and stories, built with Next.js App Router, TypeScript, Tailwind CSS, Prisma, PostgreSQL, and JWT cookie authentication.

## Features

- Email/password signup and login
- JWT-based auth stored in an HTTP-only cookie
- Create, edit, and delete posts
- Rich text post editor with tags and Hindi/English language support
- Likes and comments
- Public user profiles with editable bio and avatar URL

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- Tiptap rich text editor

## Environment

Copy `.env.example` to `.env` and update the values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rivayat?schema=public"
JWT_SECRET="replace-this-with-a-long-random-secret"
```

## Run Locally

```bash
npm install
npm run prisma:generate
npx prisma migrate dev --name init
npm run dev
```

Open `http://localhost:3000`.
