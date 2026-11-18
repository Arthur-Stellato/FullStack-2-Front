// DONO: Pessoa 3 (Categorias e relatórios). Faturas dos cartões de crédito: um bloco por cartão, com a fatura
// fechada (se ainda não venceu), a aberta e as próximas, os lançamentos com a parcela (ex.: "Notebook 3/10"),
// o limite usado e o disponível. Quem decide em qual fatura cai cada parcela é o servidor (calcularFatura).
import { useEffect, useState } from 'react';
import { listarFaturas } from '../../services/faturas';
import { formatarData, formatarMoeda } from '../../services/formatadores';

const ROTULO_SITUACAO = { fechada: 'Fechada', aberta: 'Aberta', futura: 'Futura' };

// '2026-12' => '12/2026'
const formatarReferencia = (referencia) => referencia.split('-').reverse().join('/');

export default function Faturas() {
    const [cartoes, setCartoes] = useState(null);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        listarFaturas()
            .then(setCartoes)
            .catch((e) => setErro(e.erro || 'Não foi possível carregar as faturas.'))
            .finally(() => setCarregando(false));
    }, []);

    if (carregando) return <p>Carregando...</p>;
    if (erro) return <p role="alert">{erro}</p>;

    return (
        <>
            <h1>Faturas</h1>
            {cartoes.length === 0 && <p>Nenhum cartão de crédito cadastrado. Cadastre um em Fontes e destinos.</p>}

            {cartoes.map((cartao) => {
                const usado = cartao.limite > 0 ? Math.min(100, (cartao.limiteUtilizado / cartao.limite) * 100) : 0;
                return (
                    <section key={cartao.id}>
                        <h2>{cartao.nome}</h2>
                        <p>Fecha dia {cartao.diaFechamento} · vence dia {cartao.diaVencimento}</p>

                        <progress value={usado} max={100} aria-label={`Limite usado: ${usado.toFixed(0)}%`} style={{ width: '100%' }} />
                        <p>
                            Limite {formatarMoeda(cartao.limite)} · usado {formatarMoeda(cartao.limiteUtilizado)} ·
                            {' '}disponível <strong>{formatarMoeda(cartao.limiteDisponivel)}</strong>
                        </p>

                        {cartao.faturas.map((fatura) => (
                            <details key={fatura.referencia} open={fatura.situacao === 'aberta'} className="mb-3">
                                <summary className="fw-semibold mb-2">
                                    Fatura {formatarReferencia(fatura.referencia)}
                                    {' '}({ROTULO_SITUACAO[fatura.situacao]}) · fecha {formatarData(fatura.fechamento)} · vence {formatarData(fatura.vencimento)} · total {formatarMoeda(fatura.total)}
                                </summary>
                                {fatura.lancamentos.length === 0 ? <p>Sem lançamentos.</p> : (
                                    <table>
                                        <thead><tr><th>Compra</th><th>Data da compra</th><th>Valor</th></tr></thead>
                                        <tbody>
                                            {fatura.lancamentos.map((l) => (
                                                <tr key={l.id}>
                                                    <td>{l.descricao} {l.parcela}</td>
                                                    <td>{formatarData(l.data)}</td>
                                                    <td>{formatarMoeda(l.valor)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot><tr><th colSpan={2}>Total da fatura</th><th>{formatarMoeda(fatura.total)}</th></tr></tfoot>
                                    </table>
                                )}
                            </details>
                        ))}
                    </section>
                );
            })}
        </>
    );
}