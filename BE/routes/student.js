const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/StudentController');

router.get('/', StudentController.getAll);       // GET /students - lấy danh sách
router.post('/', StudentController.create);     // POST /students - thêm mới
router.put('/:MSSV', StudentController.update); // PUT /students/:MSSV - sửa
router.delete('/:MSSV', StudentController.delete); // DELETE /students/:MSSV - xóa

module.exports = router;