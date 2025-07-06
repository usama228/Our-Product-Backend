const express = require('express');
const sequelize = require('./config/db');
const path = require('path'); 
const helmet = require('helmet');
const cors = require('cors');




const app = express();
app.use(helmet()); 
app.use(cors({
  origin: '*',
  
  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});


// app.use('/api/users', userRoutes);



app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Error: ', err.stack);
  res.status(500).json({ message: 'An internal error occurred', error: err.message });
});


const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await sequelize.sync({ force: false });
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Error syncing with the database:', err);
    process.exit(1); 
  }
};

startServer();