const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    id_pengguna: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    nomor_tiket: {
        type: String,
        required: true
    },
    jenis_permintaan: {
        type: String,
        enum: ['permintaan', 'keluhan', 'masalah teknis'],
        required: true
    },
    prioritas: {
        type: String,
        enum: ['rendah', 'sedang', 'tinggi'],
        required: true
    },
    deskripsi: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['menunggu tindakan', 'sedang dalam proses', 'sedang direspon', 'telah selesai'],
        default: 'menunggu tindakan'
    },
    tanggal_pengajuan: {
        type: Date,
        default: Date.now
    },
    tanggal_perubahan_status: {
        type: Date,
        default: Date.now
    },
    isDelete: {
        type: Boolean,
        default: false
    },
    isAktif: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Ticket = mongoose.model('Ticket', TicketSchema);

module.exports = Ticket;
