const { getToken } = require('../utils/token');
const jwt = require('jsonwebtoken')
const config = require('../config/config')
const User = require('../model/user')

function decodeToken() {
	return async function(req, res, next) {
		try {
			let token = getToken(req)
			if (!token) {return next()}
			req.user = jwt.verify(token, config.secretkey)
			let user = await User.findOne({token: {$in: [token]}})
			if (!user) {
				res.json({
					error: 1,
					message: 'Token expired'
				})
			}
		} catch(err) {
			if (err && err.name === "JsonWebTokenError") {
				return res.json({
					error: 1,
					message: err.message
				})
			}

			next(err)
		}

		next()
	}
}

module.exports = {decodeToken}