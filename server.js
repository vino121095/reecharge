const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const sequelize = require('./config/db.js');
const upload = require('./config/multerConfig.js');
require('dotenv').config();
const portfinder = require('portfinder');

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(cors());
// const connectionString = 'mysql://glitztec_recharge_db:Tf8^I@^7Dbs=@185.189.27.48:3306/glitztec_recharge_db';
// const hash = crypto.createHash('sha256').update(connectionString).digest('hex');
// console.log(hash);

app.use(
  session({
    secret: process.env.ACCESS_SECRET_TOKEN, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  })
);
app.get('/', (req, res) => {
  res.send('Welcome! The server is up and running.');
});

// POST test route
app.post('/', (req, res) => {
  res.send('Post request received successfully');
});

// Route imports and mounting
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const planListRoutes = require('./routes/planListRoutes');
const addCategoryRoutes = require('./routes/addCategoryRoutes');
const homeDataRoutes = require('./routes/homeDataRoutes');

// Setup API routes
app.use('/api', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', operatorRoutes);
app.use('/api', planListRoutes);
app.use('/api', addCategoryRoutes);
app.use('/api', homeDataRoutes);

console.log('✅ Routes initialized successfully');

// Start the server using portfinder
portfinder.getPortPromise()
  .then((port) => {
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('❌ Could not find an available port:', err);
  });
