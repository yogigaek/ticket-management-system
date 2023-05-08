const ResponTeknis = require("../model/responTeknisModel");
const Ticket = require("../model/ticketModel");
const User = require("../model/userModel");
const { MongoClient } = require("mongodb");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const { dbPass, dbName, dbPort, dbUser, dbHost0, dbHost1, dbHost2, dbSsl, } = require("../config/config");

// Memperbarui tiket berdasarkan ID dan menyimpan respon teknis
const updateTicketsByTechnicalTeam = async (req, res, status, respons) => {
  if (req != null) req.setTimeout(0);

  try {
    const updateTicket = await Ticket.findOne({
      _id: new ObjectId(req.params.id),
      isDelete: false,
    });

    if (!updateTicket) throw new Error("Ticket Not Found");

    const config = await User.findOne({
      role: "admin",
      _id: req.user._id,
    });

    if (!config) throw new Error("Only Admin can update ticket status");

    updateTicket.status = status;
    updateTicket.tanggal_perubahan_status = Date.now();
    await updateTicket.save();

    const responTeknis = new ResponTeknis({
      id_tiket: updateTicket._id,
      respons: respons,
    });

    await responTeknis.save();

    return Promise.resolve({
      status: `Status tiket berhasil diubah menjadi ${status}`,
    });
  } catch (err) {
    return Promise.reject({
      status: 400,
      message: err.message,
    });
  }
};

// Laporan semua ticket untuk tim teknis
const reportAllTickets = async (req, res) => {
  try {
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    if (isNaN(skip) || isNaN(limit)) {
      return res.status(400).json({
        message: "Skip and limit are required and must be numbers",
      });
    }

    const matchQuery = {
      isDelete: false,
      isAktif: true,
      ...(req.user.role === "user" && {
        id_pengguna: new ObjectId(req.user._id),
      }),
      ...(req.query.prioritas && {
        prioritas: {
          $regex: req.query.prioritas,
          $options: "i",
        },
      }),
    };

    const matchQueryUser = {
      ...(req.query.email && {
        "user.email": { $regex: req.query.email, $options: "i" },
      }),
      ...(req.query.username && {
        "user.username": { $regex: req.query.username, $options: "i" },
      }),
      ...(req.query.userId && { "user._id": new ObjectId(req.query.userId) }),
    };

    const query = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "users",
          let: {
            userId: "$id_pengguna",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                last_login: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $match: matchQueryUser,
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "responses",
          let: {
            ticketId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$id_tiket", "$$ticketId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "responTeknis",
        },
      },
      {
        $group: {
          _id: "$_id",
          email: {
            $first: "$user.email",
          },
          username: {
            $first: "$user.username",
          },
          total: {
            $sum: 1,
          },
          data: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $count: "total",
      },
    ];
    const client = new MongoClient(
      `mongodb://${dbUser}:${dbPass}@${dbHost0}:${dbPort},${dbHost1}:${dbPort},${dbHost2}:${dbPort}/${dbName}?${dbSsl}`
    );
    const coll = client.db(dbName).collection("tickets");
    const aggCursor = coll.aggregate(query);
    const [total] = await aggCursor.toArray();
    await aggCursor.close();

    const dataQuery = [
      {
        $match: matchQuery,
      },
      {
        $lookup: {
          from: "users",
          let: {
            userId: "$id_pengguna",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                last_login: 1,
              },
            },
          ],
          as: "user",
        },
      },
      {
        $match: matchQueryUser,
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "responses",
          let: {
            ticketId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$id_tiket", "$$ticketId"],
                    },
                  ],
                },
              },
            },
          ],
          as: "responTeknis",
        },
      },
      {
        $group: {
          _id: "$_id",
          email: {
            $first: "$user.email",
          },
          username: {
            $first: "$user.username",
          },
          total: {
            $sum: 1,
          },
          data: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ];
    const dataCursor = coll.aggregate(dataQuery);
    const data = await dataCursor.toArray();
    await dataCursor.close();

    return res.status(200).json({
      total: total ? total.total : 0,
      data,
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

module.exports = {
  updateTicketsByTechnicalTeam,
  reportAllTickets,
};
