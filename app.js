const express = require('express');
const sequelize = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Welcome to the Internship Management API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error: ', err.stack);
  res.status(500).json({ message: 'An internal error occurred', error: err.message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    require('./models');
    await sequelize.sync({ force: false });
    console.log('Database synchronized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error('Error syncing with the database:', err);
    process.exit(1);
  }
};

startServer();