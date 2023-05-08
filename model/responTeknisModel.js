const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
    id_tiket: {
        type: Schema.Types.ObjectId,
        ref: 'Ticket',
        required: true
    },
    respons: {
        type: String,
        required: true
    },
    tanggal_respon: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Response = mongoose.model('Response', ResponseSchema);

module.exports = Response;
