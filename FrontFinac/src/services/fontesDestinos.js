// DONO: Pessoa 2. Funções que chamam /fontes-destinos pelo api.js.
import { api } from './api';

export const listarFontes = () => api.get('/fontes-destinos');
export const criarFonte = (dados) => api.post('/fontes-destinos', dados);
export const atualizarFonte = (id, dados) => api.put(`/fontes-destinos/${id}`, dados);
export const excluirFonte = (id) => api.delete(`/fontes-destinos/${id}`);
