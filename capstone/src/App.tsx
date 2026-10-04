import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StoreProvider, useStore } from './lib/store';
import { Profile, Settings } from './pages/Account';
import { AddResult } from './pages/AddResult';
import { SignIn, SignUp, Welcome } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Documents } from './pages/Documents';
import { Goals } from './pages/Goals';
import { History } from './pages/History';
import { LabResults } from './pages/LabResults';
import { TestDetail } from './pages/TestDetail';
import { Trends } from './pages/Trends';

function RequireAuth() {
  const { email } = useStore();
  return email ? <Outlet /> : <Navigate to="/signin" replace />;
}

function GuestOnly() {
  const { email } = useStore();
  return email ? <Navigate to="/" replace /> : <Outlet />;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollTop />
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>
          <Route element={<RequireAuth />}>
            <Route path="/welcome" element={<Welcome />} />
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="labs" element={<LabResults />} />
              <Route path="labs/new" element={<AddResult key="new" />} />
              <Route path="labs/edit/:id" element={<AddResult key="edit" />} />
              <Route path="labs/test/:testId" element={<TestDetail />} />
              <Route path="trends" element={<Trends />} />
              <Route path="history" element={<History />} />
              <Route path="goals" element={<Goals />} />
              <Route path="documents" element={<Documents />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
