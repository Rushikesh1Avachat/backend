# RateStore Backend API Documentation

Complete API reference for the RateStore backend application.

## 📋 Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Auth](#auth)
  - [Admin](#admin)
  - [User](#user)
  - [Store Owner](#store-owner)

## 🌐 Base URL

```
http://localhost:5000/api
```

## 🔐 Authentication

### JWT Token Format

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Token Structure

- **Issued by**: `/auth/register` and `/auth/login`
- **Expiration**: 7 days
- **Payload includes**: `id`, `email`, `name`, `role`, `address`
- **Storage**: Frontend stores in localStorage as `user` object

## ❌ Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": "Description of what went wrong"
}
```

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Data retrieved/updated successfully |
| 201 | Created | New resource created |
| 400 | Bad Request | Invalid input or validation failed |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks required permissions/role |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

## 🔌 Endpoints

---

## Auth

### Register New User

**Endpoint**: `POST /auth/register`

**Authentication**: No (Public)

**Request Body**:
```json
{
  "name": "John User",
  "email": "user@example.com",
  "password": "User@123",
  "address": "123 Main Street, City",
  "role": "user"
}
```

**Validation Rules**:
- `name`: 20-60 characters
- `email`: Valid email format, must be unique
- `password`: 8-16 characters, must include 1 uppercase letter and 1 special character
- `address`: Maximum 400 characters
- `role`: `user`, `store_owner`, or `system_admin`

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John User",
    "email": "user@example.com",
    "address": "123 Main Street, City",
    "role": "user",
    "createdAt": "2024-04-09T10:30:00Z",
    "updatedAt": "2024-04-09T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "user@example.com",
    "password": "User@123",
    "address": "123 Main Street, City",
    "role": "user"
  }'
```

---

### Login

**Endpoint**: `POST /auth/login`

**Authentication**: No (Public)

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "User@123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John User",
    "email": "user@example.com",
    "address": "123 Main Street, City",
    "role": "user",
    "createdAt": "2024-04-09T10:30:00Z",
    "updatedAt": "2024-04-09T10:30:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "User@123"
  }'
```

---

### Change Password

**Endpoint**: `POST /auth/change-password`

**Authentication**: Required (JWT Token)

**Request Body**:
```json
{
  "oldPassword": "User@123",
  "newPassword": "NewPass@456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "oldPassword": "User@123",
    "newPassword": "NewPass@456"
  }'
```

---

## Admin

**Role Required**: `system_admin`

### Get Admin Dashboard

**Endpoint**: `GET /admin/dashboard`

**Authentication**: Required (JWT Token - Admin)

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "success": true,
  "dashboard": {
    "totalUsers": 5,
    "totalStores": 3,
    "totalRatings": 12,
    "recentUsers": [
      {
        "id": 1,
        "name": "John User",
        "email": "john@example.com",
        "role": "user",
        "createdAt": "2024-04-09T10:30:00Z"
      }
    ]
  }
}
```

**Example cURL**:
```bash
curl http://localhost:5000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Get Users List

**Endpoint**: `GET /admin/users`

**Authentication**: Required (JWT Token - Admin)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 10 | Items per page |
| sortBy | string | name | Sort field (name, email, role) |
| sortOrder | string | asc | Sort direction (asc/desc) |
| name | string | - | Filter by user name (partial match) |
| email | string | - | Filter by user email (partial match) |
| role | string | - | Filter by user role |

**Response** (200 OK):
```json
{
  "success": true,
  "users": [
    {
      "id": 1,
      "name": "John User",
      "email": "user@example.com",
      "address": "123 Main Street",
      "role": "user",
      "createdAt": "2024-04-09T10:30:00Z",
      "updatedAt": "2024-04-09T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

**Example cURL**:
```bash
curl "http://localhost:5000/api/admin/users?page=1&limit=10&sortBy=name&sortOrder=asc" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Create User

**Endpoint**: `POST /admin/create-user`

**Authentication**: Required (JWT Token - Admin)

**Request Body**:
```json
{
  "name": "New User",
  "email": "newuser@example.com",
  "password": "Pass@1234",
  "address": "456 Oak Street",
  "role": "user"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": 6,
    "name": "New User",
    "email": "newuser@example.com",
    "address": "456 Oak Street",
    "role": "user",
    "createdAt": "2024-04-09T10:35:00Z",
    "updatedAt": "2024-04-09T10:35:00Z"
  }
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "New User",
    "email": "newuser@example.com",
    "password": "Pass@1234",
    "address": "456 Oak Street",
    "role": "user"
  }'
```

---

### Get Stores List

**Endpoint**: `GET /admin/stores`

**Authentication**: Required (JWT Token - Admin)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |
| sortBy | string | name | Sort field (name, email, address) |
| sortOrder | string | asc | Sort direction |
| name | string | - | Filter by store name |
| email | string | - | Filter by store email |
| address | string | - | Filter by store address |

**Response** (200 OK):
```json
{
  "success": true,
  "stores": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "email": "pizza@example.com",
      "address": "789 Pizza Street",
      "ownerId": 3,
      "averageRating": 4.5,
      "totalRatings": 10,
      "createdAt": "2024-04-09T10:20:00Z",
      "updatedAt": "2024-04-09T10:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 3,
    "pages": 1
  }
}
```

**Example cURL**:
```bash
curl "http://localhost:5000/api/admin/stores?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

### Create Store

**Endpoint**: `POST /admin/create-store`

**Authentication**: Required (JWT Token - Admin)

**Request Body**:
```json
{
  "name": "Burger King",
  "email": "burgers@example.com",
  "address": "999 Burger Lane",
  "ownerId": 3
}
```

**Validation**: 
- `ownerId` must reference a user with `store_owner` or `system_admin` role
- Store email must be unique

**Response** (201 Created):
```json
{
  "success": true,
  "store": {
    "id": 4,
    "name": "Burger King",
    "email": "burgers@example.com",
    "address": "999 Burger Lane",
    "ownerId": 3,
    "averageRating": 0,
    "totalRatings": 0,
    "createdAt": "2024-04-09T10:40:00Z",
    "updatedAt": "2024-04-09T10:40:00Z"
  }
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/admin/create-store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Burger King",
    "email": "burgers@example.com",
    "address": "999 Burger Lane",
    "ownerId": 3
  }'
```

---

## User

**Role**: Any authenticated user

### Get All Stores

**Endpoint**: `GET /stores`

**Authentication**: Optional (JWT Token)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| search | string | - | Search in store name and address |
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |

**Response** (200 OK):
```json
{
  "success": true,
  "stores": [
    {
      "id": 1,
      "name": "Pizza Palace",
      "email": "pizza@example.com",
      "address": "789 Pizza Street",
      "ownerId": 3,
      "averageRating": 4.5,
      "totalRatings": 10,
      "userRating": {
        "id": 5,
        "rating": 5,
        "createdAt": "2024-04-09T09:15:00Z"
      },
      "createdAt": "2024-04-09T10:20:00Z",
      "updatedAt": "2024-04-09T10:20:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "pages": 1
  }
}
```

**Notes**:
- `averageRating`: Calculated from all ratings for the store
- `totalRatings`: Count of all ratings
- `userRating`: Only included if authenticated user has rated this store
- Route is public but `userRating` only shows if authenticated

**Example cURL**:
```bash
# Without authentication
curl "http://localhost:5000/api/stores?search=Pizza&page=1&limit=12"

# With authentication
curl "http://localhost:5000/api/stores?search=Pizza" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### Submit Rating

**Endpoint**: `POST /ratings`

**Authentication**: Required (JWT Token)

**Request Body**:
```json
{
  "storeId": 1,
  "rating": 5
}
```

**Validation**:
- `storeId`: Must be a valid store ID
- `rating`: Must be an integer between 1-5
- User can only have one rating per store

**Response** (201 Created):
```json
{
  "success": true,
  "rating": {
    "id": 15,
    "userId": 1,
    "storeId": 1,
    "rating": 5,
    "createdAt": "2024-04-09T11:00:00Z",
    "updatedAt": "2024-04-09T11:00:00Z"
  }
}
```

**Error Response** (400 Bad Request):
```json
{
  "success": false,
  "error": "You have already rated this store"
}
```

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "storeId": 1,
    "rating": 5
  }'
```

---

### Update Rating

**Endpoint**: `PUT /ratings/:id`

**Authentication**: Required (JWT Token)

**URL Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | number | Rating ID |

**Request Body**:
```json
{
  "rating": 4
}
```

**Validation**:
- User must be the owner of the rating
- `rating`: Must be between 1-5

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Rating updated successfully"
}
```

**Error Response** (403 Forbidden):
```json
{
  "success": false,
  "error": "You can only update your own ratings"
}
```

**Example cURL**:
```bash
curl -X PUT http://localhost:5000/api/ratings/15 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rating": 4
  }'
