const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/user.controller');

const userMiddleware = require("../../middlewares/client/user.middleware");

router.get("/register", controller.register);

router.post("/register", controller.registerPost);

router.get("/login", controller.login);

router.post("/login", controller.loginPost);

router.get("/logout", controller.logout);

router.get(
    "/not-friend", 
    userMiddleware.requireAuth,
    controller.notFriend
);

router.get(
    "/request", 
    userMiddleware.requireAuth,
    controller.request
);

module.exports = router;

