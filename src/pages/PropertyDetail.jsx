import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, API } from '../App';

const SL = { 1:'Link Sent',2:'Under Review',3:'Offer Sent',4:'KYC Done',5:'Agreement Pending',6:'Onboarded' };
const SC = { 1:'b1',2:'b2',3:'b3',4:'b4',5:'b5',6:'b6' };

export default function PropertyDetail() {
  const { id } = useParams();
  const nav    = useNavigate();
  const [prop,     setProp]     = useState(null);
  const [load,     setLoad]     = useState(true);
  const [approving,setApproving] = useState(false);
  const [success,  setSuccess]  = useState('');
  const [error,    setError]    = useState('');
  const [form, setForm] = useState({ approved_rent:'', go_live_date:'', sales_target:'', admin_notes:'' });

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  const load_ = async () => {
    try {
      const { data } = await axios.get(`${API}/api/admin/properties/${id}`);
      setProp(data);
      if (data.approved_rent) setForm({
        approved_rent: data.approved_rent,
        go_live_date:  data.go_live_date?.split('T')[0] || '',
        sales_target:  data.sales_target || '',
        admin_notes:   data.admin_notes || '',
      });
    } catch { setError('Failed to load.'); }
    finally { setLoad(false); }
  };

  useEffect(() => { load_(); }, [id]);

  const approve = async () => {
    if (!form.approved_rent || !form.go_live_date) { setError('Approved rent and go-live date are required.'); return; }
    setApproving(true); setError(''); setSuccess('');
    try {
      await axios.post(`${API}/api/admin/properties/${id}/approve`, {
        approved_rent: parseInt(form.approved_rent),
        go_live_date:  form.go_live_date,
        sales_target:  parseInt(form.sales_target) || 0,
        admin_notes:   form.admin_notes,
      });
      setSuccess('✓ Property approved! Owner will now see the offer and Sales Target on their portal.');
      load_();
    } catch (e) { setError(e.response?.data?.error || 'Approval failed.'); }
    finally { setApproving(false); }
  };

  if (load) return <Layout title="Property Detail"><div style={{ textAlign:'center',padding:'40px 0',color:'#9ca3af' }}>Loading...</div></Layout>;
  if (!prop) return <Layout title="Property Detail"><div className="alert alert-err">Property not found.</div></Layout>;

  const R = ({l,v}) => (
    <div className="det-row"><span className="det-lbl">{l}</span><span className="det-val">{v||'—'}</span></div>
  );

  return (
    <Layout title="Property Detail">
      <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:18 }}>
        <button className="btn btn-outline btn-sm" onClick={()=>nav('/properties')}>← Back</button>
        <h2 style={{ fontSize:17,fontWeight:700 }}>{prop.property_name || 'Unnamed Property'}</h2>
        <span className={`badge ${SC[prop.stage]}`}>{SL[prop.stage]}</span>
      </div>

      {success && <div className="alert alert-ok">{success}</div>}
      {error   && <div className="alert alert-err">{error}</div>}

      <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14 }}>

        {/* LEFT */}
        <div>
          <div className="card">
            <div className="card-title" style={{ marginBottom:12 }}>Property Information</div>
            <R l="Name"          v={prop.property_name}/>
            <R l="Type"          v={prop.property_type}/>
            <R l="City"          v={prop.city}/>
            <R l="Address"       v={prop.address}/>
            <R l="Area"          v={prop.area_sqft ? `${prop.area_sqft} sq. ft.` : null}/>
            <R l="Expected Rent" v={prop.expected_rent ? `₹${Number(prop.expected_rent).toLocaleString('en-IN')}/mo` : null}/>
            <R l="Amenities"     v={(prop.amenities||[]).join(', ')}/>
            <R l="Submitted"     v={prop.created_at ? new Date(prop.created_at).toLocaleString('en-IN') : null}/>
          </div>

          {prop.photos?.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom:10 }}>Property Photos</div>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8 }}>
                {prop.photos.map((url,i) => (
                  <a key={i} href={url} target="_blank" rel="noreferrer">
                    <img src={url} alt="" style={{ width:76,height:76,objectFit:'cover',borderRadius:7,border:'1px solid #e5e7eb' }}/>
                  </a>
                ))}
              </div>
            </div>
          )}

          {prop.stage >= 4 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom:12 }}>KYC Documents</div>
              <R l="Owner Name"  v={prop.owner_name}/>
              <R l="Phone"       v={prop.owner_phone}/>
              <R l="Email"       v={prop.owner_email}/>
              <R l="Bank"        v={prop.bank_name}/>
              <R l="IFSC"        v={prop.bank_ifsc}/>
              <R l="Account"     v={prop.bank_account_no ? `****${prop.bank_account_no.slice(-4)}` : null}/>
              <div style={{ display:'flex',flexWrap:'wrap',marginTop:10 }}>
                {[
                  [prop.aadhaar_front_url,'Aadhaar Front'],
                  [prop.aadhaar_back_url,'Aadhaar Back'],
                  [prop.pan_url,'PAN Card'],
                  [prop.property_doc_url,'Property Doc'],
                  [prop.noc_doc_url,'NOC'],
                ].filter(([u])=>u).map(([url,l]) => (
                  <a key={l} href={url} target="_blank" rel="noreferrer" className="doc-link">📄 {l}</a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div>
          {prop.stage >= 2 && prop.stage < 6 && (
            <div className="card" style={{ border: prop.stage===2 ? '2px solid #1a5e1f' : '1px solid #e0ede0', marginBottom:14 }}>
              <div className="card-title" style={{ marginBottom:3 }}>
                {prop.stage === 2 ? '🔔 Action Required — Set Approved Terms' : 'Approved Terms'}
              </div>
              <div className="card-sub" style={{ marginBottom:14 }}>
                {prop.stage === 2
                  ? 'Review property details, then set the approved minimum rent, sales target, and go-live date below. Sales target is visible to the owner after approval.'
                  : 'These values were sent to the owner.'}
              </div>

              <div className="fg2">
                <div className="fg">
                  <label className="flabel">Minimum Rent (₹/month) *</label>
                  <input type="number" placeholder="e.g. 45000" value={form.approved_rent} onChange={e=>setF('approved_rent',e.target.value)} disabled={prop.stage>3}/>
                </div>
                <div className="fg">
                  <label className="flabel">Go-Live Date *</label>
                  <input type="date" value={form.go_live_date} onChange={e=>setF('go_live_date',e.target.value)} disabled={prop.stage>3}/>
                </div>
                <div className="fg" style={{ gridColumn:'1/-1' }}>
                  <label className="flabel">Sales Target (₹/month)</label>
                  <input type="number" placeholder="e.g. 90000" value={form.sales_target} onChange={e=>setF('sales_target',e.target.value)} disabled={prop.stage>3}/>
                  <span style={{ fontSize:11,color:'#9ca3af',marginTop:2 }}>If sales target is achieved, owner receives 60% of net revenue. Shown to owner after approval.</span>
                </div>
                <div className="fg" style={{ gridColumn:'1/-1' }}>
                  <label className="flabel">Note to Owner (optional)</label>
                  <textarea rows={2} placeholder="Any message for the owner..." value={form.admin_notes} onChange={e=>setF('admin_notes',e.target.value)} disabled={prop.stage>3}/>
                </div>
              </div>

              {prop.stage === 2 && (
                <button className="btn btn-success" onClick={approve} disabled={approving} style={{ width:'100%',padding:11,marginTop:4,justifyContent:'center' }}>
                  {approving ? <><div className="spin"/>Approving...</> : '✓ Approve & Send Offer to Owner'}
                </button>
              )}
              {prop.stage > 2 && (
                <div style={{ padding:'8px 11px',background:'#d1fae5',borderRadius:8,fontSize:12,color:'#065f46',marginTop:8 }}>
                  ✓ Approved on {prop.approved_at ? new Date(prop.approved_at).toLocaleDateString('en-IN') : '—'}
                </div>
              )}
            </div>
          )}

          {prop.stage >= 5 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom:12 }}>Agreement Details</div>
              <R l="Full Name"        v={prop.agreement_full_name}/>
              <R l="DOB"              v={prop.agreement_dob}/>
              <R l="PAN"              v={prop.pan_number}/>
              <R l="Aadhaar (last 4)" v={prop.aadhaar_last4 ? `XXXX-XXXX-${prop.aadhaar_last4}` : null}/>
              <R l="Signed At"        v={prop.signed_at ? new Date(prop.signed_at).toLocaleString('en-IN') : 'Not signed yet'}/>
              {prop.agreement_pdf_url && (
                <a href={prop.agreement_pdf_url} download="avenaa_agreement.pdf" className="doc-link" style={{ marginTop:12,display:'inline-flex' }}>
                  📄 Download Signed Agreement PDF
                </a>
              )}
            </div>
          )}

          {prop.stage === 6 && (
            <div className="card" style={{ border:'2px solid #059669' }}>
              <div style={{ fontSize:15,fontWeight:700,color:'#065f46',marginBottom:5 }}>✅ Fully Onboarded</div>
              <div style={{ fontSize:12,color:'#6b7280',marginBottom:12 }}>Agreement signed. Send login credentials to the owner now.</div>
              <button className="btn btn-primary btn-sm" onClick={()=>nav('/credentials')}>Send Login Credentials →</button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
