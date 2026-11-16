// DONO: Pessoa 2 (Fontes e lançamentos). Veja DIVISAO.md, seção 5.
//
// Lista de lançamentos com filtros por período/tipo/categoria/fonte, paginação, totais e o formulário
// para criar (inclusive compra parcelada no cartão), editar e excluir (uma parcela ou a compra inteira).
// Serviço da tela: services/lancamentos.js.
import { useEffect, useState } from 'react';
import { excluirLancamento, listarCategorias, listarLancamentos } from '../../services/lancamentos';
import { listarFontes } from '../../services/fontesDestinos';
import { formatarData, formatarMoeda } from '../../services/formatadores';
import FormularioLancamento from './FormularioLancamento';

const FILTROS_VAZIOS = { inicio: '', fim: '', tipo: '', categoriaId: '', fonteDestinoId: '' };

// Num 400 a mensagem útil está em `campos` (ex.: "Data de início maior que a de fim."), não em `erro`
function textoDoErro(e) {
    const detalhes = Object.values(e.campos || {}).join(' ');
    return detalhes || e.erro || 'Não foi possível carregar os lançamentos.';
}

export default function Lancamentos() {
    const [resposta, setResposta] = useState(null);   // { periodo, itens, paginacao, totais }
    const [pagina, setPagina] = useState(1);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    const [filtros, setFiltros] = useState(FILTROS_VAZIOS);     // o que está nos campos
    const [aplicados, setAplicados] = useState(FILTROS_VAZIOS); // o que foi enviado à API (só muda ao clicar em Filtrar)

    const [categorias, setCategorias] = useState([]);
    const [fontes, setFontes] = useState([]);
    const [erroOpcoes, setErroOpcoes] = useState('');

    const [formAberto, setFormAberto] = useState(false);
    const [editando, setEditando] = useState(null);     // lançamento sendo editado (null = novo)
    const [excluindo, setExcluindo] = useState(null);   // lançamento que espera a confirmação de exclusão
    const [erroExcluir, setErroExcluir] = useState('');
    const [recarga, setRecarga] = useState(0);   // soma 1 para buscar a lista de novo depois de salvar

    // As listas dos <select> carregam uma vez
    useEffect(() => {
        Promise.all([listarCategorias(), listarFontes()])
            .then(([cats, fts]) => { setCategorias(cats); setFontes(fts); })
            .catch((e) => setErroOpcoes(e.erro || 'Não foi possível carregar categorias e fontes.'));
    }, []);

    useEffect(() => {
        let ativo = true;   // ignora resposta atrasada se o filtro mudou no meio do caminho
        setCarregando(true);
        setErro('');
        listarLancamentos({ ...aplicados, pagina })
            .then((dados) => { if (ativo) setResposta(dados); })
            .catch((e) => { if (ativo) setErro(textoDoErro(e)); })
            .finally(() => { if (ativo) setCarregando(false); });
        return () => { ativo = false; };
    }, [aplicados, pagina, recarga]);

    function mudarFiltro(evento) {
        const { name, value } = evento.target;
        setFiltros({ ...filtros, [name]: value });
    }

    function filtrar(evento) {
        evento.preventDefault();
        setPagina(1);
        setAplicados(filtros);
    }

    function novo() {
        setEditando(null);
        setFormAberto(true);
    }

    function editar(lancamento) {
        setEditando(lancamento);
        setFormAberto(true);
    }

    function aoSalvar() {
        setFormAberto(false);
        if (editando === null) setPagina(1);   // lançamento novo aparece no topo; na edição fica na mesma página
        setEditando(null);
        setRecarga(recarga + 1);
    }

    function pedirExclusao(lancamento) {
        setErroExcluir('');
        setExcluindo(lancamento);
    }

    // todasParcelas = true apaga a compra inteira; false só aquela linha
    async function excluir(todasParcelas) {
        setErroExcluir('');
        try {
            await excluirLancamento(excluindo.id, todasParcelas);
            setExcluindo(null);
            if (resposta.itens.length === 1 && pagina > 1) {
                setPagina(pagina - 1);   // apagou o último da página: volta uma
            } else {
                setRecarga(recarga + 1);
            }
        } catch (e) {
            setErroExcluir(e.erro || 'Não foi possível excluir.');
        }
    }

    function limpar() {
        setFiltros(FILTROS_VAZIOS);
        setPagina(1);
        setAplicados(FILTROS_VAZIOS);
    }

    const formularioDeFiltros = (
        <form onSubmit={filtrar}>
            <h2>Filtros</h2>
            <label>
                De
                <input name="inicio" type="date" value={filtros.inicio} onChange={mudarFiltro} />
            </label>
            <label>
                Até
                <input name="fim" type="date" value={filtros.fim} onChange={mudarFiltro} />
            </label>
            <label>
                Tipo
                <select name="tipo" value={filtros.tipo} onChange={mudarFiltro}>
                    <option value="">Todos</option>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                </select>
            </label>
            <label>
                Categoria
                <select name="categoriaId" value={filtros.categoriaId} onChange={mudarFiltro}>
                    <option value="">Todas</option>
                    {categorias.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome} ({c.tipo === 'entrada' ? 'entrada' : 'saída'})</option>
                    ))}
                </select>
            </label>
            <label>
                Fonte/destino
                <select name="fonteDestinoId" value={filtros.fonteDestinoId} onChange={mudarFiltro}>
                    <option value="">Todas</option>
                    {fontes.map((f) => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                    ))}
                </select>
            </label>
            {erroOpcoes && <p role="alert">{erroOpcoes}</p>}
            <div>
                <button>Filtrar</button>
                <button type="button" onClick={limpar}>Limpar</button>
            </div>
        </form>
    );

    // Confirmação de exclusão. Se a compra for parcelada, pergunta: só esta parcela ou todas?
    function janelaDeExclusao() {
        const parcelado = excluindo.totalParcelas > 1;
        return (
            <dialog open>
                <p>
                    Excluir "{excluindo.descricao}"
                    {parcelado ? ` (parcela ${excluindo.parcelaAtual}/${excluindo.totalParcelas})` : ''}?
                </p>
                {parcelado ? (
                    <>
                        <button onClick={() => excluir(false)}>Só esta parcela</button>
                        <button onClick={() => excluir(true)}>Todas as {excluindo.totalParcelas} parcelas</button>
                    </>
                ) : (
                    <button onClick={() => excluir(false)}>Excluir</button>
                )}
                <button onClick={() => setExcluindo(null)}>Cancelar</button>
                {erroExcluir && <p role="alert">{erroExcluir}</p>}
            </dialog>
        );
    }

    function conteudo() {
        if (carregando) return <p>Carregando...</p>;
        if (erro) return <p role="alert">{erro}</p>;

        const { periodo, itens, paginacao, totais } = resposta;
        return (
            <>
                <p>Período: {formatarData(periodo.inicio)} a {formatarData(periodo.fim)}</p>

                <dl>
                    <dt>Entradas</dt>
                    <dd>{formatarMoeda(totais.entradas)}</dd>
                    <dt>Saídas</dt>
                    <dd>{formatarMoeda(totais.saidas)}</dd>
                    <dt>Saldo</dt>
                    <dd>{formatarMoeda(totais.saldo)}</dd>
                </dl>

                {itens.length === 0 ? (
                    <p>Nenhum lançamento neste período.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Fonte/destino</th>
                                <th>Parcela</th>
                                <th>Valor</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {itens.map((l) => (
                                <tr key={l.id}>
                                    <td>{formatarData(l.data)}</td>
                                    <td>{l.descricao}</td>
                                    <td>{l.categoriaNome}</td>
                                    <td>{l.fonteDestinoNome}</td>
                                    <td>{l.totalParcelas > 1 ? `${l.parcelaAtual}/${l.totalParcelas}` : '-'}</td>
                                    <td>{l.tipo === 'saida' ? '-' : ''}{formatarMoeda(l.valor)}</td>
                                    <td>
                                        <button type="button" onClick={() => editar(l)}>Editar</button>
                                        <button type="button" onClick={() => pedirExclusao(l)}>Excluir</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                <nav aria-label="Paginação">
                    <button disabled={paginacao.pagina <= 1} onClick={() => setPagina(pagina - 1)}>Anterior</button>
                    <span>Página {paginacao.pagina} de {Math.max(paginacao.totalPaginas, 1)}</span>
                    <button disabled={paginacao.pagina >= paginacao.totalPaginas} onClick={() => setPagina(pagina + 1)}>Próxima</button>
                </nav>
            </>
        );
    }

    return (
        <section>
            <h1>Lançamentos</h1>

            {formAberto ? (
                <FormularioLancamento
                    key={editando ? editando.id : 'novo'}
                    lancamento={editando}
                    categorias={categorias}
                    fontes={fontes}
                    aoSalvar={aoSalvar}
                    aoCancelar={() => { setFormAberto(false); setEditando(null); }}
                />
            ) : (
                <button onClick={novo}>Novo lançamento</button>
            )}

            {excluindo && janelaDeExclusao()}

            {formularioDeFiltros}
            {conteudo()}
        </section>
    );
}
