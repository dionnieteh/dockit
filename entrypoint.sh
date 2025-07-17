#!/bin/sh

# Run migrations
npx prisma migrate deploy

# Optional: seed your DB
npx prisma db seed

# Start the app
npm run start
