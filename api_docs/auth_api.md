# Authentication API Documentation

## Overview

The Healix Authentication API provides endpoints for user registration, login, logout, and profile management. The API uses **Token-based Authentication** with Django REST Framework's token authentication system.

## Authentication Method

This API uses **HTTP Token Authentication**. After logging in, clients receive an authentication token that must be included in the `Authorization` header for all protected endpoints.

### Authorization Header Format
```
Authorization: Token <your-token-here>
```

---

## Endpoints

### 1. User Registration

Register a new user account.

**Endpoint:** `POST /api/auth/register/`

**Permission:** Public (AllowAny)

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Unique username |
| email | string | Yes | Unique email address |
| password | string | Yes | Password (must meet validation requirements) |
| first_name | string | No | User's first name |
| last_name | string | No | User's last name |

**Response (201 Created):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "date_joined": "2026-02-21T10:30:00Z"
}
```

**Status Codes:**
- `201 Created` - User successfully registered
- `400 Bad Request` - Invalid data or validation errors

**Error Examples:**
```json
{
  "email": ["This field must be unique."]
}
```
```json
{
  "password": ["Password fields didn't match."]
}
```

---

### 2. User Login

Authenticate user and obtain authentication token.

**Endpoint:** `POST /api/auth/login/`

**Permission:** Public (AllowAny)

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Request Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | Yes | Username |
| password | string | Yes | Password |

**Response (200 OK):**
```json
{
  "token": "9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b",
  "user_id": 1,
  "username": "john_doe",
  "email": "john@example.com"
}
```

**Status Codes:**
- `200 OK` - Login successful
- `400 Bad Request` - Invalid credentials

---

### 3. User Logout

Logout user by invalidating their authentication token.

**Endpoint:** `POST /api/auth/logout/`

**Permission:** Authenticated (IsAuthenticated)

**Headers Required:**
```
Authorization: Token <your-token-here>
```

**Request Body:** Empty

**Response (200 OK):**
```json
{
  "message": "Successfully logged out"
}
```

**Status Codes:**
- `200 OK` - Logout successful, token deleted
- `400 Bad Request` - User not logged in
- `401 Unauthorized` - Invalid or missing token

---

### 4. Get User Profile

Retrieve the current authenticated user's profile information.

**Endpoint:** `GET /api/auth/profile/`

**Permission:** Authenticated (IsAuthenticated)

**Headers Required:**
```
Authorization: Token <your-token-here>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "date_joined": "2026-02-21T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Profile retrieved successfully
- `401 Unauthorized` - Invalid or missing token

---

### 5. Update User Profile

Update the current authenticated user's profile information.

**Endpoint:** `PUT /api/auth/profile/update/` or `PATCH /api/auth/profile/update/`

**Permission:** Authenticated (IsAuthenticated)

**Headers Required:**
```
Authorization: Token <your-token-here>
```

**Request Body (Partial Update):**
```json
{
  "first_name": "Jonathan",
  "last_name": "Doe",
  "email": "jonathan@example.com"
}
```

**Request Fields (All Optional for PATCH):**
| Field | Type | Description |
|-------|------|-------------|
| email | string | User's email address (must be unique) |
| first_name | string | User's first name |
| last_name | string | User's last name |

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "jonathan@example.com",
  "first_name": "Jonathan",
  "last_name": "Doe",
  "date_joined": "2026-02-21T10:30:00Z"
}
```

**Status Codes:**
- `200 OK` - Profile updated successfully
- `400 Bad Request` - Invalid data
- `401 Unauthorized` - Invalid or missing token

**Notes:**
- Username cannot be changed
- Use `PATCH` for partial updates
- Use `PUT` for full updates

---

### 6. Get Users List

Retrieve a list of all users (Admin only).

**Endpoint:** `GET /api/users/`

**Permission:** Authenticated & Staff (IsAuthenticated + is_staff check)

**Headers Required:**
```
Authorization: Token <your-token-here>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_joined": "2026-02-21T10:30:00Z"
  },
  {
    "id": 2,
    "username": "jane_smith",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Smith",
    "date_joined": "2026-02-21T11:45:00Z"
  }
]
```

**Status Codes:**
- `200 OK` - Users list retrieved successfully
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - User is not staff/admin

---

## Usage Examples

### Example 1: Complete Authentication Flow

**Step 1: Register**
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

**Step 2: Login**
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "SecurePass123!"
  }'
```

Response includes token (e.g., `9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b`)

**Step 3: Access Protected Endpoints**
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

**Step 4: Logout**
```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b"
```

### Example 2: Update Profile

```bash
curl -X PATCH http://localhost:8000/api/auth/profile/update/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token 9944b09199c62bcf9418ad846dd0e4bbdfc6ee4b" \
  -d '{
    "first_name": "Jonathan",
    "email": "jonathan@example.com"
  }'
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized - Missing or Invalid Token**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

**401 Unauthorized - Invalid Token**
```json
{
  "detail": "Invalid token."
}
```

**403 Forbidden - Insufficient Permissions**
```json
{
  "error": "Permission denied"
}
```

**400 Bad Request - Validation Errors**
```json
{
  "username": ["A user with that username already exists."],
  "email": ["Enter a valid email address."]
}
```

---

## Token Management

### Obtaining a Token
- Tokens are automatically created when a user registers or logs in
- Tokens are returned in the login response

### Using a Token
- Include the token in the `Authorization` header as: `Authorization: Token <token>`
- Tokens are persistent and don't expire (unless manually deleted)

### Invalidating a Token
- Call the logout endpoint to delete the token
- Users can only logout if they have a valid token

---

## Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                 User Registration                            │
│  POST /api/auth/register/ (username, email, password, etc)  │
│                                                              │
│  Response: User object (no token yet)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Login                                │
│     POST /api/auth/login/ (username, password)             │
│                                                              │
│  Response: Token + User Info                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            Access Protected Endpoints                        │
│  (Include token in Authorization header)                   │
│                                                              │
│  • GET /api/auth/profile/                                  │
│  • PUT /api/auth/profile/update/                           │
│  • POST /api/auth/logout/                                  │
│  • GET /api/users/                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Notes

- **Password Requirements:** Passwords must meet Django's default validation requirements (minimum length, complexity, etc.)
- **Token Security:** Treat tokens like passwords. Never commit them to version control.
- **CORS:** If frontend and backend are on different origins, ensure CORS is properly configured.
- **Rate Limiting:** Consider implementing rate limiting on authentication endpoints in production.
- **Admin Only:** The `/api/users/` endpoint requires the user to have `is_staff` flag set to `True`.

---

## Version

- **API Version:** 1.0
- **Framework:** Django REST Framework
- **Authentication Type:** Token
- **Last Updated:** February 21, 2026
