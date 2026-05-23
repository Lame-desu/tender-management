#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."

# Wait for the database to accept connections
until node -e "const net = require('net'); const s = net.connect({host: 'db', port: 5432}, () => { s.end(); process.exit(0); }); s.on('error', () => process.exit(1));" 2>/dev/null; do
  echo "   PostgreSQL is not ready yet — retrying in 2s..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations complete!"

# Seed the database only if it hasn't been seeded yet
USER_COUNT=$(node -e "
  const { PrismaClient } = require('@prisma/client');
  const p = new PrismaClient();
  p.user.count().then(c => { console.log(c); p.\$disconnect(); }).catch(() => { console.log('0'); p.\$disconnect(); });
")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 First run detected — seeding database..."
  npx tsx prisma/seed.ts
  echo "✅ Seed complete!"
else
  echo "✅ Database already seeded ($USER_COUNT users found) — skipping seed."
fi

# Start the server
echo "🚀 Starting backend server..."
exec node dist/server.js
