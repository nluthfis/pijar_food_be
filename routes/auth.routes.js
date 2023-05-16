const router = require('express').Router()

const authController = require('../controller/auth.controller')

router.post('/auth/login', authController.loginUser)

module.exports = router