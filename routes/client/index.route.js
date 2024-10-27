const chatRoute = require('./chat.route');
const userRoute = require('./user.route');
const homeRoute = require('./home.route');



module.exports = (app) => {
    app.use(
        "/",
        homeRoute
    )

    app.use(
        "/chat",
        chatRoute
    );

    app.use(
        "/user",
        userRoute
    );
}

