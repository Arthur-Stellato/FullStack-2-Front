// DONO: Pessoa 2. Formulário de lançamento, usado pela tela Lancamentos para criar e para editar.
// Recebe as listas (categorias e fontes) já carregadas pela tela e avisa com aoSalvar() quando der certo.
// `lancamento` (um item da lista) liga o modo edição; sem ele, é um lançamento novo.
import { useState } from 'react';
import { atualizarLancamento, criarLancamento } from '../../services/lancamentos';

const hoje = () => new Date().toLocaleDateString('sv-SE');   // 'AAAA-MM-DD' no fuso do navegador

export default function FormularioLancamento({ categorias, fontes, lancamento = null, aoSalvar, aoCancelar }) {
    const editando = lancamento !== null;

    const [form, setForm] = useState(() => editando
        ? {
            tipo: lancamento.tipo,
            descricao: lancamento.descricao,
            valor: String(lancamento.valor),
            data: lancamento.data,
            categoriaId: String(lancamento.categoriaId),
            fonteDestinoId: String(lancamento.fonteDestinoId),
            parcelas: '1',
        }
        : { tipo: 'saida', descricao: '', valor: '', data: hoje(), categoriaId: '', fonteDestinoId: '', parcelas: '1' });
    const [erro, setErro] = useState('');       // mensagem geral
    const [campos, setCampos] = useState({});   // erro por campo (400)
    const [enviando, setEnviando] = useState(false);

    // Parcelas só existem para fonte do tipo cartão de crédito, e só na criação (editar mexe numa linha só)
    const fonte = fontes.find((f) => String(f.id) === form.fonteDestinoId);
    const mostrarParcelas = !editando && fonte?.tipo === 'cartao_credito';

    function mudar(evento) {
        const { name, value } = evento.target;
        const novo = { ...form, [name]: value };
        if (name === 'tipo') novo.categoriaId = '';   // a categoria precisa ser do mesmo tipo do lançamento
        setForm(novo);
    }

    async function enviar(evento) {
        evento.preventDefault();
        setErro('');
        setCampos({});
        setEnviando(true);

        const corpo = {
            tipo: form.tipo,
            descricao: form.descricao,
            valor: form.valor.replace(',', '.'),   // a API só aceita ponto decimal
            data: form.data,
            categoriaId: form.categoriaId,
            fonteDestinoId: form.fonteDestinoId,
        };
        if (mostrarParcelas) corpo.parcelas = form.parcelas;

        try {
            if (editando) {
                await atualizarLancamento(lancamento.id, corpo);
            } else {
                await criarLancamento(corpo);
            }
            aoSalvar();
        } catch (e) {
            setErro(e.erro || 'Não foi possível salvar o lançamento.');
            setCampos(e.campos || {});
            setEnviando(false);
        }
    }

    return (
        <form onSubmit={enviar}>
            <h2>{editando ? 'Editar lançamento' : 'Novo lançamento'}</h2>
            {editando && lancamento.totalParcelas > 1 && (
                <p>Você está editando só a parcela {lancamento.parcelaAtual}/{lancamento.totalParcelas}; as outras não mudam.</p>
            )}

            <label>
                Tipo
                <select name="tipo" value={form.tipo} onChange={mudar}>
                    <option value="saida">Saída</option>
                    <option value="entrada">Entrada</option>
                </select>
            </label>
            {campos.tipo && <small>{campos.tipo}</small>}

            <label>
                Descrição
                <input name="descricao" value={form.descricao} onChange={mudar} />
            </label>
            {campos.descricao && <small>{campos.descricao}</small>}

            <label>
                Valor (R$)
                <input name="valor" inputMode="decimal" value={form.valor} onChange={mudar} />
            </label>
            {campos.valor && <small>{campos.valor}</small>}

            <label>
                Data
                <input name="data" type="date" value={form.data} onChange={mudar} />
            </label>
            {campos.data && <small>{campos.data}</small>}

            <label>
                Categoria
                <select name="categoriaId" value={form.categoriaId} onChange={mudar}>
                    <option value="">Escolha...</option>
                    {categorias.filter((c) => c.tipo === form.tipo).map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </label>
            {campos.categoriaId && <small>{campos.categoriaId}</small>}

            <label>
                {form.tipo === 'entrada' ? 'Fonte' : 'Destino'}
                <select name="fonteDestinoId" value={form.fonteDestinoId} onChange={mudar}>
                    <option value="">Escolha...</option>
                    {fontes.map((f) => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                </select>
            </label>
            {campos.fonteDestinoId && <small>{campos.fonteDestinoId}</small>}

            {mostrarParcelas && (
                <label>
                    Parcelas
                    <input name="parcelas" type="number" min="1" max="48" value={form.parcelas} onChange={mudar} />
                </label>
            )}
            {campos.parcelas && <small>{campos.parcelas}</small>}

            {erro && <p role="alert">{erro}</p>}

            <div>
                <button disabled={enviando}>{enviando ? 'Salvando...' : 'Salvar'}</button>
                <button type="button" onClick={aoCancelar}>Cancelar</button>
            </div>
        </form>
    );
}
