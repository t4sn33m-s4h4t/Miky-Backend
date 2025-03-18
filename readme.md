# Miky - Backend

Miky's backend is built with **Node.js, Express, and MongoDB**, providing a REST API for user authentication, post management, and real-time interactions.

## Features
- JWT authentication
- User profiles (create, edit, follow, unfollow)
- Post creation, commenting, saving
- Image uploads using Cloudinary
- Nodemailer for email notifications
- Multer for handling file uploads

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary
- Multer
- Nodemailer
- WebSockets (planned)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/t4sn33m-s4h4t/miky-backend.git
cd miky-backend
```

### 2. Install Dependencies
```bash
npm install
```
### 3. Set Up Environment Variables
Create a .env file in the root directory and add the following:

```bash 
NODE_ENV= 'development'
PORT= 8000 
DB_CONNECTION_URI= "MONGO_DB_CONNECTION_URI"
JWT_SECRET= 'ANY_JWT_SECRET'
JWT_EXPIRES_IN= 90d
JWT_COOKIE_EXPIRES_IN= 90
EMAIL= "NODEMAILER_EMAIL"
EMAIL_PASS= "NODEMAILER_EMAIL_PASSWORD"
CLOUDINARY_CLOUDE_NAME=
CLOUDINARY_API_SECRET=
CLOUDINARY_API_KEY=
```

### 4. Run the Server
``` bash
npm run dev
```
The backend will be available at http://localhost:8000.

## API Routes

### Authentication Routes
| Method | Endpoint               | Protected | Description |
|--------|------------------------|-----------|-------------|
| POST   | `/signup`              | ❌        | User signup |
| POST   | `/login`               | ❌        | User login |
| POST   | `/logout`              | ✅        | User logout |
| POST   | `/verify`              | ✅        | Verify account with OTP |
| POST   | `/resend-otp`          | ✅        | Resend OTP for verification |
| POST   | `/forget-password`     | ❌        | Send reset password email |
| POST   | `/reset-password`      | ❌        | Reset password |
| POST   | `/change-password`     | ✅        | Change password |

### User Routes
| Method | Endpoint               | Protected | Description |
|--------|------------------------|-----------|-------------|
| GET    | `/profile/:id`         | ❌        | Get user profile |
| GET    | `/suggested-user`      | ✅        | Get suggested users |
| GET    | `/me`                  | ✅        | Get current logged-in user |
| POST   | `/follow-unfollow/:id` | ✅        | Follow or unfollow a user |
| POST   | `/edit-profile`        | ✅        | Edit user profile with profile picture upload |

### Post Routes
| Method | Endpoint                  | Protected | Description |
|--------|---------------------------|-----------|-------------|
| POST   | `/create-post`            | ✅        | Create a new post with image upload |
| GET    | `/all`                     | ❌        | Get all posts |
| GET    | `/user-post/:id`           | ❌        | Get posts by a specific user |
| POST   | `/save-unsave-post/:id`    | ✅        | Save or unsave a post |
| DELETE | `/delete-post/:id`         | ✅        | Delete a post |
| POST   | `/like-dislike/:id`        | ✅        | Like or dislike a post |
| POST   | `/comment/:id`             | ✅        | Add a comment to a post |

🔒 **Protected routes** require authentication using JWT.

