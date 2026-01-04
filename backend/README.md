# LiviShield Backend - Authentication System

Clean authentication and authorization system built with Node.js, Express, MySQL, and MongoDB.

## 🏗️ Architecture

### Database Strategy
- **MySQL**: User authentication and management
- **MongoDB**: Available for future features (currently unused)

### Focus
LiviShield Authentication System provides:
- **🔐 User Registration**: Secure account creation
- **🔑 User Login**: JWT-based authentication
- **👤 User Management**: Profile and role management
- **🛡️ Authorization**: Role-based access control

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configurations
│   │   ├── mysql.js     # MySQL connection
│   │   └── mongodb.js   # MongoDB connection (optional)
│   ├── controllers/     # Route controllers
│   │   └── authController.js # Authentication logic
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication & authorization
│   │   └── errorHandler.js # Global error handling
│   ├── routes/          # API routes
│   │   └── authRoutes.js # Authentication endpoints
│   ├── utils/           # Utility functions
│   │   ├── helpers.js   # Common utilities
│   │   ├── logger.js    # Winston logger setup
│   │   └── validation.js # Joi validation schemas
│   └── app.js           # Express app configuration
├── database_schema.sql  # MySQL schema
├── .env                 # Environment variables
├── package.json         # Dependencies
├── server.js            # Server entry point
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- MongoDB (v6+) - Optional

### Installation

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up MySQL database**
   - Create database: `CREATE DATABASE livishield;`
   - Run `database_schema.sql` in MySQL Workbench

4. **Configure environment**
   - Update `.env` with your MySQL password

5. **Start server**
   ```bash
   npm start
   ```

## 🗄️ Database Design

### MySQL Table (Authentication)
- **users**: User accounts, authentication, and profile data

### Sample Data
- **Admin**: `admin@livishield.com` / `password123`
- **User**: `john.doe@example.com` / `password123`

## 🔐 Authentication Features

- **JWT-based authentication**
- **Password hashing** with bcrypt (12 rounds)
- **Role-based access control** (user, agent, admin)
- **Input validation** with Joi
- **Rate limiting** (100 requests/15min)
- **Security headers** with Helmet
- **CORS configuration**

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Health Check
- `GET /health` - Server health status

## 🛡️ Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** (100 requests/15min)
- **Input validation** with Joi
- **SQL injection** prevention
- **XSS protection**
- **Password hashing** (bcrypt, 12 rounds)
- **JWT token** authentication

## 📝 Logging

- **Winston** for structured logging
- **Request/response** logging
- **Error tracking** with stack traces
- **File-based** log storage

## 🔧 Development

### Available Scripts
- `npm start` - Production server
- `npm run dev` - Development with nodemon

### Environment Variables
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
MYSQL_HOST=localhost
MYSQL_DATABASE=livishield
MONGODB_URI=mongodb://localhost:27017/livishield_docs
```

## 🚀 Frontend Integration

The system works with the React frontend providing:
- User registration and login forms
- JWT token management
- Protected routes
- User dashboard
- Automatic authentication state management

## 📈 Future Extensions

The clean architecture allows easy addition of:
- Email verification
- Password reset
- Two-factor authentication
- OAuth integration
- User profile management
- Admin panel

---

**Built with ❤️ for LiviShield Authentication System**