// DONO: Pessoa 3. Funções que chamam /categorias pelo api.js.


import { api } from './api';

// GET /categorias => [{ id, nome, tipo }]
export const listarCategorias = () => api.get('/categorias');

// POST /categorias com { nome, tipo } ('entrada' ou 'saida')
export const criarCategoria = (dados) => api.post('/categorias', dados);

// PUT /categorias/:id: só o nome pode mudar (trocar o tipo quebraria os lançamentos)
export const editarCategoria = (id, nome) => api.put(`/categorias/${id}`, { nome });

// DELETE /categorias/:id: 409 se ainda houver lançamentos nela
export const excluirCategoria = (id) => api.delete(`/categorias/${id}`);