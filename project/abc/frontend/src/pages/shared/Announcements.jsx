import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import Modal from '../../components/shared/Modal';
import { messageAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Announcements() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title:'', content:'', target_role:'all' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await messageAPI.getAnnouncements(); setItems(r.data.data || []); }
    catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required');
    setSaving(true);
    try {
      const r = await messageAPI.createAnnouncement(form);
      setItems(p=>[{...form,id:Date.now(),created_at:new Date().toISOString()},...p]);
      setShowModal(false); setForm({title:'',content:'',target_role:'all'});
      toast.success('Announcement posted!');
    } catch { toast.error('Failed to post'); }
    finally { setSaving(false); }
  };

  const targetLabel = { all:'Everyone', student:'Students Only', teacher:'Teachers Only' };
  const targetColor = { all:'badge-primary', student:'badge-success', teacher:'badge-warning' };

  return (
    <Layout title="Announcements" subtitle="Campus-wide communications">
      <div className="page-header">
        <div><h2>Announcements</h2><p>{items.length} announcements</p></div>
        {(user?.role === 'admin' || user?.role === 'teacher') && (
          <button className="btn btn-primary" onClick={()=>setShowModal(true)}>📢 New Announcement</button>
        )}
      </div>

      {loading ? <div className="loading-spinner"><div className="spinner"/></div> :
        items.length === 0 ? (
          <div className="card text-center" style={{padding:'80px 40px'}}>
            <div style={{fontSize:64,marginBottom:16}}>📢</div>
            <h3>No Announcements</h3>
            <p style={{color:'var(--text-muted)'}}>No announcements have been posted yet</p>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            {items.map((a,i)=>(
              <div key={i} className="card" style={{borderLeft:'4px solid var(--primary)'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <h3 style={{margin:0,fontSize:16}}>{a.title}</h3>
                  <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                    <span className={`badge ${targetColor[a.target_role]||'badge-primary'}`}>{targetLabel[a.target_role]||'Everyone'}</span>
                    <span style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(a.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <p style={{margin:0,fontSize:14,color:'var(--text-secondary)',lineHeight:1.7}}>{a.content}</p>
              </div>
            ))}
          </div>
        )
      }

      <Modal isOpen={showModal} onClose={()=>setShowModal(false)} title="Post Announcement"
        footer={<><button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button><button className="btn btn-primary" onClick={handleCreate} disabled={saving}>{saving?'Posting...':'📢 Post'}</button></>}>
        <div className="form-group"><label className="form-label">Title *</label><input className="form-control" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Announcement title..."/></div>
        <div className="form-group"><label className="form-label">Content *</label><textarea className="form-control" rows={5} value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Write your announcement..."/></div>
        <div className="form-group"><label className="form-label">Target Audience</label>
          <select className="form-control form-select" value={form.target_role} onChange={e=>setForm({...form,target_role:e.target.value})}>
            <option value="all">Everyone</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teachers Only</option>
          </select>
        </div>
      </Modal>
    </Layout>
  );
}
