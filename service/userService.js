const User = require('../model/userModel')

const getUser = async (email) => {
	try {
		let user = await User.findOne({email}).select('-__v -createdAt -updatedAt -token')
		return user
	} catch(e) {
		throw Error(e.message)
	}
}

const postUser = async (payload) => {
	try {
		let user = new User(payload)
		await user.save()
		return user
	} catch(e) {
		throw Error(e.message)
	}
}

const putUser = async (id, token) => {
	try {
		let user = await User.findByIdAndUpdate(id, token)
		return user 
	} catch(e) {
		throw Error(e.message)
	}
}

const deleteUser = async (token) => {
	try {
		let user = await User.findOneAndUpdate({token: {$in: [token]}}, {$pull: {token: token}}, {useFindAndModify: false})
		return user
	} catch(e) {
		throw Error(e.message)
	}
}

module.exports = { getUser, postUser, putUser, deleteUser }