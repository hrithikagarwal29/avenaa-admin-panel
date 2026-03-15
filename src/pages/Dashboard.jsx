import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Layout, API } from '../App';

const SL = { 1:'Link Sent',2:'Under Review',3:'Offer Sent',4:'KYC Done',5:'Agreement Pending',6:'Onboarded' };
const SC = { 1:'b1',2:'b2',3:'b3',4:'b4',5:'b5',6:'b6' };

export default function Dashboard() {
  const [props, setProps] = useState([]);
  const [load,  setLoad]  = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    axios.get(`${API}/api/admin/properties?limit=50`)
      .then(({ data }) => setProps(data.properties || []))
      .catch(console.error)
      .finally(() => setLoad(false));
  }, []);

  const count = s => props.filter(p => p.stage === s).length;

  return (
    <Layout title="Dashboard">
      <div className="stat-grid">
        {[
          { label:'Total Properties', val: props.length, sub:'All time' },
          { label:'Under Review',     val: count(2),     sub:'Need your action' },
          { label:'Offer Sent',       val: count(3),     sub:'Owner reviewing' },
          { label:'Onboarded',        val: count(6),     sub:'Fully complete' },
        ].map(s => (
          <div key={s.label} className="stat">
            <div className="stat-lbl">{s.label}</div>
            <div className="stat-val">{load ? '—' : s.val}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding:0 }}>
        <div style={{ padding:'16px 20px 12px',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
          <div><div className="card-title">Recent Submissions</div><div className="card-sub">Latest property onboarding requests</div></div>
          <button className="btn btn-outline btn-sm" onClick={()=>nav('/properties')}>View All</button>
        </div>
        {load ? (
          <div style={{ textAlign:'center',padding:'32px 0',color:'#9ca3af' }}>Loading...</div>
        ) : props.length === 0 ? (
          <div style={{ textAlign:'center',padding:'32px 0',color:'#9ca3af',fontSize:13 }}>No submissions yet. Generate a link to get started.</div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Property</th><th>City</th><th>Expected Rent</th><th>Stage</th><th>Date</th></tr></thead>
              <tbody>
                {props.slice(0,8).map(p => (
                  <tr key={p.id} onClick={()=>nav(`/properties/${p.id}`)}>
                    <td style={{ fontWeight:600 }}>{p.property_name || <span style={{ color:'#9ca3af',fontWeight:400 }}>Not submitted yet</span>}</td>
                    <td>{p.city || '—'}</td>
                    <td>{p.expected_rent ? `₹${Number(p.expected_rent).toLocaleString('en-IN')}` : '—'}</td>
                    <td><span className={`badge ${SC[p.stage]}`}>{SL[p.stage]}</span></td>
                    <td style={{ color:'#9ca3af',fontSize:12 }}>{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
