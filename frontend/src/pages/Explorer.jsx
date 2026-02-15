import { useState, useEffect, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import './DashboardStyles.css'; 

// Helper function to safely load saved state from the browser's memory
const loadSavedState = (key, defaultValue) => {
  const saved = sessionStorage.getItem(key);
  return saved !== null ? saved : defaultValue;
};

const Explorer = () => {
  const { user, logout } = useContext(AuthContext);
  const history = useHistory();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- UPGRADED: State initialized from Session Storage ---
  const [currentPage, setCurrentPage] = useState(() => Number(loadSavedState('exp_page', 1)));
  const [totalPages, setTotalPages] = useState(1);

  const [searchTerm, setSearchTerm] = useState(() => loadSavedState('exp_search', ''));
  const [filterCategory, setFilterCategory] = useState(() => loadSavedState('exp_category', 'All'));
  const [minAmount, setMinAmount] = useState(() => loadSavedState('exp_min', ''));
  const [maxAmount, setMaxAmount] = useState(() => loadSavedState('exp_max', ''));
  const [startDate, setStartDate] = useState(() => loadSavedState('exp_start', ''));
  const [endDate, setEndDate] = useState(() => loadSavedState('exp_end', ''));

  // --- NEW: Save filters to Session Storage whenever they change ---
  useEffect(() => {
    sessionStorage.setItem('exp_page', currentPage);
    sessionStorage.setItem('exp_search', searchTerm);
    sessionStorage.setItem('exp_category', filterCategory);
    sessionStorage.setItem('exp_min', minAmount);
    sessionStorage.setItem('exp_max', maxAmount);
    sessionStorage.setItem('exp_start', startDate);
    sessionStorage.setItem('exp_end', endDate);
  }, [currentPage, searchTerm, filterCategory, minAmount, maxAmount, startDate, endDate]);

  // --- NEW: Save and Restore Scroll Position ---
  useEffect(() => {
    // Save scroll position dynamically as the user scrolls
    const handleScroll = () => sessionStorage.setItem('exp_scroll', window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Restore scroll position after the data has finished loading
    if (!loading) {
      const savedScroll = sessionStorage.getItem('exp_scroll');
      if (savedScroll) {
        window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'smooth' });
      }
    }
  }, [loading]);

  // Data Fetching
  useEffect(() => {
    let isMounted = true; 

    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/transactions?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        
        if (isMounted) {
          setTransactions(response.data.transactions || []);
          setTotalPages(response.data.totalPages || 1);
          setCurrentPage(response.data.currentPage || 1);
          setLoading(false); 
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load explorer data:", err);
          setLoading(false);
        }
      }
    };

    if (user && user.token) fetchTransactions();

    return () => { isMounted = false; };
  }, [user, currentPage]);

  const highlightMatch = (text, highlight) => {
    if (!highlight || !text) return text;
    const parts = text.toString().split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, index) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} style={{ backgroundColor: '#fef08a', color: '#854d0e', padding: '0 2px', borderRadius: '4px', fontWeight: 'bold' }}>{part}</span>
          ) : ( <span key={index}>{part}</span> )
        )}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'All' || t.category === filterCategory;
    
    const amt = parseFloat(t.amount);
    const matchesMin = minAmount === '' || amt >= parseFloat(minAmount);
    const matchesMax = maxAmount === '' || amt <= parseFloat(maxAmount);

    const tDate = new Date(t.date || t.createdAt);
    const matchesStart = startDate === '' || tDate >= new Date(startDate);
    const end = endDate ? new Date(endDate) : null;
    if (end) end.setDate(end.getDate() + 1); 
    const matchesEnd = endDate === '' || tDate <= end;

    return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesStart && matchesEnd;
  });

  const getBadgeClass = (category) => `badge badge-${category.toLowerCase()}`;

  const clearFilters = () => {
    setSearchTerm(''); setFilterCategory('All'); setMinAmount(''); setMaxAmount(''); setStartDate(''); setEndDate(''); setCurrentPage(1);
    sessionStorage.removeItem('exp_scroll'); // Clear scroll memory on reset
  };

  return (
    <div className="app-container">
      <div className="content-wrapper">
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <p style={{ color: '#64748b', margin: '0 0 5px 0', fontWeight: '500' }}>Deep Dive</p>
            <h1 className="page-title">Transaction Explorer</h1>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button className="btn btn-secondary" onClick={() => history.push('/dashboard')}>
              ← Back to Dashboard
            </button>
            <button className="btn btn-danger-outline" onClick={() => { logout(); history.push('/login'); }}>
              Logout
            </button>
          </div>
        </header>

        <div className="bento-card" style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Advanced Filters</h3>
            <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>Clear All</button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '2 1 300px' }}>
                <label className="modern-label">Search</label>
                <input type="text" className="modern-input" placeholder="Search title or notes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label className="modern-label">Category</label>
                <select className="modern-input" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="All">All Categories</option>
                  <option value="Food">Food</option>
                  <option value="Transport">Transport</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="modern-label">Min Amount ($)</label>
              <input type="number" className="modern-input" placeholder="0.00" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
            </div>
            <div>
              <label className="modern-label">Max Amount ($)</label>
              <input type="number" className="modern-input" placeholder="1000.00" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
            </div>
            <div>
              <label className="modern-label">From Date</label>
              <input type="date" className="modern-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="modern-label">To Date</label>
              <input type="date" className="modern-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="bento-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '10px' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Results</h3>
            <span style={{ color: '#64748b', fontWeight: '500', fontSize: '0.9rem' }}>{filteredTransactions.length} found on this page</span>
          </div>

          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Fetching records...</div>
          ) : filteredTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔍</div>
              <p>No transactions match your search criteria.</p>
            </div>
          ) : (
            <div>
              {filteredTransactions.map(transaction => (
                <div key={transaction._id} className="transaction-item" style={{ padding: '20px 10px' }}>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', fontSize: '1.1rem', color: '#0f172a', marginBottom: '8px' }}>
                      {highlightMatch(transaction.title, searchTerm)}
                    </strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={getBadgeClass(transaction.category)}>{transaction.category}</span>
                      {transaction.notes && (
                        <span style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic' }}>"{highlightMatch(transaction.notes, searchTerm)}"</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="expense-amount" style={{ fontSize: '1.4rem' }}>-${transaction.amount.toFixed(2)}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '6px' }}>
                      {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous Page
            </button>
            
            <span style={{ fontWeight: '600', color: '#475569' }}>
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>
            
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              style={{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
            >
              Next Page
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Explorer;