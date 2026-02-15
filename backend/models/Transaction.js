const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User' // This links the transaction to a specific User
  },
  title: {
    type: String,
    required: [true, 'Please add a text title']
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount']
  },
  category: {
    type: String,
    required: [true, 'Please select a category']
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  notes: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);