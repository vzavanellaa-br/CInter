import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Entrar from '../telas/responsavel/Entrar'
import CriarConta from '../telas/responsavel/CriarConta'
import PrimeiroAcesso from '../telas/responsavel/PrimeiroAcesso'
import Inicio from '../telas/responsavel/Inicio'
import Tarefas from '../telas/responsavel/Tarefas'
import Aprovacoes from '../telas/responsavel/Aprovacoes'
import DetalheCrianca from '../telas/responsavel/DetalheCrianca'
import MinhasTarefas from '../telas/crianca/MinhasTarefas'
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
        <Route
          path="/inicio/tarefas"
          element={
            <RotaProtegida>
              <Tarefas />
            </RotaProtegida>
          }
        />
        <Route
          path="/inicio/aprovacoes"
          element={
            <RotaProtegida>
              <Aprovacoes />
            </RotaProtegida>
          }
        />
        <Route
          path="/inicio/crianca/:criancaId"
          element={
            <RotaProtegida>
              <DetalheCrianca />
            </RotaProtegida>
          }
        />
        {/* Área da criança: por enquanto sem PIN, entra pelo botão do
            Início. A sessão continua sendo a do responsável no aparelho. */}
        <Route
          path="/crianca/:criancaId"
          element={
            <RotaProtegida>
              <MinhasTarefas />
            </RotaProtegida>
          }
        />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
