// DONO: Pessoa 3 (Categorias e relatórios). CRUD de categorias.
// O formulário serve para criar e para editar (na edição só o nome muda). Excluir pede confirmação e o 409
// (categoria com lançamentos) aparece como mensagem. Serviço da tela: services/categorias.js.
import { useEffect, useState } from 'react';
import { criarCategoria, editarCategoria, excluirCategoria, listarCategorias } from '../../services/categorias';

const FORM_VAZIO = { nome: '', tipo: 'saida' };
const NOMES_DO_TIPO = { saida: 'Saída', entrada: 'Entrada' };

export default function Categorias() {
    // lista
    const [categorias, setCategorias] = useState([]);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erroExcluir, setErroExcluir] = useState('');   // ex.: 409 (categoria com lançamentos)

    // formulário (serve para criar e para editar)
    const [form, setForm] = useState(FORM_VAZIO);
    const [editandoId, setEditandoId] = useState(null);   // null = criando
    const [erroForm, setErroForm] = useState('');         // mensagem geral
    const [campos, setCampos] = useState({});             // erro por campo (400/409)
    const [enviando, setEnviando] = useState(false);

    useEffect(() => {
        listarCategorias()
            .then(setCategorias)
            .catch((e) => setErro(e.erro || 'Não foi possível carregar as categorias.'))
            .finally(() => setCarregando(false));
    }, []);

    // Busca a lista de novo depois de salvar ou excluir
    function recarregar() {
        return listarCategorias()
            .then((dados) => { setCategorias(dados); setErro(''); })
            .catch((e) => setErro(e.erro || 'Não foi possível carregar as categorias.'));
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

    function editar(categoria) {
        setEditandoId(categoria.id);
        setForm({ nome: categoria.nome, tipo: categoria.tipo });
        setErroForm('');
        setCampos({});
    }

    async function enviar(evento) {
        evento.preventDefault();
        setErroForm('');
        setCampos({});
        setEnviando(true);
        try {
            if (editandoId) {
                await editarCategoria(editandoId, form.nome);   // o PUT só muda o nome
            } else {
                await criarCategoria(form);
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

    async function excluir(categoria) {
        if (!window.confirm(`Excluir a categoria "${categoria.nome}"?`)) return;
        setErroExcluir('');
        try {
            await excluirCategoria(categoria.id);
            if (editandoId === categoria.id) cancelar();
            await recarregar();
        } catch (e) {
            setErroExcluir(e.erro || 'Não foi possível excluir.');   // 409: existem lançamentos nesta categoria
        }
    }

    // Uma tabela por tipo (saídas e entradas)
    function tabela(titulo, tipo) {
        const lista = categorias.filter((c) => c.tipo === tipo);
        return (
            <>
                <h2>{titulo}</h2>
                {lista.length === 0 ? <p>Nenhuma categoria.</p> : (
                    <table>
                        <thead><tr><th>Nome</th><th>Ações</th></tr></thead>
                        <tbody>
                            {lista.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.nome}</td>
                                    <td>
                                        <button type="button" onClick={() => editar(c)}>Editar</button>
                                        <button type="button" onClick={() => excluir(c)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </>
        );
    }

    function listas() {
        if (carregando) return <p>Carregando...</p>;
        if (erro) return <p role="alert">{erro}</p>;
        return (
            <>
                {tabela('Saídas', 'saida')}
                {tabela('Entradas', 'entrada')}
            </>
        );
    }

    return (
        <section>
            <h1>Categorias</h1>

            <form onSubmit={enviar}>
                <h2>{editandoId ? 'Editar categoria' : 'Nova categoria'}</h2>

                <label>
                    Nome
                    <input name="nome" maxLength={60} value={form.nome} onChange={mudar} />
                </label>
                {campos.nome && <small>{campos.nome}</small>}

                <label>
                    Tipo
                    <select name="tipo" value={form.tipo} onChange={mudar} disabled={editandoId !== null}>
                        {Object.entries(NOMES_DO_TIPO).map(([valor, texto]) => (
                            <option key={valor} value={valor}>{texto}</option>
                        ))}
                    </select>
                </label>
                {campos.tipo && <small>{campos.tipo}</small>}

                {erroForm && <p role="alert">{erroForm}</p>}

                <div>
                    <button disabled={enviando}>{enviando ? 'Salvando...' : editandoId ? 'Salvar' : 'Adicionar'}</button>
                    {editandoId && <button type="button" onClick={cancelar}>Cancelar</button>}
                </div>
            </form>

            {erroExcluir && <p role="alert">{erroExcluir}</p>}
            {listas()}
        </section>
    );
}