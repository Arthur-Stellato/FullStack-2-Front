import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { formatarMoeda, formatarData } from '../services/formatadores';

export default function Dashboard() {
    const [dados, setDados] = useState(null);
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        api.get('/relatorios/categorias')
            .then(setDados)
            .catch((e) => setErro(e.erro || 'Erro ao carregar dados'))
            .finally(() => setCarregando(false));
    }, []);

    if (carregando) return <p>Carregando...</p>;
    if (erro) return <p role="alert">{erro}</p>;
    if (dados.totalEntradas === 0 && dados.totalSaidas === 0 && dados.categorias.length === 0) {
        return <p>Nenhum lançamento neste mês.</p>;
    }

    const saldo = dados.totalEntradas - dados.totalSaidas;

    return (
        <>
            <h1>Resumo do mês</h1>
            <p>{formatarData(dados.periodo.inicio)} a {formatarData(dados.periodo.fim)}</p>

            <table>
                <thead><tr><th>Entradas</th><th>Saídas</th><th>Saldo</th></tr></thead>
                <tbody>
                    <tr>
                        <td>{formatarMoeda(dados.totalEntradas)}</td>
                        <td>{formatarMoeda(dados.totalSaidas)}</td>
                        <td>{formatarMoeda(saldo)}</td>
                    </tr>
                </tbody>
            </table>

            <h2>Saídas por categoria</h2>
            <table>
                <thead><tr><th>Categoria</th><th>Total</th><th>%</th><th>Mês anterior</th></tr></thead>
                <tbody>
                    {dados.categorias.map((c) => (
                        <tr key={c.id}>
                            <td>{c.nome}</td>
                            <td>{formatarMoeda(c.total)}</td>
                            <td>{c.percentual.toFixed(1).replace('.', ',')}%</td>
                            <td>{formatarMoeda(c.periodoAnterior)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}