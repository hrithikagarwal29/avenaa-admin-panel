import React, { useState } from 'react';
import axios from 'axios';
import { Layout, API } from '../App';

export default function SendCredentials() {
  const [form, setForm] = useState({
    toEmail:  '',
    ownerName:'',
    username: '',
    password: '',
    loginUrl: 'https://avenaa.co.in/owner-login',
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const send = async () => {
    if (!form.toEmail || !form.ownerName || !form.username || !form.password) {
      setError('All fields are required.'); return;
    }
    setSending(true); setSuccess(''); setError('');
    try {
      await axios.post(`${API}/api/admin/send-credentials`, form);
      setSuccess(`✓ Login credentials sent to ${form.toEmail} successfully.`);
      setForm(f => ({ ...f, toEmail:'', ownerName:'', username:'', password:'' }));
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send email.');
    } finally { setSending(false); }
  };

  return (
    <Layout title="Send Login Credentials">
      <div style={{ maxWidth: 460 }}>
        <div className="card">
          <div className="card-title">Send Owner Login Credentials</div>
          <div className="card-sub" style={{ marginBottom: 16 }}>
            After a property is fully onboarded (stage 6), send the owner their login details for the Avenaa website.
          </div>

          {success && <div className="alert alert-ok">{success}</div>}
          {error   && <div className="alert alert-err">{error}</div>}

          <div className="fg">
            <label className="flabel">Owner Email *</label>
            <input type="email" placeholder="owner@email.com" value={form.toEmail} onChange={e => set('toEmail', e.target.value)} />
          </div>
          <div className="fg">
            <label className="flabel">Owner Full Name *</label>
            <input type="text" placeholder="Full name" value={form.ownerName} onChange={e => set('ownerName', e.target.value)} />
          </div>
          <div className="fg2">
            <div className="fg">
              <label className="flabel">Username *</label>
              <input type="text" placeholder="e.g. owner_ramesh" value={form.username} onChange={e => set('username', e.target.value)} />
            </div>
            <div className="fg">
              <label className="flabel">Temporary Password *</label>
              <input type="text" placeholder="Create a password" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
          </div>
          <div className="fg">
            <label className="flabel">Login URL</label>
            <input type="url" value={form.loginUrl} onChange={e => set('loginUrl', e.target.value)} />
          </div>

          <button
            className="btn btn-primary"
            onClick={send}
            disabled={sending}
            style={{ width: '100%', padding: 11, marginTop: 6, justifyContent: 'center' }}
          >
            {sending ? <><div className="spin" />Sending Email...</> : '✉ Send Credentials'}
          </button>
        </div>

        <div className="card" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
          <div style={{ fontSize: 12, color: '#92400e' }}>
            <strong>Reminder:</strong> First create the owner's account on your main Avenaa website (avenaa.co.in), then send the credentials from here. The owner will receive a welcome email from <strong>hrithikagarwal01@gmail.com</strong>.
          </div>
        </div>
      </div>
    </Layout>
  );
}
