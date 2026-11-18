// DONO: Pessoa 3 (Categorias e relatórios). Relatórios por categoria e por fonte/destino, com seletor de período.
// Todos os totais vêm somados do servidor (GROUP BY + SUM); aqui só se mostra e se calcula a diferença entre períodos.
import { useEffect, useState } from 'react';
import { relatorioPorCategoria, relatorioPorFonte } from '../../services/relatorios';
import { formatarData, formatarMoeda } from '../../services/formatadores';
import GraficoBarras from './GraficoBarras';

const TIPOS_FONTE = { renda: 'Renda', conta: 'Conta', cartao_credito: 'Cartão de crédito' };

// Aumento/redução de uma categoria contra o período anterior
function Variacao({ total, anterior }) {
    const diferenca = total - anterior;
    if (Math.abs(diferenca) < 0.005) {
        return <>Sem mudança</>;
    }
    const texto = anterior > 0 ? ` (${Math.abs((diferenca / anterior) * 100).toFixed(1).replace('.', ',')}%)` : '';
    // Só é usada nas saídas: gastar mais (aumento) é ruim, gastar menos (redução) é bom
    return diferenca > 0
        ? <span className="text-danger">▲ Aumento de {formatarMoeda(diferenca)}{texto}</span>
        : <span className="text-success">▼ Redução de {formatarMoeda(-diferenca)}{texto}</span>;
}

