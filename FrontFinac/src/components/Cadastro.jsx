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
        <form onSubmit={enviar}>
            <h1>Criar conta</h1>

            {entradas.map(([nome, rotulo, tipo]) => (
                <div key={nome}>
                    <label>
                        {rotulo}
                        <input name={nome} type={tipo} value={form[nome]} onChange={mudar} />
                    </label>
                    {campos[nome] && <small>{campos[nome]}</small>}
                </div>
            ))}

            {erro && <p role="alert">{erro}</p>}

            <button disabled={enviando}>{enviando ? 'Criando...' : 'Criar conta'}</button>
            <p>Já tem conta? <Link to="/login">Entrar</Link></p>
        </form>
    );
}