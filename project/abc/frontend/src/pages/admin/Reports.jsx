import React from 'react';
import Layout from '../../components/shared/Layout';

export default function AdminReports() {
  const reports = [
    { id:1, name:'End of Semester Academic Report', date:'2024-01-10', type:'Academic' },
    { id:2, name:'Monthly Attendance Summary', date:'2024-01-01', type:'Attendance' },
    { id:3, name:'AI Risk Assessment Report', date:'2024-01-05', type:'AI Insights' },
    { id:4, name:'Teacher Performance Review', date:'2023-12-15', type:'Staff' },
  ];

  return (
    <Layout title="Academic Reports" subtitle="Generate and download institution reports">
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Available Reports</h2>
          <button className="btn btn-primary">➕ Generate New Report</button>
        </div>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Report Name</th><th>Type</th><th>Generated Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {reports.map(r=>(
                <tr key={r.id}>
                  <td><strong>{r.name}</strong></td>
                  <td><span className="badge badge-primary">{r.type}</span></td>
                  <td>{r.date}</td>
                  <td>
                    <button className="btn btn-ghost btn-sm">👁️ View</button>
                    <button className="btn btn-secondary btn-sm" style={{marginLeft:8}}>📥 Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
