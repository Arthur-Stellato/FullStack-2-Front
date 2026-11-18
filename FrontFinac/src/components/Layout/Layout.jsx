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
        <div className="d-flex">
            <nav className="d-flex flex-column flex-shrink-0 sticky-top vh-100 align-self-start bg-white border-end p-3 text-nowrap">
                <span className="fs-5 fw-semibold mb-3">Controlador Financeiro</span>
                <div className="nav nav-pills flex-column">
                    {links.map(([caminho, texto]) => (
                        <NavLink key={caminho} to={caminho} end={caminho === '/'}
                            className={({ isActive }) => `nav-link ${isActive ? 'text-bg-dark' : 'link-dark'}`}>
                            {texto}
                        </NavLink>
                    ))}
                </div>
                <div className="mt-auto border-top pt-3">
                    <div className="small text-secondary mb-2">{usuario?.nome}</div>
                    <button className="btn btn-sm btn-outline-secondary w-100" onClick={logout}>Sair</button>
                </div>
            </nav>
            <main className="flex-grow-1">
                <Outlet />
            </main>
        </div>
    );
}