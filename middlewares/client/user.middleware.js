const User = require('../../model/user.model');

module.exports.requireAuth = async (req, res, next) => {
    if(!req.cookies.tokenUser){
        req.flash("error", "Vui lòng đăng nhập!");
        res.redirect("/user/login");
        return;
    }

    const exitsUser = await User.findOne({
        token: req.cookies.tokenUser,
        deleted: false,
        status: "active"
    });

    if(!exitsUser){
        req.flash("error", "Vui lòng đăng nhập!");
        res.redirect("/user/login");
        return;
    }

    if(req.cookies.tokenUser){
        const user = await User.findOne({
            token: req.cookies.tokenUser,
            deleted: false,
            status: "active"
        });

        if(user){
            res.locals.user = user;
        }
    }

    next();
}