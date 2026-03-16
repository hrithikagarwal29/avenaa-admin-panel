import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthCtx } from '../App';

// Uses Supabase Edge Function for login — bypasses Railway completely
const SUPABASE_URL = 'https://gvmynnufzofwvvgwsekg.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd2bXlubnVmem9md3Z2Z3dzZWtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2MDY4MjUsImV4cCI6MjA4OTE4MjgyNX0.jwLtjOqOwEfhaAgXaGX7O63VL3cVPZNpN-pbKZ1AOS8';

export default function Login() {
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [err,   setErr]   = useState('');
  const [load,  setLoad]  = useState(false);
  const { login } = useContext(AuthCtx);
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(''); setLoad(true);
    try {
      const { data } = await axios.post(
        `${SUPABASE_URL}/functions/v1/admin-auth`,
        { email, password: pass },
        { headers: { 'apikey': SUPABASE_ANON, 'Content-Type': 'application/json' } }
      );
      if (data.error) throw new Error(data.error);
      login(data.admin, data.token);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.error || e.message || 'Login failed.');
    } finally { setLoad(false); }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <img src="/logo.png" alt="Avenaa" style={{ height:40,background:'#000',borderRadius:8,padding:'3px 10px',marginBottom:10 }} onError={e=>e.target.style.display='none'}/>
          <div style={{ fontSize:20,fontWeight:700,color:'#1a5e1f' }}>avenaa</div>
          <div style={{ fontSize:12,color:'#6b7280',marginTop:3 }}>Internal Admin Panel</div>
        </div>
        {err && <div className="alert alert-err">{err}</div>}
        <form onSubmit={submit}>
          <div className="fg">
            <label className="flabel">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@avenaa.co.in" required autoFocus/>
          </div>
          <div className="fg">
            <label className="flabel">Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" required/>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width:'100%',padding:11,marginTop:6,justifyContent:'center' }} disabled={load}>
            {load ? <><div className="spin"/>Signing in...</> : 'Sign In'}
          </button>
        </form>
        <p style={{ marginTop:18,fontSize:11,color:'#9ca3af',textAlign:'center' }}>Authorised Avenaa team members only.</p>
      </div>
    </div>
  );
}
