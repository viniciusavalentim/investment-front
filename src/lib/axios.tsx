import axios from 'axios';

// Configurar a instância do Axios
export const api = axios.create({
    baseURL: 'https://stockdeploy-api.onrender.com',
});


export default api;
