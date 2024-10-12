import swaggerJsdoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Woven Test',
    version: '1.0.0',
    description: 'API documentation',
  },
  servers: [
    {
      url:  process.env.NODE_ENV === 'production' ? process.env.PROD_URL : `http://localhost:${process.env.PORT}`,
      description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'Token containing the email, role, and id of the user',
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec };
