// DONO: Pessoa 1 (Acesso e base). Veja DIVISAO.md, seção 5.
// Moldura das telas protegidas: menu de navegação + a tela da rota atual no <Outlet />.
//
// TODO (Pessoa 1): mostrar o nome do usuário logado e o botão Sair (useAuth().logout) e dar o estilo.
import { NavLink, Outlet } from 'react-router-dom';

const links = [
    ['/', 'Dashboard'],
    ['/lancamentos', 'Lançamentos'],
    ['/fontes-destinos', 'Fontes e destinos'],
    ['/categorias', 'Categorias'],
    ['/relatorios', 'Relatórios'],
    ['/faturas', 'Faturas'],
];

export default function Layout() {
    return (
        <>
            <nav>
                {links.map(([caminho, texto]) => (
                    <NavLink key={caminho} to={caminho} end={caminho === '/'}>{texto}</NavLink>
                ))}
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    );
}
