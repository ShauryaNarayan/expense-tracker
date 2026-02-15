const Transaction = require('../models/Transaction');

// @desc    Get transactions (with search, filter, and pagination for the Explorer)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, startDate, endDate } = req.query;
    
    // Build the query object starting with the logged-in user's ID
    const query = { user: req.user.id };

    // Search by title (case-insensitive)
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    // Filter by category
    if (category) {
      query.category = category;
    }
    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Execute query with pagination
    const transactions = await Transaction.find(query)
      .sort({ date: -1 }) // Newest first
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      totalTransactions: total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get Dashboard Summary (Total expenses, category breakdown, recent)
// @route   GET /api/transactions/summary
// @access  Private
const getDashboardSummary = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    // Calculate total expenses
    const totalExpenses = transactions.reduce((acc, curr) => acc + curr.amount, 0);

    // Calculate category breakdown
    const categoryBreakdown = transactions.reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {});

    // Get 5 most recent transactions
    const recentTransactions = await Transaction.find({ user: req.user.id })
      .sort({ date: -1 })
      .limit(5);

    res.json({
      totalExpenses,
      categoryBreakdown,
      recentTransactions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Add a new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res) => {
  try {
    const { title, amount, category, date, notes } = req.body;

    const transaction = await Transaction.create({
      user: req.user.id, // Attached by auth middleware
      title,
      amount,
      category,
      date,
      notes
    });

    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update a transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Make sure the logged-in user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this transaction' });
    }

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    res.json(updatedTransaction);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

    // Make sure the logged-in user owns this transaction
    if (transaction.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }

    await transaction.deleteOne();

    res.json({ message: 'Transaction removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  getTransactions,
  getDashboardSummary,
  addTransaction,
  updateTransaction,
  deleteTransaction
};