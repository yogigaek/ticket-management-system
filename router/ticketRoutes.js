const router = require('express').Router()
const authMiddleware = require('../middleware/authTicket');
const ticketController = require('../controller/ticketController');

// Mendapatkan semua tiket tergantung role
router.get('/ticket', authMiddleware,  ticketController.getAllTickets);

// Membuat tiket baru
router.post('/ticket', authMiddleware, ticketController.createTicket);

// Menghapus tiket berdasarkan ID
router.post('/ticket/:id', authMiddleware, ticketController.deleteTicket);

module.exports = router;
