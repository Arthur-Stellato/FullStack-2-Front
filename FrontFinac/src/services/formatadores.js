// Peças prontas, usadas por todas as telas (mesmo formato em todo lugar). O envio para a API continua
// com número e 'AAAA-MM-DD'; estas funções são só para MOSTRAR.
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// 1234.5 ou '1234.50' => 'R$ 1.234,50'
export const formatarMoeda = (valor) => moeda.format(Number(valor));

// '2026-11-09' => '09/11/2026' (sem new Date, para o fuso horário não mudar o dia)
export const formatarData = (iso) => iso.split('-').reverse().join('/');

// Vai formatando enquanto digita: '5299822' => '529.982.2', '52998224725' => '529.982.247-25'
export const mascararCpf = (texto) => String(texto).replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
