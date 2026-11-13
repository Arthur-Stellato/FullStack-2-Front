import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const links = [
    ['/', 'Dashboard'],
    ['/lancamentos', 'Lançamentos'],
    ['/fontes-destinos', 'Fontes e destinos'],
    ['/categorias', 'Categorias'],
    ['/relatorios', 'Relatórios'],
    ['/faturas', 'Faturas'],
];
export default function Layout() {
    const { usuario, logout } = useAuth();

    return (
        <>
            <nav>
                {links.map(([caminho, texto]) => (
                    <NavLink key={caminho} to={caminho} end={caminho === '/'}>{texto}</NavLink>
                ))}
                <span>{usuario?.nome}</span>
                <button onClick={logout}>Sair</button>
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    );
}
