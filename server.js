
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors')
const databaseconnection= require('./config/db.js')
const cookieParser = require('cookie-parser');
const router = require('./routes/userRoutes.js');
const path = require('path');
const fs = require('fs');

dotenv.config();


const app =express();
// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.urlencoded({
  extended:true
}))
databaseconnection();
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser()); 

//route
app.use('/api/auth', router);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get('*',(req,res,next)=>{
  res.status(200).json({
    message:'bad request'
  })
})