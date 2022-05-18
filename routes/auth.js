const express = require('express')
const router = express.Router()
const authController = require('../controller/auth_controller')
const { appError, handleErrorAsync } = require('../utils/errorHandler')
const { isAuth, generateJwtToken } = require('../middleware/auth')

router.get('/google', handleErrorAsync(authController.google.auth))
router.get('/google/callback', handleErrorAsync(authController.google.execCallback), handleErrorAsync (async (req, res, next) => {
    if(req.user){
        const token = await generateJwtToken(req.user.id)

        if(token){
            res.cookie('x-token', token)
            res.redirect(`http://localhost:8080/section7/7-2/test.html?token=${token}`)
        }else{
            return next(appError('401','','No permission to generate token', next))
        }

    }else{
        res.status(401)
            .json({
                status: 'Error',
                data: {},
                message: 'Authorization via google error'
            })
    }
}))

module.exports = router