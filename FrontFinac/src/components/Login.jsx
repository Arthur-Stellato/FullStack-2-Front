import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');      // mensagem geral (401, 429)
    const [campos, setCampos] = useState({});  // erros por campo (400)
    const [enviando, setEnviando] = useState(false);

    async function enviar(evento) {
        evento.preventDefault();
        setErro('');
        setCampos({});
        setEnviando(true);
        try {
            await login(email, senha);
            navigate('/');
        } catch (e) {
            setErro(e.erro || 'Não foi possível conectar ao servidor.');
            setCampos(e.campos || {});
        } finally {
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={enviar}>
            <h1>Entrar</h1>

            <label>
                E-mail
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {campos.email && <small>{campos.email}</small>}

            <label>
                Senha
                <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </label>
            {campos.senha && <small>{campos.senha}</small>}

            {erro && <p role="alert">{erro}</p>}

            <button disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
            <p>Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
        </form>
    );
}