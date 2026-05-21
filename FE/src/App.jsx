import { useState, useEffect } from 'react';
import studentService from './services/studentService';
import './index.css';

function App() {
  // State quản lý dữ liệu
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('none');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    MSSV: '',
    Ho_va_Ten: '',
    email: '',
    sdt: '',
    Lop: '',
    Nhom: ''
  });

  // Lấy dữ liệu khi component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Hàm lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      alert('Lỗi khi lấy danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi input form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Xử lý submit form (thêm/cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await studentService.update(editingStudent.mssv, formData);
      } else {
        await studentService.create(formData);
        setSortBy('none');
      }
      setShowModal(false);
      setEditingStudent(null);
      resetForm();
      fetchStudents();
      alert(editingStudent ? 'Cập nhật thành công!' : 'Thêm thành công!');
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Lỗi khi thực hiện thao tác');
    }
  };

  // Reset form về mặc định
  const resetForm = () => {
    setFormData({
      MSSV: '',
      Ho_va_Ten: '',
      email: '',
      sdt: '',
      Lop: '',
      Nhom: ''
    });
  };

  // Xử lý mở form sửa
  const handleEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      MSSV: student.mssv,
      Ho_va_Ten: student.name,
      email: student.email || '',
      sdt: student.phone || '',
      Lop: student.Lop || '',
      Nhom: student.group || ''
    });
    setShowModal(true);
  };

  // Xử lý xóa sinh viên
  const handleDelete = async (mssv) => {
    if (window.confirm('Bạn có chắc muốn xóa sinh viên này?')) {
      try {
        await studentService.delete(mssv);
        fetchStudents();
        alert('Xóa thành công!');
      } catch (error) {
        console.error('Error deleting student:', error);
        alert(error.response?.data?.error || 'Lỗi khi xóa sinh viên');
      }
    }
  };

  // Hàm lấy tên cuối cùng (để sắp xếp)
  const getLastName = (fullName) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  };

  // Hàm chuyển nhóm sang số (để sắp xếp)
  const getGroupNumber = (group) => {
    if (!group) return 0;
    const match = group.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Lọc và sắp xếp sinh viên
  let filteredAndSortedStudents = [...students].filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      student.mssv?.toLowerCase().includes(term) ||
      student.name?.toLowerCase().includes(term)
    );
  });

  if (sortBy !== 'none') {
    filteredAndSortedStudents = filteredAndSortedStudents.sort((a, b) => {
      if (sortBy === 'mssv') return a.mssv?.localeCompare(b.mssv) || 0;
      if (sortBy === 'name') {
        const lastNameA = getLastName(a.name);
        const lastNameB = getLastName(b.name);
        return lastNameA.localeCompare(lastNameB);
      }
      if (sortBy === 'group') {
        const groupA = getGroupNumber(a.group);
        const groupB = getGroupNumber(b.group);
        return groupA - groupB;
      }
      return 0;
    });
  }

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-text">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>HỆ THỐNG QUẢN LÝ</h2>
          <p className="sidebar-subtitle">LUẬN VĂN TỐT NGHIỆP</p>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">Trang chủ</a>
          <a href="#" className="nav-item">Quản lý giảng viên</a>
          <a href="#" className="nav-item active">Quản lý sinh viên</a>
          <a href="#" className="nav-item">Quản lý đề tài</a>
          <a href="#" className="nav-item">Bảng phân công</a>
          <a href="#" className="nav-item">Đánh giá 50%</a>
          <a href="#" className="nav-item">Phân công phản biện</a>
          <a href="#" className="nav-item">Thành lập hội đồng</a>
          <a href="#" className="nav-item">Phân công hội đồng</a>
          <a href="#" className="nav-item">Phân bổ thời gian</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <div className="content-header">
            <h1>QUẢN LÝ SINH VIÊN</h1>
            <p className="total-students">Tổng số sinh viên: {filteredAndSortedStudents.length}</p>
          </div>

          <div className="controls">
            <input
              type="text"
              placeholder="Tìm kiếm theo MSSV hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="none">Mặc định</option>
              <option value="mssv">Sắp xếp theo MSSV</option>
              <option value="name">Sắp xếp theo tên</option>
              <option value="group">Sắp xếp theo nhóm</option>
            </select>
            <button
              className="add-btn"
              onClick={() => {
                setEditingStudent(null);
                resetForm();
                setShowModal(true);
              }}
            >
              Thêm sinh viên
            </button>
          </div>

          <div className="table-container">
            <table className="student-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>MSSV</th>
                  <th>Họ và tên</th>
                  <th>Lớp</th>
                  <th>Nhóm</th>
                  <th>Email</th>
                  <th>Số điện thoại</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedStudents.map((student, index) => (
                  <tr key={student.mssv}>
                    <td>{index + 1}</td>
                    <td>{student.mssv}</td>
                    <td>{student.name}</td>
                    <td>{student.Lop || '-'}</td>
                    <td>{student.group || '-'}</td>
                    <td>{student.email || '-'}</td>
                    <td>{student.phone || '-'}</td>
                    <td>
                      <button className="edit-btn" onClick={() => handleEdit(student)}>Sửa</button>
                      <button className="delete-btn" onClick={() => handleDelete(student.mssv)}>Xóa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal thêm/sửa */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingStudent ? 'CHỈNH SỬA SINH VIÊN' : 'THÊM MỚI SINH VIÊN'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>MSSV</label>
                  <input
                    type="text"
                    name="MSSV"
                    value={formData.MSSV}
                    onChange={handleInputChange}
                    disabled={!!editingStudent}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    name="Ho_va_Ten"
                    value={formData.Ho_va_Ten}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lớp</label>
                  <input type="text" name="Lop" value={formData.Lop} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Nhóm</label>
                  <input type="text" name="Nhom" value={formData.Nhom} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input type="text" name="sdt" value={formData.sdt} onChange={handleInputChange} />
                </div>
              </div>
              <div className="modal-buttons">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="submit-btn">{editingStudent ? 'Cập nhật' : 'Thêm'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;