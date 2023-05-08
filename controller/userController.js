'use strict';

const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const { getToken } = require('../utils/token')
const { getUser, postUser, putUser, deleteUser } = require('../service/userService')

const register = async (req, res, next) => {
	const payload = req.body

    // Ubah role menjadi lowercase
    if(payload.role){
        payload.role = payload.role.toLowerCase()
    };

    // Validasi role
	if (payload.role && !['user', 'admin'].includes(payload.role)) {
		return res.status(400).json({ status: 400, message: "Invalid role value" })
	}
	try {
		let user = await postUser(payload)
		return res.status(200).json({ status: 200, data: user, message: "Succesfully Registered" })
	} catch(e) {
		return res.status(400).json({ status: 400, message: e.message });
	}
}

const localstrategy = async (email, password, done) => {
    try {
        let user = await getUser(email)
        if (!user) { return done() }
        if (bcrypt.compareSync(password, user.password)) {
            let userWithoutPassword;
            ({ password, ...userWithoutPassword } = user.toJSON())
            return done(null, userWithoutPassword)
        }
    } catch (e) {
        done(e, null)
    }
}

const login = async (req, res, next) => {
    passport.authenticate('local', async function (e, user) {
        try {
            if (e) { return next(e) }
            if (!user) { return res.json({ error: 1, message: 'Email or password is invalid' }) }
            let signed = jwt.sign(user, config.secretkey)
            await putUser(user._id, { $push: { token: signed }, last_login: Date.now() })
            return res.status(200).json({ status: 200, data: user, signed, message: "Succesfully Logged In" })
        } catch (e) {
            return res.status(400).json({ status: 400, message: e.message });
        }
    })(req, res, next)
}

const logout = async (req, res, next) => {
    let token = getToken(req)
    try {
        let user = await deleteUser(token)
        if (!token || !user) {
            return res.status(400).json({ status: 400, message: "User Not Found" });
        }
        return res.status(200).json({ status: 200, message: "Succesfully Logged Out" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
}

const me = (req, res, next) => {
    if (!req.user) {
        return res.status(400).json({ status: 400, message: "User Haven't Logged In Yet" });
    }

    return res.status(200).json({ status: 200, data: req.user, message: "Succesfully User Logged In" })
}

module.exports = { 
    register, 
    localstrategy, 
    login, 
    logout, 
    me
}