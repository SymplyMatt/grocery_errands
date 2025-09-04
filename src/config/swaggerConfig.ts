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
      ApiKeyAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'x-api-key',
        description: 'API key passed in request header',
      },
    },
  },
  security: [
    { cookieAuth: [] },
    { ApiKeyAuth: [] },
  ],  
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
