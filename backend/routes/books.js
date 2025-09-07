const express = require('express');
const { getBooks, getMyBooks, borrowBook, returnBook, addBook } = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getBooks);
router.get('/my-books', protect, getMyBooks); // New route for user's borrowed books
router.post('/', protect, authorize('Admin'), addBook);
router.post('/:id/borrow', protect, borrowBook);
router.post('/:id/return', protect, returnBook);

module.exports = router;
