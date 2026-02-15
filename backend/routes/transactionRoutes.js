const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getDashboardSummary,
  addTransaction,
  updateTransaction,
  deleteTransaction
} = require('../controllers/transactionController');

const { protect } = require('../middleware/authMiddleware');

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Routes mapping
router.route('/')
  .get(getTransactions)
  .post(addTransaction);

router.route('/summary')
  .get(getDashboardSummary);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;