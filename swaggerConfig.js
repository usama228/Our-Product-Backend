// src/backend/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BlogCraft API',
      version: '1.0.0',
      description: 'API documentation for BlogCraft backend with PostgreSQL',
    },
    servers: [
      {
        url: 'http://localhost:5000', // Replace with your actual base URL
      },
    ],
  },
  apis: ['./src/backend/app.js'], // You can point to all route files
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
