# 🚀 Quick Start Guide

Get the RateStore backend running in 5 minutes!

## ⚡ 5-Minute Setup

### 1. Environment Setup (1 min)

```bash
cd backend
```

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Verify `.env` has these values:
```env
DATABASE_URL=postgresql://...  # Should be populated with Neon connection
JWT_SECRET=your_secret_key    # Already has a default value
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. Database Migration (2 min)

Apply the database schema:
```bash
npx drizzle-kit push
```

You should see output like:
```
✓ Migration applied successfully
```

### 3. Start Server (1 min)

```bash
npm run dev
```

You should see:
```
🔥 Server running on port 5000
🔗 Local URL: http://localhost:5000
```

### 4. Test Connection (1 min)

Open new terminal and test the server:
```bash
curl http://localhost:5000/
```

Expected response:
```json
{"status":"active","message":"Backend Server is Running"}
```

✅ **Done!** Your backend is ready!

---

## 📱 Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## 🧪 Quick Test Flow

### 1. Create Admin Account

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@test.com",
    "password": "Admin@123",
    "address": "123 Admin St",
    "role": "system_admin"
  }'
```

Save the `token` from response.

### 2. Create Store Owner

```bash
curl -X POST http://localhost:5000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Store Owner",
    "email": "owner@test.com",
    "password": "Owner@123",
    "address": "456 Owner St",
    "role": "store_owner"
  }'
```

Note the owner's `id` from response (usually 2).

### 3. Create Store (use admin token)

```bash
curl -X POST http://localhost:5000/api/admin/create-store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Pizza Palace",
    "email": "pizza@test.com",
    "address": "789 Pizza Ave",
    "ownerId": 2
  }'
```

### 4. Create Regular User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Regular User",
    "email": "user@test.com",
    "password": "User@123",
    "address": "999 User Ln",
    "role": "user"
  }'
```

Save the token.

### 5. Browse Stores (as user)

```bash
curl http://localhost:5000/api/stores \
  -H "Authorization: Bearer USER_TOKEN"
```

### 6. Submit Rating (as user)

```bash
curl -X POST http://localhost:5000/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "storeId": 1,
    "rating": 5
  }'
```

### 7. View Admin Dashboard

```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 8. View Store Owner Dashboard

First, login as owner to get their token:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@test.com",
    "password": "Owner@123"
  }'
```

Then view dashboard:
```bash
curl http://localhost:5000/api/owner/dashboard \
  -H "Authorization: Bearer OWNER_TOKEN"
```

---

## 📚 Documentation Files

- **[BACKEND_README.md](./BACKEND_README.md)** - Complete backend overview and setup
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Database migration instructions
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Detailed API endpoint reference

---

## 🛠️ Development Tools

### View Database in Drizzle Studio

```bash
npx drizzle-kit studio
```

This opens a web UI where you can:
- View all tables and data
- Run queries
- Edit records
- Check schema

### Check Migration Status

```bash
npx drizzle-kit status
```

### Generate New Migration

After changing `drizzle/schema.js`:

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

## 📁 Project Structure

```
backend/
├── controllers/           # Business logic
│   ├── authController.js
│   ├── adminController.js
│   ├── userController.js
│   └── storeController.js
├── routes/               # API routes
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── userRoutes.js
│   └── ownerRoutes.js
├── middleware/           # Auth & validation
│   └── authMiddleware.js
├── utils/               # Utilities
│   ├── validators.js
│   └── hash.js
├── drizzle/             # Database
│   ├── schema.js        # Database schema
│   ├── db.js            # Database connection
│   └── migrations/      # Migration files
├── index.js             # Server entry point
├── drizzle.config.js    # Drizzle config
├── .env.example         # Environment template
├── package.json
└── README.md
```

---

## 🔑 Available Roles

- **`user`** - Normal user (can browse stores, rate them)
- **`store_owner`** - Store owner (can view their store's ratings)
- **`system_admin`** - Admin (can manage users, stores, view dashboards)

---

## ✅ Pre-Deployment Checklist

- [ ] `.env` file configured with DATABASE_URL
- [ ] `npm install` completed
- [ ] `npx drizzle-kit push` executed successfully
- [ ] `npm run dev` starts without errors
- [ ] Test endpoint responds: `curl http://localhost:5000/`
- [ ] Can create and login with user account
- [ ] Can browse stores
- [ ] Can submit ratings
- [ ] Frontend connects successfully

---

## 🐛 Common Issues & Solutions

### ❌ "DATABASE_URL is not set"
**Solution**: Check `.env` file has `DATABASE_URL` value

### ❌ "Cannot find module 'drizzle-orm'"
**Solution**: Run `npm install` in backend directory

### ❌ "Port 5000 already in use"
**Solution**: Kill the process or change `PORT` in `.env`

### ❌ "Cannot connect to database"
**Solution**: 
- Verify DATABASE_URL in `.env`
- Check Neon console for correct connection string
- Ensure SSL is enabled if required

### ❌ "Schema mismatch" or "migration error"
**Solution**:
- Check file is saved: ctrl+s
- Try: `npx drizzle-kit push --force`
- Last resort: `npx drizzle-kit push --force` resets database

---

## 🚀 Next Steps

1. **Extend Schema**
   - Add more fields to tables in `drizzle/schema.js`
   - Run `npx drizzle-kit push`

2. **Add More APIs**
   - Create new controller in `controllers/`
   - Define routes in `routes/`
   - Mount in `index.js`

3. **Add Validation**
   - Update validators in `utils/validators.js`
   - Use in controller before processing

4. **Deploy to Production**
   - Update `.env` with production DATABASE_URL
   - Set strong JWT_SECRET
   - Set NODE_ENV=production
   - Deploy to hosting (Vercel, Railway, Render, etc.)

---

## 📞 Support Resources

- **Drizzle Docs**: https://orm.drizzle.team/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs
- **Neon Docs**: https://neon.tech/docs
- **Express Guide**: https://expressjs.com/

---

## ✨ Features Implemented

✅ JWT Authentication (7-day expiration)  
✅ Role-Based Access Control  
✅ User Management (CRUD)  
✅ Store Management (CRUD)  
✅ Rating System (1-5 stars)  
✅ Admin Dashboard (statistics)  
✅ Store Owner Dashboard (ratings analytics)  
✅ Form Validation (all fields)  
✅ Password Hashing (bcryptjs)  
✅ Pagination & Filtering  
✅ Error Handling  
✅ CORS Configuration  
✅ Database Migrations  

---

**Version**: 1.0  
**Last Updated**: April 9, 2026  
**Status**: Ready for Development & Testing
