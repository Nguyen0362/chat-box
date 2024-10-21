const chatRoute = require('./chat.route');
const userRoute = require('./user.route');



module.exports = (app) => {
    //app.use(userMiddleware.requireAuth);

    app.use(
        "/chat",
        chatRoute
    );

    app.use(
        "/chat",
        userRoute
    );
}

