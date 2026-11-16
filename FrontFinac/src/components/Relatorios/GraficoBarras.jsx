// Gráfico de barras sem biblioteca e sem CSS: usa o elemento nativo <progress> do HTML (uma barra por linha).
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
                    <tr key={i.nome}>
                        <td>{i.nome}</td>
                        <td><progress value={i.valor} max={maior} style={{ width: '100%' }} /></td>
                        <td>{formatarMoeda(i.valor)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}