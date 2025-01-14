import axios from 'axios';

// Configurar a instância do Axios
export const api = axios.create({
    baseURL: 'http://localhost:3003',
});


export default api;
