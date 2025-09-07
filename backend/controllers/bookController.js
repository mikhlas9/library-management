const Book = require('../models/Book');
const User = require('../models/User');

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 12 } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (genre && genre !== 'All') {
      query.genre = genre;
    }

    const books = await Book.find(query)
      .populate('addedBy', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Book.countDocuments(query);

    console.log(`📚 Found ${books.length} books for query:`, { search, genre });

    res.json({
      success: true,
      books,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Get books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching books'
    });
  }
};

// @desc    Get user borrowed books
// @route   GET /api/books/my-books
// @access  Private
const getMyBooks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'borrowedBooks.book',
      select: 'title author genre publishedYear coverImage isbn description'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`📖 User ${user.name} has ${user.borrowedBooks.length} borrowed books`);

    res.json({
      success: true,
      borrowedBooks: user.borrowedBooks,
      totalBorrowed: user.borrowedBooks.length
    });
  } catch (error) {
    console.error('❌ Get my books error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching borrowed books'
    });
  }
};

// @desc    Borrow a book
// @route   POST /api/books/:id/borrow
// @access  Private
const borrowBook = async (req, res) => {
  try {
    console.log(`📋 Borrow request for book ID: ${req.params.id} by user: ${req.user.id}`);
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      console.log(`❌ Book not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    if (book.availableCopies <= 0) {
      console.log(`❌ No available copies for book: ${book.title}`);
      return res.status(400).json({
        success: false,
        message: 'Book not available'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if user already borrowed this book
    const alreadyBorrowed = user.borrowedBooks.some(
      borrowed => borrowed.book.toString() === book._id.toString()
    );

    if (alreadyBorrowed) {
      console.log(`❌ Book already borrowed by user: ${book.title}`);
      return res.status(400).json({
        success: false,
        message: 'You have already borrowed this book'
      });
    }

    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Add to user's borrowed books
    user.borrowedBooks.push({
      book: book._id,
      borrowDate: new Date(),
      dueDate
    });

    // Update book availability
    book.availableCopies -= 1;

    await Promise.all([user.save(), book.save()]);

    console.log(`✅ Book borrowed successfully: ${book.title} by ${user.name}`);

    res.json({
      success: true,
      message: 'Book borrowed successfully',
      data: {
        book: {
          id: book._id,
          title: book.title,
          author: book.author,
          dueDate
        }
      }
    });
  } catch (error) {
    console.error('❌ Borrow book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error borrowing book'
    });
  }
};

// @desc    Return a book
// @route   POST /api/books/:id/return
// @access  Private
const returnBook = async (req, res) => {
  try {
    console.log(`📤 Return request for book ID: ${req.params.id} by user: ${req.user.id}`);
    
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      console.log(`❌ Book not found: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Find the borrowed book record
    const borrowedIndex = user.borrowedBooks.findIndex(
      borrowed => borrowed.book.toString() === book._id.toString()
    );

    if (borrowedIndex === -1) {
      console.log(`❌ Book not borrowed by user: ${book.title}`);
      return res.status(400).json({
        success: false,
        message: 'Book not borrowed by you'
      });
    }

    // Remove from user's borrowed books
    user.borrowedBooks.splice(borrowedIndex, 1);
    
    // Update book availability
    book.availableCopies += 1;

    await Promise.all([user.save(), book.save()]);

    console.log(`✅ Book returned successfully: ${book.title} by ${user.name}`);

    res.json({
      success: true,
      message: 'Book returned successfully'
    });
  } catch (error) {
    console.error('❌ Return book error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error returning book'
    });
  }
};

// @desc    Add new book (Admin only)
// @route   POST /api/books
// @access  Private/Admin
const addBook = async (req, res) => {
  try {
    const bookData = {
      ...req.body,
      addedBy: req.user.id
    };

    // Check for duplicate ISBN
    const existingBook = await Book.findOne({ isbn: bookData.isbn });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }

    const book = await Book.create(bookData);
    
    console.log(`✅ New book added: ${book.title} by ${req.user.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: { book }
    });
  } catch (error) {
    console.error('❌ Add book error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Book with this ISBN already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error adding book'
    });
  }
};

// ✅ IMPORTANT: Export all functions AFTER they are defined
module.exports = {
  getBooks,
  getMyBooks,
  borrowBook,
  returnBook,
  addBook
};
