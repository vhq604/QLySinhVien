    import axios from 'axios';

    const API_URL = 'http://localhost:3000/api/students';

    const studentService = {
        getAll: async () =>{
            const response = await axios.get(`${API_URL}/`);
            return response.data;
        },

        create: async (studentData) =>{
            const response = await axios.post(`${API_URL}/`,studentData);
            return response.data;
        },

        update: async (MSSV,studentData) => {
            const response = await axios.put(`${API_URL}/${MSSV}`,studentData);
            return response.data;
        },

        delete: async (MSSV) => {
            const response = await axios.delete(`${API_URL}/${MSSV}`);
            return response.data;
        }

    };

    export default studentService;