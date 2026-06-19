import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { messageAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await messageAPI.getNotifications(); setItems(r.data.data || []); }
    catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const markAll = async () => {
    await messageAPI.markAllNotificationsRead().catch(()=>{});
    setItems(p=>p.map(n=>({...n,is_read:true})));
    toast.success('All marked as read');
  };

  const markOne = async (id) => {
    await messageAPI.markNotificationRead(id).catch(()=>{});
    setItems(p=>p.map(n=>n.id===id?{...n,is_read:true}:n));
  };

  const typeIcon = { info:'ℹ️', warning:'⚠️', success:'✅', error:'❌', ai_alert:'🤖' };
  const typeBg   = { info:'var(--info-soft)', warning:'var(--warning-soft)', success:'var(--success-soft)', error:'var(--danger-soft)', ai_alert:'var(--primary-soft)' };

  const unread = items.filter(n=>!n.is_read).length;

  return (
    <Layout title="Notifications" subtitle="Stay updated on all activity">
      <div className="page-header">
        <div><h2>Notifications</h2><p>{unread} unread notification{unread!==1?'s':''}</p></div>
        {unread > 0 && <button className="btn btn-secondary" onClick={markAll}>✅ Mark All Read</button>}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
        items.length === 0 ? (
          <div className="card text-center" style={{padding:'80px 40px'}}>
            <div style={{fontSize:64,marginBottom:16}}>🔔</div>
            <h3>You're all caught up!</h3>
            <p style={{color:'var(--text-muted)'}}>No notifications to display</p>
          </div>
        ) : (
          <div className="card" style={{padding:0}}>
            {items.map((n,i)=>(
              <div key={n.id} onClick={()=>!n.is_read&&markOne(n.id)}
                style={{display:'flex',gap:16,padding:'16px 20px',borderBottom:i<items.length-1?'1px solid var(--border)':'none',background:n.is_read?'transparent':typeBg[n.type]||'var(--primary-soft)',cursor:n.is_read?'default':'pointer',transition:'background .2s'}}>
                <div style={{fontSize:24,flexShrink:0}}>{typeIcon[n.type]||'🔔'}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                    <div style={{fontWeight:n.is_read?500:700,fontSize:14}}>{n.title}</div>
                    <div style={{fontSize:11,color:'var(--text-muted)',flexShrink:0,marginLeft:12}}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{fontSize:13,color:'var(--text-secondary)',marginTop:4}}>{n.message}</div>
                </div>
                {!n.is_read && <div style={{width:10,height:10,borderRadius:'50%',background:'var(--primary)',flexShrink:0,marginTop:4}}/>}
              </div>
            ))}
          </div>
        )
      }
    </Layout>
  );
}
