const express = require('express');
const cors = require('cors');
require('dotenv').config();

const studentRouter = require('./routes/student');
const StudentController = require('./controllers/StudentController');

const app = express();
const PORT = process.env.PORT || 3000;

// cau hinh cors de FE goi duoc API
app.use(cors({
    origin: ['http://localhost:5173','http://127.0.0.1:8000'],
    credentials: true
}));
// Middleware parse JSON 
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Mount routes
app.use('/api/students',studentRouter);



// Route kiểm tra server
app.get('/', (req, res) => {
  res.json({
    message: 'Student Management API is running!',
    endpoints: [
      'GET /api/students/ - Get all students',
      'POST /api/students/ - Add new student',
      'PUT /api/students/:MSSV - Update student',
      'DELETE /api/students/:MSSV - Delete student'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
// test nhanh