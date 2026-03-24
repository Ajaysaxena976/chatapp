# Dating App Backend API

A comprehensive Node.js backend API for a modern dating application built with Express.js, MongoDB, and advanced matching algorithms powered by machine learning.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with Google/Apple OAuth integration
- **Advanced Matching Algorithm** - ML-powered user matching and suggestion engine
- **Real-time Interactions** - Like, dislike, match, and messaging capabilities
- **Comprehensive User Profiles** - Detailed preferences, photos, and personal information
- **Location-based Matching** - Geographic proximity matching
- **Security First** - Rate limiting, XSS protection, data sanitization, CSRF protection
- **Media Management** - AWS S3/Cloudflare R2 integration for photo uploads
- **SMS Verification** - Twilio integration for phone number verification
- **Monitoring & Metrics** - Prometheus metrics and health checks
- **API Documentation** - Swagger/OpenAPI documentation

## 🛠 Tech Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **File Storage**: AWS S3 / Cloudflare R2
- **SMS Service**: Twilio
- **Monitoring**: Prometheus metrics
- **Security**: Helmet, XSS-Clean, Express Rate Limit
- **Documentation**: Swagger UI

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18.0.0 or higher)
- [MongoDB](https://www.mongodb.com/) (local installation or MongoDB Atlas)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dating-main-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory by copying from the example:

```bash
cp .env.example .env
```

Configure the following environment variables in your `.env` file:

#### Basic Configuration
```env
NODE_ENV=development
PORT=3000
```

#### Database Configuration
```env
MONGODB_URL=mongodb://localhost:27017/spontime
```

#### JWT Configuration
```env
JWT_SECRET=your_super_secret_jwt_key_here
JWT_ACCESS_EXPIRATION_MINUTES=3000
JWT_REFRESH_EXPIRATION_DAYS=3000
JWT_RESET_PASSWORD_EXPIRATION_MINUTES=10
JWT_VERIFY_EMAIL_EXPIRATION_MINUTES=10
```

#### Twilio SMS Configuration
```env
TWILIO_API_KEY_SID=your_twilio_api_key_sid
TWILIO_API_KEY_SECRET=your_twilio_api_key_secret
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
```

#### Cloudflare R2 / AWS S3 Configuration
```env
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_ENDPOINT=your_r2_endpoint
R2_BUCKET_NAME=your_r2_bucket_name
R2_ACCOUNT_ID=your_r2_account_id
R2_PUBLIC_DOMAIN=your_r2_public_domain
```

#### OAuth Configuration
```env
APPLE_CLIENT_ID=your_apple_client_id
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_SECRET_ID=your_google_secret_id
```

### 4. Database Setup

Ensure MongoDB is running on your system. The application will automatically connect to the database specified in your `MONGODB_URL`.

### 5. Seed the Database

Populate the database with initial data (countries, cities, preferences, etc.):

```bash
npm run seed
```

## 🚀 Running the Application

### Development Mode

Start the application in development mode with auto-reload:

```bash
npm run start
```

This command will:
1. Seed the database with initial data
2. Start the server with nodemon for auto-reloading
3. Set NODE_ENV to development

### Production Mode

Start the application in production mode:

```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

### Docker Deployment

#### Development with Docker
```bash
npm run docker:dev
```

#### Production with Docker
```bash
npm run docker:prod
```

#### Testing with Docker
```bash
npm run docker:test
```

## 📚 API Documentation

Once the server is running, you can access the API documentation at:

```
http://localhost:3000/v1/docs
```

## 🔗 API Endpoints

### Base URL
```
http://localhost:3000/v1/user-server
```

## 🏗 Project Structure

```
src/
├── config/           # Configuration files
│   ├── config.js     # Main configuration
│   ├── passport.js   # Passport JWT strategy
│   └── morgan.js     # HTTP request logger
├── controllers/      # Route controllers
├── middlewares/      # Custom middleware
├── models/          # Mongoose models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
├── validations/     # Request validation schemas
├── seeds/           # Database seeding scripts
└── docs/            # API documentation
```

## 🔒 Security Features

- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Data Sanitization**: MongoDB injection prevention
- **Security Headers**: Enhanced HTTP security headers via Helmet
- **JWT Authentication**: Secure token-based authentication

## 📊 Monitoring

The application includes built-in monitoring capabilities:

- **Prometheus Metrics**: `/v1/metrics` endpoint for application metrics
- **Request Logging**: Comprehensive HTTP request logging
- **Error Tracking**: Structured error logging and handling

## 🤖 Machine Learning Features

The application includes an advanced dating engine with:

- **User Compatibility Scoring**: ML-based compatibility calculation
- **Preference Learning**: Adaptive preference learning from user interactions
- **Suggestion Optimization**: Optimized user suggestion algorithms
- **Behavioral Analysis**: User behavior pattern analysis for better matching


## 📝 Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Application environment | Yes | development |
| `PORT` | Server port | Yes | 3000 |
| `MONGODB_URL` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `TWILIO_ACCOUNT_SID` | Twilio account SID | Yes | - |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `APPLE_CLIENT_ID` | Apple OAuth client ID | No | - |



### CI/CD

The project includes GitLab CI configuration (`.gitlab-ci.yml`) for automated deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check the `MONGODB_URL` in your `.env` file
   - Verify network connectivity

2. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **JWT Token Issues**
   - Ensure `JWT_SECRET` is set in your `.env` file
   - Check token expiration settings

4. **File Upload Issues**
   - Verify R2 credentials in your `.env` file
   - Check bucket permissions and CORS settings

### Getting Help

- Check the [API Documentation](http://localhost:3000/v1/docs)
- Review the application logs
- Ensure all environment variables are properly configured

