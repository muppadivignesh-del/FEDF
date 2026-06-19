import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { messageAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Messages() {
  const [inbox, setInbox] = useState([]);
  const [selected, setSelected] = useState(null);
  const [composing, setComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ to:'', subject:'', body:'' });
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('inbox');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await messageAPI.getInbox(); setInbox(r.data.data || []); }
    catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  const handleRead = async (msg) => {
    setSelected(msg);
    if (!msg.is_read) { await messageAPI.markRead(msg.id).catch(()=>{}); setInbox(p=>p.map(m=>m.id===msg.id?{...m,is_read:true}:m)); }
  };

  const handleSend = async () => {
    if (!form.body) return toast.error('Message body required');
    setSending(true);
    try { await messageAPI.sendMessage(form); toast.success('Message sent!'); setComposing(false); setForm({to:'',subject:'',body:''}); }
    catch { toast.error('Failed to send'); }
    finally { setSending(false); }
  };

  const unread = inbox.filter(m=>!m.is_read).length;

  return (
    <Layout title="Messages" subtitle="Inbox and communications">
      <div style={{display:'flex',gap:20,height:'calc(100vh - 200px)',minHeight:500}}>
        {/* Left Panel */}
        <div style={{width:320,display:'flex',flexDirection:'column',gap:12,flexShrink:0}}>
          <button className="btn btn-primary" style={{width:'100%',justifyContent:'center'}} onClick={()=>{setComposing(true);setSelected(null);}}>✏️ Compose Message</button>
          <div style={{display:'flex',gap:8}}>
            {['inbox','sent'].map(t=>(
              <button key={t} className={`btn ${tab===t?'btn-primary':'btn-ghost'} btn-sm`} style={{flex:1}} onClick={()=>setTab(t)}>
                {t==='inbox'?`📥 Inbox${unread>0?` (${unread})`:''}` : '📤 Sent'}
              </button>
            ))}
          </div>
          <div className="card" style={{flex:1,overflow:'auto',padding:0}}>
            {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
              inbox.length === 0 ? (
                <div className="empty-state" style={{padding:40}}>
                  <div className="empty-state-icon">💬</div>
                  <p>No messages yet</p>
                </div>
              ) : inbox.map(m=>(
                <div key={m.id} onClick={()=>handleRead(m)}
                  style={{padding:'14px 16px',borderBottom:'1px solid var(--border)',cursor:'pointer',background:selected?.id===m.id?'var(--primary-soft)':m.is_read?'transparent':'var(--warning-soft)',transition:'background .2s'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontWeight:m.is_read?500:700,fontSize:13}}>{m.sender_name||'System'}</span>
                    {!m.is_read && <span style={{width:8,height:8,borderRadius:'50%',background:'var(--primary)',display:'inline-block'}}/>}
                  </div>
                  <div style={{fontSize:13,fontWeight:m.is_read?400:600,marginTop:2,color:'var(--text)'}}>{m.subject||'(No subject)'}</div>
                  <div style={{fontSize:11,color:'var(--text-muted)',marginTop:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.body}</div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Right Panel */}
        <div className="card" style={{flex:1,overflow:'auto'}}>
          {composing ? (
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <h3 style={{margin:0}}>✏️ New Message</h3>
                <button className="btn btn-ghost btn-sm" onClick={()=>setComposing(false)}>✕ Cancel</button>
              </div>
              <div className="form-group"><label className="form-label">To (email)</label><input className="form-control" value={form.to} onChange={e=>setForm({...form,to:e.target.value})} placeholder="recipient@edu.com"/></div>
              <div className="form-group"><label className="form-label">Subject</label><input className="form-control" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})} placeholder="Subject..."/></div>
              <div className="form-group"><label className="form-label">Message</label><textarea className="form-control" rows={8} value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write your message here..."/></div>
              <button className="btn btn-primary" onClick={handleSend} disabled={sending}>{sending?'Sending...':'📤 Send Message'}</button>
            </div>
          ) : selected ? (
            <div>
              <h3 style={{marginBottom:8}}>{selected.subject||'(No subject)'}</h3>
              <div style={{display:'flex',gap:16,marginBottom:16,fontSize:13,color:'var(--text-muted)'}}>
                <span>From: <strong>{selected.sender_name}</strong></span>
                <span>{new Date(selected.created_at).toLocaleString()}</span>
              </div>
              <hr style={{borderColor:'var(--border)',margin:'12px 0'}}/>
              <p style={{lineHeight:1.8,fontSize:14}}>{selected.body}</p>
              <div style={{marginTop:24}}>
                <button className="btn btn-primary btn-sm" onClick={()=>{setComposing(true);setForm({to:selected.sender_email||'',subject:`Re: ${selected.subject||''}`,body:''});}}>↩️ Reply</button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{padding:80}}>
              <div className="empty-state-icon">📬</div>
              <h3>Select a message</h3>
              <p>Click on a message to read it or compose a new one</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
