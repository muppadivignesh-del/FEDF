import React, { useState } from 'react';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name||'', phone: user?.phone||'', address: user?.address||'' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirm:'' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      updateUser(form);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePw = async () => {
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword:'', newPassword:'', confirm:'' });
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to change password'); }
    finally { setChangingPw(false); }
  };

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()||'U';

  return (
    <Layout title="My Profile" subtitle="Manage your account details">
      <div style={{maxWidth:700,margin:'0 auto',display:'flex',flexDirection:'column',gap:24}}>
        {/* Avatar Card */}
        <div className="card" style={{display:'flex',alignItems:'center',gap:24}}>
          <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800,fontSize:28,flexShrink:0}}>
            {initials}
          </div>
          <div>
            <h2 style={{margin:0,marginBottom:4}}>{user?.name}</h2>
            <div style={{color:'var(--text-muted)',fontSize:14}}>{user?.email}</div>
            <span className={`badge ${user?.role==='admin'?'badge-danger':user?.role==='teacher'?'badge-warning':'badge-primary'}`} style={{marginTop:8}}>
              {user?.role?.charAt(0).toUpperCase()+user?.role?.slice(1)}
            </span>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="card">
          <div className="card-title mb-3">✏️ Edit Profile</div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-control" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
          <div className="form-group"><label className="form-label">Email</label><input className="form-control" value={user?.email} disabled style={{opacity:.6}}/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 9876543210"/></div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-control" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} placeholder="Your address"/></div>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving?'Saving...':'💾 Save Profile'}</button>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-title mb-3">🔐 Change Password</div>
          <div className="form-group"><label className="form-label">Current Password</label><input className="form-control" type="password" value={pwForm.currentPassword} onChange={e=>setPwForm({...pwForm,currentPassword:e.target.value})}/></div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">New Password</label><input className="form-control" type="password" value={pwForm.newPassword} onChange={e=>setPwForm({...pwForm,newPassword:e.target.value})}/></div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-control" type="password" value={pwForm.confirm} onChange={e=>setPwForm({...pwForm,confirm:e.target.value})}/></div>
          </div>
          <button className="btn btn-secondary" onClick={handlePw} disabled={changingPw}>{changingPw?'Changing...':'🔑 Change Password'}</button>
        </div>

        {/* Account Info */}
        <div className="card">
          <div className="card-title mb-3">ℹ️ Account Information</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              { label:'Account ID', value:`#${user?.id||'—'}` },
              { label:'Role', value:user?.role },
              { label:'Email', value:user?.email },
              { label:'Status', value:'Active' },
            ].map((r,i)=>(
              <div key={i} style={{padding:'12px 16px',background:'var(--bg-secondary)',borderRadius:'var(--radius-sm)'}}>
                <div style={{fontSize:11,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:.5}}>{r.label}</div>
                <div style={{fontSize:14,fontWeight:600,marginTop:4}}>{r.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
