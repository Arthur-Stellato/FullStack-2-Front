// DONO: Pessoa 1 (Acesso e base). Veja DIVISAO.md, seção 5.
//
// TODO: se não houver usuário logado (useAuth), redirecionar para /login com <Navigate to="/login" replace />;
// se houver, mostrar as telas filhas com <Outlet />.
// Enquanto isso não existe, só deixa passar para as outras pessoas conseguirem abrir as telas deles.
import { Outlet } from 'react-router-dom';

export default function RotaProtegida() {
    return <Outlet />;
}
