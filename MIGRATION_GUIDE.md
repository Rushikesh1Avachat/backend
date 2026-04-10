# Database Migration & Setup Guide

This guide walks you through setting up your backend database with the updated schema that includes store ownership tracking.

## 📋 What Changed

The stores table now includes an `owner_id` foreign key that links stores to their owners (users with `store_owner` or `system_admin` roles). This allows proper tracking of which stores belong to which users.

### Schema Update
```javascript
// stores table now includes:
ownerId: integer('owner_id')
  .notNull()
  .references(() => users.id, { onDelete: 'cascade' }),
```

## 🔧 Setup Steps

### Step 1: Update Environment Variables

Ensure your `.env` file has the correct Neon PostgreSQL connection string:

```env
DATABASE_URL=postgresql://neondb_owner:npg_D8vzQC6feBGW@ep-green-rice-a1jmmnfk-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your_strong_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 2: Apply Database Migration

If you haven't already pushed the updated schema to your database, do this now:

```bash
cd backend
npx drizzle-kit push
```

This will:
- Create the migration files
- Apply the changes to your Neon PostgreSQL database
- Update the `_prisma_migrations` table

**Important**: This will add the `owner_id` column to the existing `stores` table. If you have existing stores without an owner, you may need to manually assign owners or drop and recreate the database.

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Start Development Server

```bash
npm run dev
```

You should see:
```
🔥 Server running on port 5000
🔗 Local URL: http://localhost:5000
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  address TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'user', -- 'user', 'store_owner', 'system_admin'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);
```

### Stores Table (Updated)
```sql
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address TEXT NOT NULL,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX stores_email_idx ON stores(email);
CREATE INDEX stores_name_idx ON stores(name);
CREATE INDEX stores_owner_idx ON stores(owner_id);
```

### Ratings Table
```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, store_id)
);

CREATE INDEX ratings_user_idx ON ratings(user_id);
CREATE INDEX ratings_store_idx ON ratings(store_id);
```

## ⚠️ Important Notes

### If You Have Existing Data

If you already have stores in your database without the `owner_id` field, you have two options:

#### Option 1: Reset Database (Recommended for Development)
```bash
# Drop the database and recreate from scratch
# This deletes all existing data
npx drizzle-kit push --force
```

Then create new test data:
1. Create admin user via `/api/auth/register` with role: `system_admin`
2. Create store owner via admin dashboard
3. Create stores via admin dashboard (assign to store owner)
4. Create regular user via `/api/auth/register`
5. Submit ratings

#### Option 2: Manual Migration (For Production)
If you have production data:
1. Create a script to assign stores to owners
2. Update existing stores with default owner_id
3. Then push the migration

## 🧪 Testing the Setup

### 1. Check Server Health
```bash
curl http://localhost:5000/
# Response: {"status":"active","message":"Backend Server is Running"}
```

### 2. Create Test Admin User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin@123",
    "address": "123 Admin Street",
    "role": "system_admin"
  }'
```

### 3. Create Store Owner User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Store Owner",
    "email": "owner@example.com",
    "password": "Owner@123",
    "address": "456 Owner Street",
    "role": "store_owner"
  }'
```

Note: Get the `id` from the response for the next step.

### 4. Create Store (Admin creates store for owner)
First, login as admin to get token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123"
  }'
```

Get the token from response, then:
```bash
curl -X POST http://localhost:5000/api/admin/create-store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Pizza Palace",
    "email": "pizza@example.com",
    "address": "789 Pizza Street",
    "ownerId": 2
  }'
```

### 5. View Store Owner Dashboard
Login as store owner and get their token, then:
```bash
curl http://localhost:5000/api/owner/dashboard \
  -H "Authorization: Bearer OWNER_TOKEN"
```

## 🚀 Deployment Checklist

- [ ] Database URL configured in `.env`
- [ ] JWT_SECRET set to a strong value
- [ ] `npm run dev` starts without errors
- [ ] All API endpoints respond correctly
- [ ] Store owner can only see their own stores
- [ ] Admin can create stores and assign to owners
- [ ] Users can browse stores and submit ratings

## 📚 Drizzle Commands

```bash
# Push schema to database
npx drizzle-kit push

# View database in Drizzle Studio (Web UI)
npx drizzle-kit studio

# Generate migration files
npx drizzle-kit generate

# Check migration status
npx drizzle-kit status

# Drop all tables and recreate
npx drizzle-kit push --force
```

## ❌ Troubleshooting

### Issue: "owner_id column does not exist"
**Solution**: Run `npx drizzle-kit push` to apply the migration

### Issue: Database connection failed
**Solution**: 
- Verify DATABASE_URL in `.env`
- Check Neon console for connection string
- Ensure SSL is enabled if required

### Issue: "Foreign key constraint failed"
**Solution**: Ensure ownerId exists in users table with correct role

### Issue: Store owner sees other stores
**Solution**: 
- Make sure storeController filters by `ownerId`
- Verify `req.user.id` is being set correctly by auth middleware

## 📞 Support

For more information:
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Neon Console](https://console.neon.tech)

---

**Last Updated**: April 9, 2026
**Migration Version**: 1.1 (Added owner_id to stores)
