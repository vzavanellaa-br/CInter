import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Entrar from '../telas/responsavel/Entrar'
import CriarConta from '../telas/responsavel/CriarConta'
import PrimeiroAcesso from '../telas/responsavel/PrimeiroAcesso'
import Inicio from '../telas/responsavel/Inicio'
import RotaProtegida from './RotaProtegida'

export default function AppRotas() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/entrar" replace />} />
        <Route path="/entrar" element={<Entrar />} />
        <Route path="/criar-conta" element={<CriarConta />} />
        <Route
          path="/primeiro-acesso"
          element={
            <RotaProtegida>
              <PrimeiroAcesso />
            </RotaProtegida>
          }
        />
        <Route
          path="/inicio"
          element={
            <RotaProtegida>
              <Inicio />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
