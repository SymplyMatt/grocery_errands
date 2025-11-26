import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Shop Cheap',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    {
      url:  process.env.NODE_ENV === 'production' ? "https://grocery-errands.onrender.com" : `http://localhost:${process.env.PORT}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Auth token stored in cookie (contains user info)',
      },
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token passed in Authorization header',
      },
    },
  },
  security: [
    { cookieAuth: [] },
    { bearerAuth: [] },
  ],  
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
