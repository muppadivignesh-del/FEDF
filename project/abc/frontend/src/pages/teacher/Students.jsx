import React, { useState, useEffect } from 'react';
import Layout from '../../components/shared/Layout';
import { teacherAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getStudents()
      .then(r => setStudents(r.data.data || []))
      .catch(() => toast.error('Failed to load students'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="My Students" subtitle="Manage and view your class roster">
      <div className="card">
        <div className="card-header">
          <div><h2 className="card-title">Class Roster</h2><p className="card-subtitle">{students.length} students total</p></div>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner"/></div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Class</th>
                  <th>Email</th>
                  <th>Contact</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((s, i) => (
                  <tr key={i}>
                    <td><strong>{s.roll_number}</strong></td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#0ea5e9)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:13}}>
                          {s.name?.charAt(0)}
                        </div>
                        <strong>{s.name}</strong>
                      </div>
                    </td>
                    <td>{s.class} {s.section}</td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                  </tr>
                )) : <tr><td colSpan={5} className="text-center">No students assigned.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
