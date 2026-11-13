import { api } from '../services/api';
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [carregando, setCarregando] = useState(!!token);

    useEffect(() => {
        if (token) {
            api.get('/auth/me')
                .then(setUsuario)
                .catch(() => {
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setCarregando(false));
        }
    }, []);

    async function login(email, senha) {
        const { token, usuario } = await api.post('/auth/login', { email, senha });
        localStorage.setItem('token', token);
        setToken(token);
        setUsuario(usuario);
    }
    async function cadastrar(dados) {
        await api.post('/auth/cadastro', dados)
            .then(() => login(dados.email, dados.senha));
    }
    function logout() {
        localStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    }

    return <AuthContext.Provider value={{ usuario, token, carregando, login, cadastrar, logout }}>{children}</AuthContext.Provider>;

}
export const useAuth = () => useContext(AuthContext);
