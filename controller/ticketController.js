const Ticket = require('../model/ticketModel');
const constants = require('../config/config');
const ejs = require("ejs");
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const nodemailer = require('nodemailer');
const { dbPass, dbName, dbPort, dbUser, dbHost0, dbHost1, dbHost2, dbSsl } = require("../config/config");

// membuat transporter untuk mengirim email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: constants.user,
    pass: constants.emailPass
  }
});

// Generate ticket Number
const generateTicketNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

  const prefix = 'TK';
  const ticketNumber = `${prefix}${year}${month}${day}${hour}${minute}${second}${milliseconds}`;

  return ticketNumber;
};

// membuat tiket baru
const createTicket = async (req, res) => {
  const ticketData = req.body;
  const ticketNumber = generateTicketNumber();
  const newTicket = new Ticket({
    ...ticketData,
    nomor_tiket: ticketNumber
  });

  try {
    const savedTicket = await newTicket.save();
    console.log(savedTicket);

    let patha = path.resolve(__dirname, '../server/view/ticket-notification.ejs')
    let str = fs.readFileSync(patha, 'utf8');
    let messageHtml = ejs.render(str, {
      nama: req.user.username,
      nomor_tiket: ticketNumber,
      email: req.user.email,
      status: savedTicket.status,
      deskripsi: savedTicket.deskripsi,
      ticketNumber: ticketNumber,
    });

    let emailConfig = {
      from: constants.user,
      to: req.user.email,
      subject: "Ticket Notification",
      html: messageHtml,
    }

    transporter.sendMail(emailConfig, function (err, info) {
      if (err) {
        console.log("log email not send", err)
      } else {
        console.log("log email sent", info.response)
      }
    });

    res.status(201).json(savedTicket);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mendapatkan semua tiket tergantung role
const getAllTickets = async (req, res) => {
  try {
    const prioQuery = req.query.prioritas;
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    if (isNaN(skip) || isNaN(limit)) {
      return res.status(400).json({
        message: "Skip and limit are required and must be numbers"
      });
    }

    let matchQuery = {
      $and: [
        {
          isDelete: false
        },
        {
          isAktif: true
        }
      ]
    };


    if (req.user.role === 'user') {
      matchQuery.$and.push({
        id_pengguna: new ObjectId(req.user._id)
      });
    }

    if (prioQuery) {
      matchQuery.$and.push({
        prioritas: {
          $regex: prioQuery,
          $options: 'i'
        }
      });
    }

    const query = [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: "users",
          let: {
            userId: "$id_pengguna"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                last_login: 1
              }
            }
          ],
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "responses",
          let: {
            ticketId: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$id_tiket", "$$ticketId"]
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
            $first: "$user.email"
          },
          username: {
            $first: "$user.username"
          },
          data: {
            $push: "$$ROOT"
          }
        }
      },
      {
        $count: "total"
      }
    ];
    const client = new MongoClient(`mongodb://${dbUser}:${dbPass}@${dbHost0}:${dbPort},${dbHost1}:${dbPort},${dbHost2}:${dbPort}/${dbName}?${dbSsl}`);
    const coll = client.db(dbName).collection("tickets");
    const aggCursor = coll.aggregate(query);
    const [total] = await aggCursor.toArray();
    await aggCursor.close();

    const dataQuery = [
      {
        $match: matchQuery
      },
      {
        $lookup: {
          from: "users",
          let: {
            userId: "$id_pengguna"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"]
                }
              }
            },
            {
              $project: {
                _id: 1,
                username: 1,
                email: 1,
                createdAt: 1,
                updatedAt: 1,
                last_login: 1
              }
            }
          ],
          as: "user"
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "responses",
          let: {
            ticketId: "$_id"
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$id_tiket", "$$ticketId"]
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
            $first: "$user.email"
          },
          username: {
            $first: "$user.username"
          },
          data: {
            $push: "$$ROOT"
          },
        }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $sort: {
          createdAt: -1
        }
      }
    ];
    const dataCursor = coll.aggregate(dataQuery);
    const data = await dataCursor.toArray();
    await dataCursor.close();

    return res.status(200).json({
      total: total ? total.total : 0,
      data
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Menghapus tiket berdasarkan ID (SAFE DELETE)
const deleteTicket = async (req, res) => {
  const id = req.params.id;
  const updateData = {
    isDelete: true,
    isAktif: false
  };

  try {
    const deletedTicket = await Ticket.findOneAndUpdate({ _id: id }, updateData);
    console.log(deletedTicket);
    if (!deletedTicket) {
      const error = new Error({ message: 'Ticket not found' });
      error.status = 404;
      throw error;
    } else {
      res.status(200).json({
        status: "success",
        message: `Successfully Remove Ticket ${deletedTicket.nomor_tiket}`
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllTickets,
  createTicket,
  deleteTicket,
};