```

---

## Store Owner

**Role Required**: `store_owner` or `system_admin`

### Get Owner Dashboard

**Endpoint**: `GET /owner/dashboard`

**Authentication**: Required (JWT Token - Store Owner)

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 10 | Items per page |

**Response** (200 OK):
```json
{
  "success": true,
  "dashboard": {
    "storeId": 1,
    "storeName": "Pizza Palace",
    "averageRating": 4.5,
    "totalRatings": 10,
    "ratings": [
      {
        "_id": 15,
        "userId": 1,
        "userName": "John User",
        "userEmail": "user@example.com",
        "rating": 5,
        "createdAt": "2024-04-09T11:00:00Z"
      },
      {
        "_id": 14,
        "userId": 2,
        "userName": "Jane Doe",
        "userEmail": "jane@example.com",
        "rating": 4,
        "createdAt": "2024-04-09T10:50:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 10,
      "pages": 1
    }
  }
}
```

**Features**:
- Shows only stores owned by the authenticated user (filters by `ownerId`)
- Lists all ratings for their store(s)
- Shows user information for each rater
- Paginated ratings list

**Example cURL**:
```bash
curl "http://localhost:5000/api/owner/dashboard?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_STORE_OWNER_TOKEN"
```

---

## 🔄 Workflow Examples

### Example 1: Complete User Flow

1. **Register as Normal User**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "Alice@123",
    "address": "111 Main Street",
    "role": "user"
  }'
```

2. **Browse Stores**
```bash
curl "http://localhost:5000/api/stores?search=Pizza" \
  -H "Authorization: Bearer ALICE_TOKEN"
```

3. **Submit Rating**
```bash
curl -X POST http://localhost:5000/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ALICE_TOKEN" \
  -d '{
    "storeId": 1,
    "rating": 5
  }'
```

### Example 2: Admin User Setup

1. **Register as Admin**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin@123",
    "address": "999 Admin Lane",
    "role": "system_admin"
  }'
