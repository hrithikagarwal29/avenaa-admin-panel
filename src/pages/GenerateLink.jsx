import React, { useState } from 'react';
import axios from 'axios';
import { Layout, API } from '../App';

export default function GenerateLink() {
  const [load,   setLoad]   = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoad(true); setResult(null);
    try {
      const { data } = await axios.post(`${API}/api/admin/generate-link`);
      setResult(data);
    } catch (e) { alert(e.response?.data?.error || 'Failed.'); }
    finally { setLoad(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.link);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Layout title="Generate Onboarding Link">
      <div style={{ maxWidth: 540 }}>
        <div className="card">
          <div className="card-title">Generate New Property Link</div>
          <div className="card-sub" style={{ marginBottom: 18 }}>
            Each property owner gets a unique secure link. Generate one per property and share via WhatsApp or message.
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={load} style={{ padding: '10px 22px' }}>
            {load ? <><div className="spin" />Generating...</> : '+ Generate New Link'}
          </button>
        </div>

        {result && (
          <div className="card" style={{ border: '2px solid #1a5e1f' }}>
            <div style={{ fontWeight: 700, color: '#1a1a2e', marginBottom: 12, fontSize: 14 }}>✓ Link Generated Successfully</div>
            <div style={{ background: '#f0fdf0', border: '1px solid #bbf7bb', borderRadius: 9, padding: '11px 13px', marginBottom: 14 }}>
              <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Owner's Onboarding Link</div>
              <div style={{ fontSize: 12, color: '#1a5e1f', wordBreak: 'break-all', fontFamily: 'monospace' }}>{result.link}</div>
            </div>
            <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={copy}>{copied ? '✓ Copied!' : '📋 Copy Link'}</button>
              <a href={result.whatsappUrl} target="_blank" rel="noreferrer" className="btn btn-wa btn-sm">💬 Share via WhatsApp</a>
            </div>
            <div style={{ marginTop: 14, padding: '9px 11px', background: '#fffbeb', borderRadius: 8, fontSize: 12, color: '#92400e' }}>
              <strong>Important:</strong> Share this link only with the intended property owner. Each link is unique to one property.
            </div>
          </div>
        )}

        <div className="card" style={{ background: '#f9fbf9' }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 9 }}>How it works</div>
          {[
            'Generate link → unique token created in the Supabase database',
            'Share via WhatsApp to the property owner',
            'Owner fills property details — photos, location, expected rent',
            'You review in Properties tab → set minimum rent, sales target, go-live date',
            'Owner completes KYC and draws signature on agreement',
            'Property fully onboarded — send login credentials via the credentials page',
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 9, marginBottom: 7, fontSize: 12, color: '#374151' }}>
              <span style={{ background: '#1a5e1f', color: '#fff', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
