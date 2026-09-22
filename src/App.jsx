import { useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import { GlobalLoader } from './components/shared/GlobalLoader.jsx'
import Profile from './pages/Profile.jsx'
import Companies from './pages/Companies.jsx'
import CompanyCreate from './pages/CompanyCreate.jsx'
import CompanyList from './pages/CompanyList.jsx'
import CompanyWorkspaceRoot from './pages/company-workspace/CompanyWorkspaceRoot.jsx'
import CompanyProfile from './pages/company-workspace/CompanyProfile.jsx'
import OwnerList from './pages/company-workspace/OwnerList.jsx'
import OwnerForm from './pages/company-workspace/OwnerForm.jsx'
import TransportRate from './pages/company-workspace/TransportRate.jsx'
import BunkData from './pages/company-workspace/BunkData.jsx'
import CashAccounts from './pages/company-workspace/CashAccounts.jsx'
import DriverList from './pages/company-workspace/DriverList.jsx'
import DriverForm from './pages/company-workspace/DriverForm.jsx'
import ClientList from './pages/company-workspace/ClientList.jsx'
import ClientForm from './pages/company-workspace/ClientForm.jsx'
import ClientDetail from './pages/company-workspace/ClientDetail.jsx'
import TruckList from './pages/company-workspace/TruckList.jsx'
import TruckForm from './pages/company-workspace/TruckForm.jsx'
import MaterialList from './pages/company-workspace/MaterialList.jsx'
import MaterialForm from './pages/company-workspace/MaterialForm.jsx'
import DcList from './pages/company-workspace/DcList.jsx'
import DcCreate from './pages/company-workspace/DcCreate.jsx'
import CompanyUserAssignments from './pages/CompanyUserAssignments.jsx'
import GstConfigurer from './pages/GstConfigurer.jsx'
import Users from './pages/Users.jsx'
import UserCreate from './pages/UserCreate.jsx'
import { getCurrentUser, isAuthenticated, logout } from './lib/auth-service'
import { canAccessRoute } from './lib/access-control'

function LoginRoute({ onLoginSuccess }) {
  const navigate = useNavigate()

  return (
    <Login
      onSuccess={(session) => {
        onLoginSuccess(session)
        navigate('/profile', { replace: true })
      }}
    />
  )
}

function RequireAccess({ user, children }) {
  const { pathname } = useLocation()
  return canAccessRoute(user, pathname) ? children : <Navigate to="/profile" replace />
}

function useAppLogout(onLoggedOut) {
  const navigate = useNavigate()

  return async function handleLogout() {
    await logout()
    onLoggedOut()
    navigate('/', { replace: true })
  }
}

function ProfileRoute({ user, onLoggedOut }) {
  return <Profile user={user} onLogout={useAppLogout(onLoggedOut)} />
}

function CompaniesRoute({ onLoggedOut }) {
  return <Companies onLogout={useAppLogout(onLoggedOut)} />
}

function CompanyCreateRoute({ onLoggedOut }) {
  return <CompanyCreate onLogout={useAppLogout(onLoggedOut)} />
}

function CompanyListRoute({ onLoggedOut }) {
  return <CompanyList onLogout={useAppLogout(onLoggedOut)} />
}

function CompanyWorkspaceRootRoute({ onLoggedOut }) {
  return <CompanyWorkspaceRoot onLogout={useAppLogout(onLoggedOut)} />
}

function CompanyUserAssignmentsRoute({ onLoggedOut }) {
  return <CompanyUserAssignments onLogout={useAppLogout(onLoggedOut)} />
}

function UsersRoute({ onLoggedOut }) {
  return <Users onLogout={useAppLogout(onLoggedOut)} />
}

function GstConfigurerRoute({ onLoggedOut }) {
  return <GstConfigurer onLogout={useAppLogout(onLoggedOut)} />
}

function UserCreateRoute({ kind, onLoggedOut }) {
  return <UserCreate kind={kind} onLogout={useAppLogout(onLoggedOut)} />
}

function App() {
  const [session, setSession] = useState(() => (isAuthenticated() ? { user: getCurrentUser() } : null))
  const onLoggedOut = () => setSession(null)

  return (
    <>
      <GlobalLoader />
      <Routes>
      <Route path="/" element={session ? <Navigate to="/profile" replace /> : <LoginRoute onLoginSuccess={setSession} />} />
      <Route path="/profile" element={session ? <ProfileRoute user={session.user} onLoggedOut={onLoggedOut} /> : <Navigate to="/" replace />} />
      <Route
        path="/companies"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <CompaniesRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/companies/new"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <CompanyCreateRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/companies/:companyId/users"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <CompanyUserAssignmentsRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/company-list"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <CompanyListRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/company-list/:companyId"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <CompanyWorkspaceRootRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      >
        <Route index element={<Navigate to="owner" replace />} />
        <Route path="profile" element={<CompanyProfile />} />
        <Route path="owner" element={<OwnerList />} />
        <Route path="owner/new" element={<OwnerForm />} />
        <Route path="owner/:ownerId" element={<OwnerForm />} />
        <Route path="transport-rate" element={<TransportRate />} />
        <Route path="bunk-data" element={<BunkData />} />
        <Route path="account" element={<CashAccounts />} />
        <Route path="driver" element={<DriverList />} />
        <Route path="driver/new" element={<DriverForm />} />
        <Route path="driver/:driverId" element={<DriverForm />} />
        <Route path="client" element={<ClientList />} />
        <Route path="client/new" element={<ClientForm />} />
        <Route path="client/:clientId" element={<ClientDetail />} />
        <Route path="truck" element={<TruckList />} />
        <Route path="truck/new" element={<TruckForm />} />
        <Route path="truck/:truckId" element={<TruckForm />} />
        <Route path="material" element={<MaterialList />} />
        <Route path="material/new" element={<MaterialForm />} />
        <Route path="material/:materialId" element={<MaterialForm />} />
        <Route path="dc" element={<DcList />} />
        <Route path="dc/new" element={<DcCreate />} />
      </Route>
      <Route
        path="/users"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <UsersRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/users/new-saas-admin"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <UserCreateRoute kind="saas-admin" onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/users/new-employee"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <UserCreateRoute kind="employee" onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route
        path="/masters/gst-configurer"
        element={
          session ? (
            <RequireAccess user={session.user}>
              <GstConfigurerRoute onLoggedOut={onLoggedOut} />
            </RequireAccess>
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to={session ? '/profile' : '/'} replace />} />
      </Routes>
    </>
  )
}

export default App
