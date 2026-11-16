// DONO: Pessoa 2 (Fontes e lançamentos). Veja DIVISAO.md, seção 5.
//
// CRUD de fontes/destinos (conta, renda, cartão de crédito). Os campos do cartão só aparecem se o tipo for
// cartão. Serviço da tela: services/fontesDestinos.js.
import { useEffect, useState } from 'react';
import { atualizarFonte, criarFonte, excluirFonte, listarFontes } from '../../services/fontesDestinos';
import { formatarMoeda } from '../../services/formatadores';

const NOMES_DO_TIPO = { renda: 'Renda', conta: 'Conta', cartao_credito: 'Cartão de crédito' };
const FORM_VAZIO = { nome: '', tipo: 'conta', diaFechamento: '', diaVencimento: '', limite: '' };

export default function FontesDestinos() {
    // lista
    const [fontes, setFontes] = useState([]);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erroExcluir, setErroExcluir] = useState('');   // ex.: 409 (fonte com lançamentos)

    // formulário (serve para criar e para editar)
    const [form, setForm] = useState(FORM_VAZIO);
    const [editandoId, setEditandoId] = useState(null);   // null = criando
    const [erroForm, setErroForm] = useState('');         // mensagem geral
    const [campos, setCampos] = useState({});             // erro por campo (400/409)
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        listarFontes()
            .then(setFontes)
            .catch((e) => setErro(e.erro || 'Não foi possível carregar as fontes e destinos.'))
            .finally(() => setCarregando(false));
    }, []);

    // Busca a lista de novo depois de salvar ou excluir
    function recarregar() {
        return listarFontes()
            .then((dados) => { setFontes(dados); setErro(''); })
            .catch((e) => setErro(e.erro || 'Não foi possível carregar as fontes e destinos.'));
    }

    function mudar(evento) {
        const { name, value } = evento.target;
        setForm({ ...form, [name]: value });
    }

    function cancelar() {
        setForm(FORM_VAZIO);
        setEditandoId(null);
        setErroForm('');
        setCampos({});
    }

    function editar(fonte) {
        setEditandoId(fonte.id);
        setForm({
            nome: fonte.nome,
            tipo: fonte.tipo,
            diaFechamento: fonte.diaFechamento === null ? '' : String(fonte.diaFechamento),
            diaVencimento: fonte.diaVencimento === null ? '' : String(fonte.diaVencimento),
            limite: fonte.limite === null ? '' : String(fonte.limite),
        });
        setErroForm('');
        setCampos({});
    }

    async function enviar(evento) {
        evento.preventDefault();
        setErroForm('');
        setCampos({});
        setEnviando(true);

        const corpo = { nome: form.nome, tipo: form.tipo };
        if (form.tipo === 'cartao_credito') {
            corpo.diaFechamento = form.diaFechamento;
            corpo.diaVencimento = form.diaVencimento;
            corpo.limite = form.limite.replace(',', '.');   // a API só aceita ponto decimal
        }

        try {
            if (editandoId) {
                await atualizarFonte(editandoId, corpo);
            } else {
                await criarFonte(corpo);
            }
            cancelar();
            await recarregar();
        } catch (e) {
            setErroForm(e.erro || 'Não foi possível salvar.');
            setCampos(e.campos || {});
        } finally {
            setEnviando(false);
        }
    }

    async function excluir(fonte) {
        if (!window.confirm(`Excluir "${fonte.nome}"?`)) return;
        setErroExcluir('');
        try {
            await excluirFonte(fonte.id);
            if (editandoId === fonte.id) cancelar();
            await recarregar();
        } catch (e) {
            setErroExcluir(e.erro || 'Não foi possível excluir.');
        }
    }

    function lista() {
        if (carregando) return <p>Carregando...</p>;
        if (erro) return <p role="alert">{erro}</p>;
        if (fontes.length === 0) return <p>Nenhuma fonte ou destino cadastrado.</p>;
        return (
            <table>
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Tipo</th>
                        <th>Fechamento</th>
                        <th>Vencimento</th>
                        <th>Limite</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {fontes.map((f) => (
                        <tr key={f.id}>
                            <td>{f.nome}</td>
                            <td>{NOMES_DO_TIPO[f.tipo]}</td>
                            <td>{f.diaFechamento ? `dia ${f.diaFechamento}` : '-'}</td>
                            <td>{f.diaVencimento ? `dia ${f.diaVencimento}` : '-'}</td>
                            <td>{f.limite !== null ? formatarMoeda(f.limite) : '-'}</td>
                            <td>
                                <button type="button" onClick={() => editar(f)}>Editar</button>
                                <button type="button" onClick={() => excluir(f)}>Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    }

    return (
        <section>
            <h1>Fontes e destinos</h1>

            <form onSubmit={enviar}>
                <h2>{editandoId ? 'Editar fonte ou destino' : 'Nova fonte ou destino'}</h2>

                <label>
                    Nome
                    <input name="nome" value={form.nome} onChange={mudar} />
                </label>
                {campos.nome && <small>{campos.nome}</small>}

                <label>
                    Tipo
                    <select name="tipo" value={form.tipo} onChange={mudar}>
                        {Object.entries(NOMES_DO_TIPO).map(([valor, texto]) => (
                            <option key={valor} value={valor}>{texto}</option>
                        ))}
                    </select>
                </label>
                {campos.tipo && <small>{campos.tipo}</small>}

                {form.tipo === 'cartao_credito' && (
                    <>
                        <label>
                            Dia de fechamento
                            <input name="diaFechamento" type="number" min="1" max="31" value={form.diaFechamento} onChange={mudar} />
                        </label>
                        {campos.diaFechamento && <small>{campos.diaFechamento}</small>}

                        <label>
                            Dia de vencimento
                            <input name="diaVencimento" type="number" min="1" max="31" value={form.diaVencimento} onChange={mudar} />
                        </label>
                        {campos.diaVencimento && <small>{campos.diaVencimento}</small>}

                        <label>
                            Limite (R$)
                            <input name="limite" inputMode="decimal" value={form.limite} onChange={mudar} />
                        </label>
                        {campos.limite && <small>{campos.limite}</small>}
                    </>
                )}

                {erroForm && <p role="alert">{erroForm}</p>}

                <div>
                    <button disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
                    {editandoId && <button type="button" onClick={cancelar}>Cancelar</button>}
                </div>
            </form>

            {erroExcluir && <p role="alert">{erroExcluir}</p>}
            {lista()}
        </section>
    );
}
