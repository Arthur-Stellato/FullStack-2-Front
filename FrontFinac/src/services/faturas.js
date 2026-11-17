// DONO: Pessoa 3. Funções que chamam /relatorios/faturas pelo api.js.

import { api } from './api';

// GET /relatorios/faturas?meses=3 => um item por cartão, com as faturas (fechada, aberta e futuras)
export const listarFaturas = (meses = 3) => api.get(`/relatorios/faturas?meses=${meses}`);