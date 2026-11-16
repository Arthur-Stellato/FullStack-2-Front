// DONO: Pessoa 3. Funções que chamam /relatorios pelo api.js.

import { api } from './api';

// Monta '?inicio=...&fim=...'. Sem período, não manda nada e o servidor usa o mês corrente.
function consultaPeriodo(inicio, fim) {
    return inicio && fim ? `?inicio=${inicio}&fim=${fim}` : '';
}

// GET /relatorios/categorias => { periodo, periodoComparado, totalSaidas, totalSaidasAnterior, categorias, totalEntradas, entradas }
export const relatorioPorCategoria = (inicio, fim) => api.get('/relatorios/categorias' + consultaPeriodo(inicio, fim));

// GET /relatorios/fontes-destinos => { periodo, totalEntradas, totalSaidas, fontes }
export const relatorioPorFonte = (inicio, fim) => api.get('/relatorios/fontes-destinos' + consultaPeriodo(inicio, fim));