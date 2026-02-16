import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './DashboardStyles.css'; // Injecting the Midnight Glassmorphism design!

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const history = useHistory();
  
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ title: '', amount: '', category: 'Food', notes: '' });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/transactions/summary`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSummaryData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Dashboard data failed to load:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.token) fetchSummary();
  }, [user]);

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/transactions/${editingId}`, formData, { headers: { Authorization: `Bearer ${user.token}` }});
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/transactions`, formData, { headers: { Authorization: `Bearer ${user.token}` }});
      }
      setFormData({ title: '', amount: '', category: 'Food', notes: '' });
      setEditingId(null);
      await fetchSummary();
    } catch (err) {
      console.error("Failed to save transaction:", err);
      alert('Error saving transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({ title: transaction.title, amount: transaction.amount, category: transaction.category, notes: transaction.notes || '' });
    setEditingId(transaction._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/transactions/${id}`, { headers: { Authorization: `Bearer ${user.token}` }});
      await fetchSummary();
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      alert('Error deleting transaction.');
    }
  };

  const getBadgeClass = (category) => `badge badge-${category.toLowerCase()}`;

  const chartData = summaryData?.categoryBreakdown 
    ? Object.entries(summaryData.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  // Cyberpunk/Neon Colors for the Midnight Theme Chart
  const COLORS = ['#38bdf8', '#4ade80', '#c084fc', '#fb923c', '#f472b6', '#94a3b8'];

  if (loading) return <div className="app-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}><h2 className="page-title">Loading...</h2></div>;

  return (
    <div className="app-container">
      <div className="content-wrapper">

        {/* Navigation */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <p style={{ color: '#94a3b8', margin: '0 0 5px 0', fontWeight: '500' }}>Overview</p>
            <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]} 👋</h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn btn-secondary" onClick={() => history.push('/explorer')}>
              <span style={{ fontSize: '1.2rem' }}>📊</span> Explorer
            </button>
            <button className="btn btn-danger-outline" onClick={() => { logout(); history.push('/login'); }}>
              Logout
            </button>
          </div>
        </header>

        {/* Top Metrics Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '30px' }}>
          <div className="bento-card">
            <h3 className="section-title">Total Spent</h3>
            <div className="metric-amount">${summaryData?.totalExpenses?.toFixed(2) || '0.00'}</div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>All time expenses</p>
          </div>

          <div className="bento-card">
            <h3 className="section-title">Spending by Category</h3>
            {chartData.length === 0 ? (
               <p style={{ color: '#94a3b8', marginTop: '15px' }}>No data yet. Add expenses to see your chart!</p>
            ) : (
              <div style={{ height: '220px', width: '100%', marginTop: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `$${value.toFixed(2)}`}
                      contentStyle={{ backgroundColor: '#1e293b', color: '#f8fafc', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
                      itemStyle={{ color: '#e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            
            {/* Custom Legend for Dark Mode */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px', justifyContent: 'center' }}>
               {chartData.map((entry, index) => (
                 <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: '500' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                   {entry.name}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
          
          {/* Left: The Form */}
          <div className="bento-card" style={{ height: 'fit-content' }}>
            <h3 className="section-title">{editingId ? '✏️ Edit Transaction' : '➕ Add Transaction'}</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label className="modern-label">Title</label>
                <input type="text" name="title" className="modern-input" value={formData.title} onChange={handleInputChange} required placeholder="e.g. Spotify Premium" />
              </div>
              <div>
                <label className="modern-label">Amount ($)</label>
                <input type="number" name="amount" className="modern-input" value={formData.amount} onChange={handleInputChange} required min="0" step="0.01" placeholder="0.00" />
              </div>
              <div>
                <label className="modern-label">Category</label>
                <select name="category" className="modern-input" value={formData.category} onChange={handleInputChange}>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="modern-label">Notes</label>
                <textarea name="notes" className="modern-input" value={formData.notes} onChange={handleInputChange} rows="2" placeholder="Optional details..."></textarea>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Save Expense')}
                </button>
                {editingId && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingId(null); setFormData({ title: '', amount: '', category: 'Food', notes: '' }); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right: Recent Transactions */}
          <div className="bento-card">
            <h3 className="section-title">Recent Activity</h3>
            {summaryData?.recentTransactions?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧾</div>
                <p>No transactions yet. Add one to get started!</p>
              </div>
            ) : (
              <div>
                {summaryData?.recentTransactions?.map(transaction => (
                  <div key={transaction._id} className="transaction-item">
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '1.05rem', color: '#f8fafc', marginBottom: '6px' }}>{transaction.title}</strong>
                      <span className={getBadgeClass(transaction.category)}>{transaction.category}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span className="expense-amount">-${transaction.amount.toFixed(2)}</span>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button onClick={() => handleEdit(transaction)} className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Edit</button>
                        <button onClick={() => handleDelete(transaction._id)} className="btn btn-danger-outline" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>Del</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;