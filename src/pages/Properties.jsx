import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Layout, API } from '../App';

const SL = { 1:'Link Sent',2:'Under Review',3:'Offer Sent',4:'KYC Done',5:'Agreement Pending',6:'Onboarded' };
const SC = { 1:'b1',2:'b2',3:'b3',4:'b4',5:'b5',6:'b6' };

export default function Properties() {
  const [props, setProps] = useState([]);
  const [load,  setLoad]  = useState(true);
  const [filter,setFilter] = useState('all');
  const nav = useNavigate();

  const load_ = async (stage) => {
    setLoad(true);
    try {
      const url = stage === 'all' ? `${API}/api/admin/properties` : `${API}/api/admin/properties?stage=${stage}`;
      const { data } = await axios.get(url);
      setProps(data.properties || []);
    } catch (e) { console.error(e); }
    finally { setLoad(false); }
  };

  useEffect(() => { load_(filter); }, [filter]);

  return (
    <Layout title="Properties">
      <div style={{ display:'flex',gap:7,marginBottom:18,flexWrap:'wrap' }}>
        {[['all','All'],['2','Under Review'],['3','Offer Sent'],['4','KYC Done'],['5','Agreement'],['6','Onboarded']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm ${filter===v?'btn-primary':'btn-outline'}`} onClick={()=>setFilter(v)}>{l}</button>
        ))}
      </div>
      <div className="card" style={{ padding:0 }}>
        {load ? (
          <div style={{ textAlign:'center',padding:'40px 0',color:'#9ca3af' }}>Loading...</div>
        ) : props.length === 0 ? (
          <div style={{ textAlign:'center',padding:'40px 0',color:'#9ca3af',fontSize:13 }}>No properties in this stage.</div>
        ) : (
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Property</th><th>Owner</th><th>City</th><th>Expected</th><th>Approved</th><th>Sales Target</th><th>Stage</th><th>Date</th></tr></thead>
              <tbody>
                {props.map(p => (
                  <tr key={p.id} onClick={()=>nav(`/properties/${p.id}`)}>
                    <td style={{ fontWeight:600 }}>{p.property_name || <span style={{ color:'#9ca3af',fontWeight:400 }}>—</span>}</td>
                    <td>{p.owner_name || '—'}</td>
                    <td>{p.city || '—'}</td>
                    <td>{p.expected_rent ? `₹${Number(p.expected_rent).toLocaleString('en-IN')}` : '—'}</td>
                    <td style={{ color:'#1a5e1f',fontWeight:700 }}>{p.approved_rent ? `₹${Number(p.approved_rent).toLocaleString('en-IN')}` : '—'}</td>
                    <td style={{ color:'#374151' }}>{p.sales_target ? `₹${Number(p.sales_target).toLocaleString('en-IN')}` : '—'}</td>
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
