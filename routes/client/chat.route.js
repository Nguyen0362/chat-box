const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/chat.controller')

const userMiddleware = require('../../middlewares/client/user.middleware');

router.get(
    "/", 
    userMiddleware.requireAuth,
    controller.index);

module.exports = router;