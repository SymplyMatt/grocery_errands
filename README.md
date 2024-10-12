# Woven Finance Backend Task

This project is a Node.js/Express.js application that serves a REST API for managing contracts, jobs, and user profiles. It includes features for both clients and contractors, as well as administrative functions.

## Features

- User authentication (JWT)
- Role-based access control (Client, Contractor, Admin)
- CRUD operations for contracts, jobs, and user profiles
- Payment processing for jobs
- Balance management for clients
- Admin dashboard for analytics (best profession, best clients)
- Swagger documentation for all API endpoints

## Technologies Used

- Node.js
- Express.js
- MySQL
- Sequelize ORM
- JSON Web Tokens (JWT) for authentication
- Express Validator for input validation
- Swagger for API documentation

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up your MySQL database
4. Configure your environment variables (database connection, JWT secret, etc.)
5. Run database migrations: `npx sequelize-cli db:migrate`
6. Seed the database: `npx sequelize-cli db:seed:all`
7. Start the server: `npm start`

## API Documentation

The API documentation is available via Swagger UI. You can access it at:

https://woven-test-bfd5944cf619.herokuapp.com/docs

This interactive documentation provides detailed information about all available endpoints, request/response formats, and allows you to test the API directly from the browser.

## Going Above and Beyond

- Implemented comprehensive input validation
- Added pagination and filtering for GET requests
- Included Swagger documentation for easy API exploration and testing
- Implemented role-based access control
- Added admin functionality for better system management and analytics

## Areas for Improvement

- Implement unit and integration tests
- Add rate limiting to prevent API abuse
- Implement caching for frequently accessed data
- Set up CI/CD pipeline for automated testing and deployment

## Deployment

The API is currently deployed on Heroku. You can access the base URL at:

https://woven-test-bfd5944cf619.herokuapp.com

Remember to use this base URL when making requests to the API endpoints.