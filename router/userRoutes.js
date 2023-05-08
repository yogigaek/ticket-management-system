const router = require('express').Router()
const userController = require('../controller/userController')
const passport = require('passport')
const Localstrategy  = require('passport-local').Strategy

passport.use(new Localstrategy({usernameField: 'email'}, userController.localstrategy))
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/logout', userController.logout) 
router.get('/me', userController.me)

module.exports = router