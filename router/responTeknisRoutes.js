const router = require('express').Router()
const authMiddleware = require('../middleware/authTicket');
const { updateTicketsByTechnicalTeam } = require('../controller/responTeknisController');
const responTeknis = require('../controller/responTeknisController')

router.put('/responTeknis/:id', authMiddleware, async (req, res) => {
    try {
        const { status, respons } = req.body;
        const result = await updateTicketsByTechnicalTeam(req, res, status, respons);
        return res.status(200).json(result);
    } catch (err) {
        return res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
    }
});

router.get('/responTeknis/', authMiddleware,  responTeknis.reportAllTickets);

module.exports = router;
