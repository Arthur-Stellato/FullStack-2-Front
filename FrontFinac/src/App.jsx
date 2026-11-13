// Todas as rotas do front ficam aqui, já ligadas às telas. Cada pessoa só preenche a sua tela
// (o arquivo da tela), sem precisar mexer neste arquivo nem no menu (components/Layout/Layout.jsx).
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import RotaProtegida from './components/RotaProtegida';
import Login from './components/Login';
import Cadastro from './components/Cadastro';
import Dashboard from './components/Dashboard';
import FontesDestinos from './components/FontesDestinos/FontesDestinos';
import Lancamentos from './components/Lancamentos/Lancamentos';
import Categorias from './components/Categorias/Categorias';
import Relatorios from './components/Relatorios/Relatorios';
import Faturas from './components/Faturas/Faturas';

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />

            <Route element={<RotaProtegida />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/lancamentos" element={<Lancamentos />} />
                    <Route path="/fontes-destinos" element={<FontesDestinos />} />
                    <Route path="/categorias" element={<Categorias />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/faturas" element={<Faturas />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
