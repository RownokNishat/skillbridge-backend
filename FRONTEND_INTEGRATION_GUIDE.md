# SkillBridge Frontend Integration Guide

Complete guide for integrating the SkillBridge backend API with your Next.js/React frontend.

---

## Table of Contents

1. [API Base URL](#api-base-url)
2. [Authentication Flow](#authentication-flow)
3. [Public Features](#public-features)
4. [Student Journey](#student-journey)
5. [Tutor Journey](#tutor-journey)
6. [Admin Features](#admin-features)
7. [Error Handling](#error-handling)
8. [Complete API Reference](#complete-api-reference)

---

## API Base URL

```javascript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

All requests should include credentials for cookie-based authentication:

```javascript
const response = await fetch(`${API_URL}/api/endpoint`, {
  credentials: 'include', // Important for Better-Auth cookies
  headers: {
    'Content-Type': 'application/json',
  }
});
```

---

## Authentication Flow

### 1. Register New User

```javascript
const register = async (userData) => {
  const response = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role: userData.role, // "STUDENT" or "TUTOR"
      phone: userData.phone // optional
    })
  });

  const data = await response.json();
  // data.nextStep tells you what to do next
  // For STUDENT: "READY" - can start booking
  // For TUTOR: "COMPLETE_PROFILE" - must create profile first
  return data;
};
```

### 2. Login

```javascript
const login = async (email, password) => {
  const response = await fetch(`${API_URL}/api/auth/sign-in`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  // Session cookie is automatically set
  return data;
};
```

### 3. Get Current Session

```javascript
const getSession = async () => {
  const response = await fetch(`${API_URL}/api/get-session`, {
    credentials: 'include'
  });

  const data = await response.json();
  /*
  Response:
  {
    success: true,
    data: {
      user: {
        id: "user-id",
        email: "user@example.com",
        name: "User Name",
        role: "STUDENT" | "TUTOR" | "ADMIN",
        emailVerified: true
      }
    }
  }
  */
  return data;
};
```

### 4. Check Registration Status (for multi-step flows)

```javascript
const checkStatus = async () => {
  const response = await fetch(`${API_URL}/api/register/status`, {
    credentials: 'include'
  });

  const data = await response.json();
  /*
  Response includes:
  - nextStep: "COMPLETE_PROFILE" | "UPDATE_PROFILE" | "SET_AVAILABILITY" | "READY"
  - profileComplete: boolean
  - tutorProfile: object | null
  */
  return data;
};
```

### 5. Logout

```javascript
const logout = async () => {
  const response = await fetch(`${API_URL}/api/auth/sign-out`, {
    method: 'POST',
    credentials: 'include'
  });
  return response.ok;
};
```

---

## Public Features

### 1. Get Featured Tutors (Landing Page)

```javascript
const getFeaturedTutors = async () => {
  const response = await fetch(`${API_URL}/api/tutors/featured`);
  const data = await response.json();
  /*
  Returns top 6 tutors with:
  - Basic info (name, email, bio, hourlyRate, experience)
  - Categories
  - Average rating
  - Total reviews
  */
  return data.data;
};
```

### 2. Browse All Tutors (with filters)

```javascript
const getTutors = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
  if (filters.categoryId) params.append('categoryId', filters.categoryId);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

  const response = await fetch(`${API_URL}/api/tutors?${params}`);
  const data = await response.json();
  /*
  Returns array of tutors with:
  - Profile info
  - Categories
  - Average rating
  - Total reviews count
  */
  return data.data;
};
```

### 3. View Tutor Profile (with reviews)

```javascript
const getTutorById = async (tutorId) => {
  const response = await fetch(`${API_URL}/api/tutors/${tutorId}`);
  const data = await response.json();
  /*
  Returns:
  - Complete tutor profile
  - Categories
  - All reviews with student details
  - Average rating
  - Total reviews
  */
  return data.data;
};
```

### 4. Get All Categories

```javascript
const getCategories = async () => {
  const response = await fetch(`${API_URL}/api/categories`);
  const data = await response.json();
  return data.data;
};
```

---

## Student Journey

### Complete Student Flow

```javascript
// STEP 1: Register as Student
const newStudent = await register({
  name: "John Doe",
  email: "john@student.com",
  password: "password123",
  role: "STUDENT"
});
// nextStep: "READY" ✅

// STEP 2: Login
await login("john@student.com", "password123");

// STEP 3: Browse Featured Tutors
const featuredTutors = await getFeaturedTutors();

// STEP 4: Search for Tutors
const tutors = await getTutors({
  searchTerm: "programming",
  categoryId: 1,
  minPrice: 30,
  maxPrice: 60
});

// STEP 5: View Tutor Profile
const tutor = await getTutorById(tutors[0].userId);

// STEP 6: Book a Session
const booking = await createBooking({
  tutorId: tutor.userId,
  startTime: "2026-02-10T10:00:00Z",
  endTime: "2026-02-10T11:00:00Z"
});

// STEP 7: View My Bookings
const myBookings = await getMyBookings();

// STEP 8: After Session - Leave a Review
const review = await createReview({
  tutorId: tutor.userId,
  rating: 5,
  comment: "Excellent tutor!"
});
```

### 1. Create Booking

```javascript
const createBooking = async (bookingData) => {
  const response = await fetch(`${API_URL}/api/bookings`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tutorId: bookingData.tutorId,
      startTime: bookingData.startTime, // ISO 8601 string
      endTime: bookingData.endTime       // ISO 8601 string
    })
  });

  const data = await response.json();
  /*
  Validation rules:
  - Tutor must exist
  - End time must be after start time
  - Cannot book in the past
  - No overlapping bookings for the tutor
  - Creates booking with status "PENDING"
  */
  return data.data;
};
```

### 2. View My Bookings

```javascript
const getMyBookings = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.order) params.append('order', filters.order);

  const response = await fetch(
    `${API_URL}/api/bookings?${params}`,
    { credentials: 'include' }
  );

  const data = await response.json();
  /*
  Returns bookings with:
  - Booking details (startTime, endTime, status)
  - Tutor information (name, email)
  - For students: shows their bookings
  - For tutors: shows their teaching sessions
  */
  return data.data;
};
```

### 3. Get Booking Details

```javascript
const getBookingById = async (bookingId) => {
  const response = await fetch(
    `${API_URL}/api/bookings/${bookingId}`,
    { credentials: 'include' }
  });

  const data = await response.json();
  return data.data;
};
```

### 4. Cancel Booking

```javascript
const cancelBooking = async (bookingId) => {
  const response = await fetch(
    `${API_URL}/api/bookings/${bookingId}/cancel`,
    {
      method: 'PATCH',
      credentials: 'include'
    }
  );

  const data = await response.json();
  /*
  Rules:
  - Cannot cancel COMPLETED bookings
  - Cannot cancel already CANCELLED bookings
  - Both students and tutors can cancel
  */
  return data.data;
};
```

### 5. Leave Review

```javascript
const createReview = async (reviewData) => {
  const response = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tutorId: reviewData.tutorId,
      rating: reviewData.rating,    // 1-5
      comment: reviewData.comment
    })
  });

  const data = await response.json();
  /*
  Validation:
  - Rating must be 1-5
  - Must have completed at least one session with the tutor
  - One review per student-tutor pair (no duplicates)
  */
  return data.data;
};
```

### 6. Manage Student Profile

```javascript
// Get Profile
const getStudentProfile = async () => {
  const response = await fetch(
    `${API_URL}/api/student/profile`,
    { credentials: 'include' }
  );

  const data = await response.json();
  /*
  Returns:
  - User info (id, name, email, phone, image)
  - Statistics (totalBookings, completedBookings, upcomingBookings, reviewsGiven)
  */
  return data.data;
};

