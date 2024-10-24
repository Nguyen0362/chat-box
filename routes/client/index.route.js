const chatRoute = require('./chat.route');
const userRoute = require('./user.route');



module.exports = (app) => {
    app.use(
        "/chat",
        chatRoute
    );

    app.use(
        "/user",
        userRoute
    );

    app.use("/", (req, res) => {
         res.redirect("/user/login");
    })
}

