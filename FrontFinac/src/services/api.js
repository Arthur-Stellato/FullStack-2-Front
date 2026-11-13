const URL_BASE = import.meta.env.VITE_API_URL;

async function requisicao(metodo, caminho, corpo) {
    const token = localStorage.getItem('token');   
    const resposta = await fetch(URL_BASE + caminho, {
        method: metodo,
        headers: {
            ...(corpo && { 'Content-Type': 'application/json' }),
            ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: corpo ? JSON.stringify(corpo) : undefined,
    });

    if (resposta.status === 401 && token) {
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw { status: 401, erro: 'Não autorizado', campos: null };
    }
    if (resposta.status === 204) {
        return null;
    }

    const dados = await resposta.json();
    if (!resposta.ok) throw { status: resposta.status, ...dados };
    return dados;
    
};

export const api = {
    get: (caminho) => requisicao('GET', caminho),
    post: (caminho, corpo) => requisicao('POST', caminho, corpo),
    put: (caminho, corpo) => requisicao('PUT', caminho, corpo),
    delete: (caminho) => requisicao('DELETE', caminho),
};