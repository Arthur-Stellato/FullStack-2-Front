import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mascararCpf } from '../services/formatadores';

const entradas = [
    ['nome', 'Nome', 'text'],
    ['email', 'E-mail', 'email'],
    ['cpf', 'CPF', 'text'],
    ['senha', 'Senha', 'password'],
    ['confirmacao', 'Confirmar senha', 'password'],
];

export default function Cadastro() {
    const { cadastrar } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ nome: '', email: '', cpf: '', senha: '', confirmacao: '' });
    const [erro, setErro] = useState('');
    const [campos, setCampos] = useState({});
    const [enviando, setEnviando] = useState(false);

    function mudar(evento) {
        const { name, value } = evento.target;
        setForm({ ...form, [name]: name === 'cpf' ? mascararCpf(value) : value });
    }

    async function enviar(evento) {
        evento.preventDefault();

        if (form.senha !== form.confirmacao) {
            setCampos({ confirmacao: 'As senhas não conferem.' });
            return;
        }

        setErro('');
        setCampos({});
        setEnviando(true);
        try {
            await cadastrar({ nome: form.nome, email: form.email, cpf: form.cpf.replace(/\D/g, ''), senha: form.senha });
            navigate('/'); // o cadastrar já faz o login, então redireciona para a página inicial
        } catch (e) {
            setErro(e.erro || 'Não foi possível criar a conta.');
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
                        <h1 className="h4 mb-3">Criar conta</h1>

                        {entradas.map(([nome, rotulo, tipo]) => (
                            <div className="mb-3" key={nome}>
                                <label htmlFor={nome} className="form-label">{rotulo}</label>
                                <input id={nome} name={nome} type={tipo} className={`form-control ${campos[nome] ? 'is-invalid' : ''}`}
                                    value={form[nome]} onChange={mudar} />
                                {campos[nome] && <div className="invalid-feedback">{campos[nome]}</div>}
                            </div>
                        ))}

                        {erro && <div role="alert" className="alert alert-danger">{erro}</div>}

                        <button className="btn btn-dark w-100" disabled={enviando}>{enviando ? 'Criando...' : 'Criar conta'}</button>
                        <p className="text-center text-secondary small mt-3 mb-0">Já tem conta? <Link to="/login">Entrar</Link></p>
                    </form>
                </div>
            </div>
        </div>
        </>
    );
}