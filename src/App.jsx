import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import Login          from './pages/Login';
import Dashboard      from './pages/Dashboard';
import Properties     from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import GenerateLink    from './pages/GenerateLink';
import SendCredentials  from './pages/SendCredentials';

export const API = process.env.REACT_APP_API_URL || '';
export const AuthCtx = createContext(null);

function Guard({ children }) {
  const { admin } = useContext(AuthCtx);
  return admin ? children : <Navigate to="/login" replace />;
}

export function Sidebar() {
  const { admin, logout } = useContext(AuthCtx);
  const loc = useLocation();
  const items = [
    { to:'/dashboard',     icon:'▦', label:'Dashboard'       },
    { to:'/properties',    icon:'🏠', label:'Properties'      },
    { to:'/generate-link', icon:'🔗', label:'Generate Link'   },
    { to:'/credentials',   icon:'✉',  label:'Send Credentials'},
  ];
  return (
    <div className="sidebar">
      <div className="sb-logo">
        <img src="/logo.png" alt="Avenaa" className="sb-logo-img" onError={e=>e.target.style.display='none'}/>
        <div className="sb-logo-name">avenaa</div>
        <div className="sb-logo-sub">Admin Panel</div>
      </div>
      <nav className="sb-nav">
        {items.map(it => (
          <Link key={it.to} to={it.to} className={`nav-item ${loc.pathname.startsWith(it.to) ? 'active' : ''}`}>
            <span style={{ fontSize:14 }}>{it.icon}</span>{it.label}
          </Link>
        ))}
      </nav>
      <div className="sb-footer">
        <strong>{admin?.name}</strong>
        <div>{admin?.email}</div>
        <div className="sb-signout" onClick={logout}>Sign out</div>
      </div>
    </div>
  );
}

export function Layout({ title, children }) {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{title}</div>
          <div style={{ fontSize:11,color:'#9ca3af' }}>Brise Hospitality Management (OPC) Pvt Ltd</div>
        </div>
        <div className="page">{children}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [admin, setAdmin] = useState(() => { try { return JSON.parse(localStorage.getItem('av_admin')); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem('av_token') || '');

  useEffect(() => { if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`; }, [token]);

  const login = (a, t) => {
    setAdmin(a); setToken(t);
    localStorage.setItem('av_admin', JSON.stringify(a));
    localStorage.setItem('av_token', t);
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  };
  const logout = () => {
    setAdmin(null); setToken('');
    localStorage.removeItem('av_admin'); localStorage.removeItem('av_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthCtx.Provider value={{ admin, token, login, logout }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login"          element={<Login />} />
          <Route path="/dashboard"      element={<Guard><Dashboard /></Guard>} />
          <Route path="/properties"     element={<Guard><Properties /></Guard>} />
          <Route path="/properties/:id" element={<Guard><PropertyDetail /></Guard>} />
          <Route path="/generate-link"  element={<Guard><GenerateLink /></Guard>} />
          <Route path="/credentials"    element={<Guard><SendCredentials /></Guard>} />
          <Route path="*"               element={<Navigate to={admin ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthCtx.Provider>
  );
}
