// DONO: Pessoa 1 (Acesso e base). Veja DIVISAO.md, seção 1 (regra 2 do front) e seção 4 (contrato da API).
//
// Único ponto de acesso à API: nenhuma tela chama fetch direto. Contrato de uso (todo mundo programa em cima dele):
//   import { api } from '../../services/api';
//   const dados = await api.get('/lancamentos?pagina=1');      // GET, devolve o JSON já convertido
//   await api.post('/categorias', { nome, tipo });             // POST, corpo vira JSON
//   await api.put('/categorias/3', { nome });                  // PUT
//   await api.delete('/lancamentos/7?todasParcelas=true');     // DELETE, devolve null (a API responde 204)
// O caminho começa com '/' e é relativo a import.meta.env.VITE_API_URL (ex.: http://localhost:3000/api).
// Erro (400, 404, 409...): lança { status, erro, campos } com o JSON de erro da API. Quem chamou mostra a
// mensagem e, se vier campos, cada mensagem junto ao campo do formulário.
// 401: faz logout e volta ao login sozinho; a tela não precisa tratar.
//
// TODO: implementar com fetch (ou Axios, se o professor aprovar): Authorization: Bearer <token> automático,
// Content-Type JSON, conversão da resposta e o tratamento de erro e de 401 descritos acima.
const falta = (nome) => () => { throw new Error(`TODO (Pessoa 1): services/api.${nome}`); };

export const api = { get: falta('get'), post: falta('post'), put: falta('put'), delete: falta('delete') };
