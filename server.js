const express = require('express');
const cors = require('cors');
const session = require('express-session');
const crypto = require('crypto');
const db = require('./config/db.js');
const upload = require('./config/multerConfig.js');
require('dotenv').config();
const portfinder = require('portfinder');

// Import models first
const Employee = require('./models/addEmployee');
const HomeData = require('./models/homeData');
// Import other models as needed

// Set up model associations
HomeData.belongsTo(Employee, {
  foreignKey: 'emp_id',
  as: 'employee'  // Using lowercase 'employee' to match React code
});

Employee.hasMany(HomeData, {
  foreignKey: 'emp_id',
  as: 'homeData'
});

// Other associations can be added here

const app = express();

app.use(express.json());
app.use(express.static('public'));
app.use(cors());
// const connectionString = 'mysql://glitztec_recharge_db:Tf8^I@^7Dbs=@185.189.27.48:3306/glitztec_recharge_db';
// const hash = crypto.createHash('sha256').update(connectionString).digest('hex');
// console.log(hash);

(async () => {
  try {
    await db.sync();
    console.log('✅ Database synchronized successfully');
    console.log('✅ Model associations established');
  } catch (error) {
    console.error('❌ Error synchronizing database:', error);
  }
})();

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
const addEmployeeRoutes = require('./routes/addEmployeeRoutes');
const featureRoutes = require('./routes/featureRoutes.js');
const planFeatureRoutes = require('./routes/planFeatureRoutes');

// Setup API routes
app.use('/api', adminRoutes);
app.use('/api', userRoutes);
app.use('/api', operatorRoutes);
app.use('/api', planListRoutes);
app.use('/api', addCategoryRoutes);
app.use('/api', homeDataRoutes);
app.use('/api', addEmployeeRoutes);
app.use('/api', featureRoutes);
app.use('/api/plan-features', planFeatureRoutes);

console.log('✅ Routes initialized successfully');
console.log("Registered Routes:");
app._router.stack.forEach((middleware) => {
  if (middleware.route) {
    console.log(`✔ Route: ${Object.keys(middleware.route.methods)} -> ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    middleware.handle.stack.forEach((subMiddleware) => {
      if (subMiddleware.route) {
        console.log(`✔ Sub-Route: ${Object.keys(subMiddleware.route.methods)} -> ${subMiddleware.route.path}`);
      }
    });
  }
});


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