// Update Profile
const updateStudentProfile = async (updates) => {
  const response = await fetch(`${API_URL}/api/student/profile`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: updates.name,     // optional
      phone: updates.phone,   // optional
      image: updates.image    // optional
    })
  });

  const data = await response.json();
  return data.data;
};
```

---

## Tutor Journey

### Complete Tutor Flow

```javascript
// STEP 1: Register as Tutor
const newTutor = await register({
  name: "Jane Smith",
  email: "jane@tutor.com",
  password: "password123",
  role: "TUTOR"
});
// nextStep: "COMPLETE_PROFILE"

// STEP 2: Login
await login("jane@tutor.com", "password123");

// STEP 3: Create Tutor Profile
const profile = await setupTutorProfile({
  bio: "Experienced software engineer...",
  hourlyRate: 50,
  experience: 10,
  categoryIds: [1, 2] // Programming, Mathematics
});

// STEP 4: Set Availability
await updateAvailability({
  monday: ["09:00-17:00"],
  wednesday: ["09:00-17:00"],
  friday: ["09:00-17:00"]
});

// STEP 5: View Dashboard
const stats = await getTutorDashboard();

// STEP 6: View Sessions
const sessions = await getTutorSessions({ status: "CONFIRMED" });

// STEP 7: Mark Session Complete
await markSessionComplete(sessionId);
```

### 1. Setup Tutor Profile

```javascript
const setupTutorProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/api/register/setup-profile`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bio: profileData.bio,
      hourlyRate: profileData.hourlyRate,
      experience: profileData.experience,
      categoryIds: profileData.categoryIds, // Array of category IDs
      availability: profileData.availability // optional JSON string or object
    })
  });

  const data = await response.json();
  return data.data;
};
```