```

2. **Create Store Owner User**
```bash
curl -X POST http://localhost:5000/api/admin/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Bob Smith",
    "email": "bob@example.com",
    "password": "Bob@1234",
    "address": "222 Owner Street",
    "role": "store_owner"
  }'
```

3. **Create Store for Owner**
```bash
curl -X POST http://localhost:5000/api/admin/create-store \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Bob\'s Restaurant",
    "email": "restaurant@example.com",
    "address": "333 Restaurant Ave",
    "ownerId": 2
  }'
```

4. **View Dashboard as Store Owner**
```bash
curl http://localhost:5000/api/owner/dashboard \
  -H "Authorization: Bearer BOB_TOKEN"
```

---

## 📊 Response Time Guidelines

| Endpoint | Typical Response Time |
|----------|----------------------|
| GET /stores | 50-100ms |
| GET /admin/dashboard | 30-50ms |
| POST /auth/login | 200-300ms (bcrypt) |
| GET /admin/users (page=1) | 50-100ms |
| POST /ratings | 100-150ms |

---

## 🔒 Security Headers

The API includes:
- CORS configuration for frontend safety
- JWT token validation on protected routes
- Role-based access control
- Input validation on all endpoints
- Password hashing with bcryptjs

---

**API Version**: 1.0  
**Last Updated**: April 9, 2026  
**Status**: Production Ready
