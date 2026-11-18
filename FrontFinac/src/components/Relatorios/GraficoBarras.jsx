// Gráfico de barras sem biblioteca: usa a barra de progresso do Bootstrap (uma barra por linha).
// itens: [{ nome, valor }]. Os valores já vêm somados do servidor; aqui só se compara cada um com o maior.
import { formatarMoeda } from '../../services/formatadores';

export default function GraficoBarras({ titulo, itens }) {
    const maior = Math.max(...itens.map((i) => i.valor), 0);
    if (maior === 0) {
        return <p>Sem valores para mostrar no gráfico.</p>;
    }
    return (
        <table aria-label={titulo}>
            <tbody>
                {itens.map((i) => (
                    <tr key={i.nome} className="align-middle">
                        <td>{i.nome}</td>
                        <td className="w-50">
                            <div className="progress" role="progressbar" aria-label={i.nome}
                                aria-valuenow={i.valor} aria-valuemin={0} aria-valuemax={maior}>
                                <div className="progress-bar bg-dark" style={{ width: `${(i.valor / maior) * 100}%` }} />
                            </div>
                        </td>
                        <td>{formatarMoeda(i.valor)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}