### 2. Update Tutor Profile

```javascript
const updateTutorProfile = async (updates) => {
  const response = await fetch(`${API_URL}/api/tutor/profile`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      bio: updates.bio,
      hourlyRate: updates.hourlyRate,
      experience: updates.experience,
      categoryIds: updates.categoryIds,
      availability: updates.availability
    })
  });

  const data = await response.json();
  return data.data;
};
```

### 3. Get My Tutor Profile

```javascript
const getMyTutorProfile = async () => {
  const response = await fetch(
    `${API_URL}/api/tutor/profile`,
    { credentials: 'include' }
  );

  const data = await response.json();
  return data.data;
};
```

### 4. Update Availability

```javascript
const updateAvailability = async (availability) => {
  // Availability can be sent as object (will be auto-converted to JSON string)
  const response = await fetch(`${API_URL}/api/tutor/availability`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      availability: availability // Object or JSON string
    })
  });

  const data = await response.json();
  return data.data;
};

// Example usage:
await updateAvailability({
  monday: ["09:00-10:00", "10:00-11:00", "14:00-15:00"],
  tuesday: ["10:00-12:00"],
  wednesday: ["09:00-17:00"]
});
```

### 5. Get Tutor Dashboard

```javascript
const getTutorDashboard = async () => {
  const response = await fetch(
    `${API_URL}/api/tutor/dashboard`,
    { credentials: 'include' }
  );

  const data = await response.json();
  /*
  Returns:
  - totalSessions
  - completedSessions
  - upcomingSessions
  - pendingSessions
  - totalReviews
  - averageRating
  - totalEarnings
  - recentSessions (last 5)
  */
  return data.data;
};
```

### 6. Get My Teaching Sessions

```javascript
const getTutorSessions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);

  const response = await fetch(
    `${API_URL}/api/tutor/sessions?${params}`,
    { credentials: 'include' }
  );

  const data = await response.json();
  return data.data;
};
```

### 7. Mark Session as Complete

```javascript
const markSessionComplete = async (bookingId) => {
  const response = await fetch(
    `${API_URL}/api/tutor/sessions/${bookingId}/complete`,
    {
      method: 'PATCH',
      credentials: 'include'
    }
  );

  const data = await response.json();
  /*
  Rules:
  - Only CONFIRMED bookings can be marked complete
  - Only the tutor of the booking can mark it complete
  */
  return data.data;
};
```

---

## Admin Features

### 1. Get All Users

```javascript
const getAllUsers = async () => {
  const response = await fetch(
    `${API_URL}/api/admin/users`,
    { credentials: 'include' }
  );

  const data = await response.json();
  return data.data;
};
```

### 2. Get All Bookings (Admin View)

