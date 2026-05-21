const pool = require('../config/DB');

const StudentController = {

    getAll: async (req,res) =>{
        try {
            const [rows] = await pool.query(`
                SELECT
                sv.MSSV as mssv,
                sv.Ho_va_Ten as name,
                sv.email,
                sv.sdt as phone,
                sv.Lop,
                sv.Nhom as \`group\`,
                dt.TenDeTai as topic,
                dt.MaHD,
                gv.Ho_va_Ten as lecturer,
                dt.TrangThai as status,
                sv.Diem as score,
                sv.GhiChu as note
                FROM SinhVien sv
                LEFT JOIN GiangVien gv ON sv.Giang_vien_huong_dan = gv.MaGV
                LEFT JOIN DeTai dt ON sv.MaDT = dt.MaDT
                ORDER BY sv.created_at DESC`);
                res.json(rows);
        }catch(err){
            console.error('Error getAll student:',err);
            res.status(500).json({error:'Internal server error'});
        }
    },

    create: async (req,res) =>{
        try {
            const {MSSV,Ho_va_Ten, email, sdt, Lop, Nhom, MaDT, Giang_vien_huong_dan} = req.body;
            const now = new Date();

            // Kiểm tra MSSV đã tồn tại chưa
            const [existingStudents] = await pool.query('SELECT MSSV FROM SinhVien WHERE MSSV = ?', [MSSV]);
            if (existingStudents.length > 0) {
                return res.status(400).json({ error: 'MSSV đã tồn tại, vui lòng chọn MSSV khác' });
            }

            await pool.query(`
                INSERT INTO SinhVien (MSSV,Ho_va_Ten, email, sdt, Lop, Nhom, MaDT, Giang_vien_huong_dan, created_at, updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?)`,
            [MSSV,Ho_va_Ten, email, sdt, Lop, Nhom, MaDT, Giang_vien_huong_dan, now, now]);

            const[newStudent] = await pool.query('SELECT * FROM SinhVien WHERE MSSV = ?',[MSSV]);
            res.status(201).json(newStudent[0]);

        }catch(err){
            console.error('Error create student:',err);
            res.status(500).json({error: 'Internal server error'});
        }
    },

    update: async (req,res) => {
        try{
            const {MSSV} = req.params;
            const {Ho_va_Ten, email, sdt, Lop, Nhom, MaDT, Giang_vien_huong_dan} = req.body;
            const now = new Date();

            const [result] = await pool.query(`
                UPDATE SinhVien
                SET Ho_va_Ten =?, email =?, sdt =?, Lop =?, Nhom=?,MaDT=?,Giang_vien_huong_dan=?, updated_at=?
                WHERE MSSV =?`,
            [Ho_va_Ten, email, sdt, Lop, Nhom, MaDT, Giang_vien_huong_dan, now, MSSV]);

            if (result.affectedRows === 0) {
                return res.status(404).json({error:'Student not found'});
            }

            const [updatedStudent] = await pool.query('SELECT * FROM SinhVien WHERE MSSV = ?',[MSSV]);
            res.json(updatedStudent[0]);
        }catch(err){
            console.error('Error update student:',err);
            res.status(500).json({error: 'Internal server error'});
        }
    },

    delete: async (req,res) => {
        try {
            const {MSSV} = req.params;
            // check khoa ngoai
            const [checkResult] = await pool.query(`SELECT MaDT, Giang_vien_huong_dan FROM SinhVien WHERE MSSV =?`,[MSSV]);

            if (checkResult.length === 0) {
                return res.status(404).json({error:'Sinh viên không tồn tại'});
            }

            const student = checkResult [0];

            if (student.MaDT || student.Giang_vien_huong_dan) {
                return res.status(400).json({error:'Không thể xóa sinh viên vì đã được phân công đề tài hoặc giảng viên hướng dẫn'});
            }

            await pool.query(`DELETE FROM SinhVien WHERE MSSV =?`,[MSSV]);
            res.json({message: 'Student deleted successfully'});
        }catch(err){
            console.error('Error delete student:',err);
            res.status(500).json({error: 'Internal server error'});
        }
    }

};

module.exports = StudentController;