// DONO: Pessoa 2. Funções que chamam /lancamentos pelo api.js (ex.: listarLancamentos, criarLancamento).
import { api } from './api';

// filtros: { inicio, fim, tipo, categoriaId, fonteDestinoId, pagina, porPagina }.
// Filtro vazio não vai para a URL (sem período, a API usa o mês corrente).
export function listarLancamentos(filtros = {}) {
    const params = new URLSearchParams();
    for (const [chave, valor] of Object.entries(filtros)) {
        if (valor !== '' && valor !== null && valor !== undefined) {
            params.set(chave, valor);
        }
    }
    const texto = params.toString();
    return api.get('/lancamentos' + (texto ? `?${texto}` : ''));
}

export const buscarLancamento = (id) => api.get(`/lancamentos/${id}`);

// Devolve SEMPRE uma lista: 1 item à vista, N itens (um por parcela) se parcelado.
export const criarLancamento = (dados) => api.post('/lancamentos', dados);

// Altera só aquela linha (mesmo corpo do POST, sem parcelas).
export const atualizarLancamento = (id, dados) => api.put(`/lancamentos/${id}`, dados);

// todasParcelas = true apaga a compra parcelada inteira; false apaga só aquela parcela.
export const excluirLancamento = (id, todasParcelas = false) =>
    api.delete(`/lancamentos/${id}` + (todasParcelas ? '?todasParcelas=true' : ''));

// A lista de categorias é da Pessoa 3 (services/categorias.js). Enquanto ela não entrega, o formulário
// usa esta função; depois dá para trocar por um import de lá.
export const listarCategorias = () => api.get('/categorias');
