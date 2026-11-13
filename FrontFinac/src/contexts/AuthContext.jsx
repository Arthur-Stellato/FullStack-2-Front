// DONO: Pessoa 1 (Acesso e base). Veja DIVISAO.md, seções 1 e 5.
//
// TODO:
//  - estado: usuario e token; o token sobrevive ao recarregar a página (localStorage)
//  - login(email, senha): POST /auth/login, guarda o token e o usuario
//  - cadastrar(dados): POST /auth/cadastro e depois login
//  - logout(): descarta o token e o usuario
//  - useAuth() devolve { usuario, token, login, cadastrar, logout }
// Quem usa: services/api.js (token e logout), RotaProtegida e todas as telas.
import { createContext, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