// Três cards no topo: entradas, saídas e saldo do período
function Resumo({ entradas, saidas }) {
    const saldo = entradas - saidas;
    const itens = [
        ['Entradas', entradas, 'text-success'],
        ['Saídas', saidas, 'text-danger'],
        ['Saldo', saldo, saldo < 0 ? 'text-danger' : 'text-dark'],
    ];
    return (
        <div className="row g-3 mb-3">
            {itens.map(([rotulo, valor, cor]) => (
                <div className="col-12 col-sm-4" key={rotulo}>
                    <div className="card card-body">
                        <div className="small text-secondary">{rotulo}</div>
                        <div className={`fs-5 fw-semibold ${cor}`}>{formatarMoeda(valor)}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function Relatorios() {
    const [aba, setAba] = useState('categorias');
    const [dados, setDados] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [campos, setCampos] = useState({});

    // Datas digitadas nos campos. Ficam vazias até o servidor responder com o mês corrente.
    const [inicio, setInicio] = useState('');
    const [fim, setFim] = useState('');

    // Busca o relatório da aba atual. Sem datas, o servidor usa o mês corrente.
    async function carregar(abaAtual, ini, f) {
        setCarregando(true);
        setErro('');
        setCampos({});
        try {
            const buscar = abaAtual === 'categorias' ? relatorioPorCategoria : relatorioPorFonte;
            const resposta = await buscar(ini, f);
            setDados(resposta);
            setInicio(resposta.periodo.inicio);
            setFim(resposta.periodo.fim);
        } catch (e) {
            setErro(e.erro || 'Não foi possível carregar o relatório.');
            setCampos(e.campos || {});
        } finally {
            setCarregando(false);
        }
    }

    // Ao abrir a tela e ao trocar de aba, mantém o período que está escolhido
    useEffect(() => {
        carregar(aba, inicio, fim);
    }, [aba]);

    function aplicar(evento) {
        evento.preventDefault();
        carregar(aba, inicio, fim);
    }

    function mesAtual() {
        setInicio('');
        setFim('');
        carregar(aba, '', '');
    }

    return (
        <>
            <h1>Relatórios</h1>

            <search>
                <form onSubmit={aplicar}>
                    <label>
                        De
                        <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
                    </label>
                    {campos.inicio && <small>{campos.inicio}</small>}

                    <label>
                        Até
                        <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
                    </label>
                    {campos.fim && <small>{campos.fim}</small>}

                    <div>
                        <button>Aplicar</button>
                        <button type="button" onClick={mesAtual}>Mês atual</button>
                    </div>
                </form>
            </search>

            <ul className="nav nav-tabs mb-3">
                {[['categorias', 'Por categoria'], ['fontes', 'Por fonte e destino']].map(([chave, texto]) => (
                    <li className="nav-item" key={chave}>
                        <button type="button" className={`nav-link bg-transparent ${aba === chave ? 'active' : ''}`}
                            onClick={() => setAba(chave)}>{texto}</button>
                    </li>
                ))}
            </ul>

            {erro && <p role="alert">{erro}</p>}
            {carregando && <p>Carregando...</p>}

            {!carregando && dados && aba === 'categorias' && dados.categorias && (
                <>
                    <p>
                        Período: {formatarData(dados.periodo.inicio)} a {formatarData(dados.periodo.fim)}
                        {' '}(comparado com {formatarData(dados.periodoComparado.inicio)} a {formatarData(dados.periodoComparado.fim)})
                    </p>

                    <Resumo entradas={dados.totalEntradas} saidas={dados.totalSaidas} />

                    <h2>Saídas por categoria</h2>
                    {dados.categorias.length === 0 ? <p>Nenhuma saída neste período.</p> : (
                        <>
                            <GraficoBarras titulo="Saídas por categoria"
                                itens={dados.categorias.map((c) => ({ nome: c.nome, valor: c.total }))} />
                            <table>
                                <thead>
                                    <tr><th>Categoria</th><th>Total</th><th>%</th><th>Período anterior</th><th>Variação</th></tr>
                                </thead>
                                <tbody>
                                    {dados.categorias.map((c) => (
                                        <tr key={c.id}>
                                            <td>{c.nome}</td>
                                            <td>{formatarMoeda(c.total)}</td>
                                            <td>{c.percentual.toFixed(1).replace('.', ',')}%</td>
                                            <td>{formatarMoeda(c.periodoAnterior)}</td>
                                            <td><Variacao total={c.total} anterior={c.periodoAnterior} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>Total</th>
                                        <th>{formatarMoeda(dados.totalSaidas)}</th>
                                        <th></th>
                                        <th>{formatarMoeda(dados.totalSaidasAnterior)}</th>
                                        <th><Variacao total={dados.totalSaidas} anterior={dados.totalSaidasAnterior} /></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </>
                    )}

                    <h2>Entradas por categoria</h2>
                    {dados.entradas.length === 0 ? <p>Nenhuma entrada neste período.</p> : (
                        <table>
                            <thead><tr><th>Categoria</th><th>Total</th></tr></thead>
                            <tbody>
                                {dados.entradas.map((c) => (
                                    <tr key={c.id}><td>{c.nome}</td><td>{formatarMoeda(c.total)}</td></tr>
                                ))}
                            </tbody>
                            <tfoot><tr><th>Total</th><th>{formatarMoeda(dados.totalEntradas)}</th></tr></tfoot>
                        </table>
                    )}
                </>
            )}

            {!carregando && dados && aba === 'fontes' && dados.fontes && (
                <>
                    <p>Período: {formatarData(dados.periodo.inicio)} a {formatarData(dados.periodo.fim)}</p>

                    <Resumo entradas={dados.totalEntradas} saidas={dados.totalSaidas} />

                    <h2>Saídas por fonte e destino</h2>
                    <GraficoBarras titulo="Saídas por fonte e destino"
                        itens={dados.fontes.map((f) => ({ nome: f.nome, valor: f.saidas }))} />

                    <h2>Entradas e saídas</h2>
                    {dados.fontes.length === 0 ? <p>Nenhuma fonte ou destino cadastrado.</p> : (
                        <table>
                            <thead>
                                <tr><th>Nome</th><th>Tipo</th><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr>
                            </thead>
                            <tbody>
                                {dados.fontes.map((f) => (
                                    <tr key={f.id}>
                                        <td>{f.nome}</td>
                                        <td>{TIPOS_FONTE[f.tipo]}</td>
                                        <td>{formatarMoeda(f.entradas)}</td>
                                        <td>{formatarMoeda(f.saidas)}</td>
                                        <td>{f.saldo === null ? '—' : formatarMoeda(f.saldo)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <th colSpan={2}>Total</th>
                                    <th>{formatarMoeda(dados.totalEntradas)}</th>
                                    <th>{formatarMoeda(dados.totalSaidas)}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                        </table>
                    )}
                </>
            )}
        </>
    );
}