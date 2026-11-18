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
        <>
        <header className="p-3 fs-5 fw-semibold">Controlador Financeiro</header>
        <div className="container py-4">
            <div className="row justify-content-center">
                <div className="col-12 col-sm-8 col-md-6 col-lg-4">
                    <form className="card card-body shadow-sm" onSubmit={enviar}>
                        <h1 className="h4 mb-3">Entrar</h1>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">E-mail</label>
                            <input id="email" type="email" className={`form-control ${campos.email ? 'is-invalid' : ''}`}
                                value={email} onChange={(e) => setEmail(e.target.value)} />
                            {campos.email && <div className="invalid-feedback">{campos.email}</div>}
                        </div>

                        <div className="mb-3">
                            <label htmlFor="senha" className="form-label">Senha</label>
                            <input id="senha" type="password" className={`form-control ${campos.senha ? 'is-invalid' : ''}`}
                                value={senha} onChange={(e) => setSenha(e.target.value)} />
                            {campos.senha && <div className="invalid-feedback">{campos.senha}</div>}
                        </div>

                        {erro && <div role="alert" className="alert alert-danger">{erro}</div>}

                        <button className="btn btn-dark w-100" disabled={enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
                        <p className="text-center text-secondary small mt-3 mb-0">Não tem conta? <Link to="/cadastro">Cadastre-se</Link></p>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}