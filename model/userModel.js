const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const Schema = mongoose.Schema 

const UserSchema = new Schema({
	username: {
		type: String,
		required: [true, 'username is required'],
		minlength: [3, 'username length of at least 3 characters'],
		maxlength: [255, 'username length max 255 characters']
	},

	email: {
		type: String,
		required: [true, 'Email is required'],
		maxlength: [255, 'Email length max 255 characters']
	},

	password: {
		type: String,
		required: [true, 'Password is required'],
		maxlength: [25, 'Password length max 25 characters']
	},

	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user'
	},

	token: [String],

	last_login: {
		type: Date,
	},

}, { timestamps: true })

UserSchema.path('email').validate(value => {
	const EMAIL_RE = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i
	return EMAIL_RE.test(value)
}, attr => `${attr.value} email tidak valid`)

UserSchema.path('email').validate( async function (value) {
	try {
		const count = await this.model('User').count({email: value})
		return !count
	} catch(err) {
		throw err
	}
}, attr => `${attr.value} sudah terdaftar`)

UserSchema.path('password').validate(value => {
    const PASSWORD_RE = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/
    return PASSWORD_RE.test(value)
}, attr => `${attr.value} password harus terdiri dari minimal 8 karakter, minimal satu huruf besar, minimal satu huruf kecil, dan minimal satu angka`)


const HASH_ROUND = 10
UserSchema.pre('save', function(next) {
	this.password = bcrypt.hashSync(this.password, HASH_ROUND)
	next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User