```javascript
const getAllBookings = async () => {
  const response = await fetch(
    `${API_URL}/api/bookings`,
    { credentials: 'include' }
  );

  const data = await response.json();
  return data.data;
};
```

---

## Error Handling

All API endpoints return a consistent error format:

```javascript
{
  "success": false,
  "message": "Error message here"
}
```

### Common HTTP Status Codes

- **200** - Success
- **201** - Created successfully
- **400** - Bad request / Validation error
- **401** - Unauthorized (not logged in)
- **403** - Forbidden (wrong role or permissions)
- **404** - Not found
- **500** - Server error

### Example Error Handling

```javascript
const handleApiCall = async (apiFunction) => {
  try {
    const response = await apiFunction();

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Something went wrong');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    throw error;
  }
};
```

---

## Complete API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | None | Register new user |
| POST | `/api/auth/sign-in` | None | Login user |
| POST | `/api/auth/sign-out` | None | Logout user |
| GET | `/api/get-session` | Required | Get current session |
| GET | `/api/register/status` | Required | Check profile status |
| POST | `/api/register/setup-profile` | TUTOR | Setup tutor profile |

### Public Endpoints (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tutors/featured` | Get top 6 tutors |
| GET | `/api/tutors` | Browse all tutors (with filters) |
| GET | `/api/tutors/:id` | View tutor profile + reviews |
| GET | `/api/categories` | Get all categories |

### Student Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/student/profile` | Get student profile |
| PUT | `/api/student/profile` | Update student profile |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings` | Get my bookings |
| GET | `/api/bookings/:id` | Get booking details |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking |
| POST | `/api/reviews` | Leave review |

### Tutor Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tutor/profile` | Get my tutor profile |
| PUT | `/api/tutor/profile` | Update tutor profile |
| PUT | `/api/tutor/availability` | Update availability |
| GET | `/api/tutor/sessions` | Get my teaching sessions |
| PATCH | `/api/tutor/sessions/:id/complete` | Mark session complete |
| GET | `/api/tutor/dashboard` | Get dashboard stats |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/users` | Get all users |
| PATCH | `/api/admin/users/:id` | Update user status |

---

## Frontend Implementation Tips

### 1. Create an API Helper

```javascript
// lib/api.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = {
  async call(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }
};
```

### 2. Use React Query / SWR

```javascript
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Fetch featured tutors
export const useFeaturedTutors = () => {
  return useQuery({
    queryKey: ['tutors', 'featured'],
    queryFn: async () => {
      const data = await api.call('/api/tutors/featured');
      return data.data;
    }
  });
};

// Create booking
export const useCreateBooking = () => {
  return useMutation({
    mutationFn: async (bookingData) => {
      const data = await api.call('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      });
      return data.data;
    }
  });
};
```

### 3. Protected Routes

```javascript
// middleware.ts
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const sessionCookie = request.cookies.get('better-auth.session_token');

  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Validate session with backend
  const session = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/get-session`, {
    headers: {
      Cookie: `better-auth.session_token=${sessionCookie.value}`
    }
  });

  if (!session.ok) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const data = await session.json();
  const userRole = data.data.user.role;

  // Role-based routing
  if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (request.nextUrl.pathname.startsWith('/tutor') && userRole !== 'TUTOR') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/tutor/:path*', '/dashboard/:path*']
};
```

---

## Testing Credentials

From the seed data:

**Admin:**
- Email: `admin@skillbridge.com`
- Password: `admin123`

**Tutors (any):**
- Email: `john.smith@tutor.com` (or other seeded tutors)
- Password: `tutor123`

**Students (any):**
- Email: `alice.brown@student.com` (or other seeded students)
- Password: `student123`

---

## Summary

The backend is fully implemented with:
- ✅ Complete authentication system
- ✅ Role-based access control (Student, Tutor, Admin)
- ✅ Public tutor browsing and search
- ✅ Student booking and review system
- ✅ Tutor profile and availability management
- ✅ Admin user management
- ✅ Comprehensive validation and error handling
- ✅ No email verification required (simplified for development)

All endpoints are ready for frontend integration! 🚀
