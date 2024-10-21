const User = require('../../model/user.model');
const md5 = require('md5');
const grenerateHelper = require('../../helpers/generate.helper');

module.exports.register = (req, res) => {
    res.render("client/pages/user/register")
}

module.exports.registerPost = async (req, res) => {
    const user = req.body;
    console.log(user);
    
    const existUser = await User.findOne({
        email: user.email,
        deleted: false
    });

    if(existUser){
        req.flash("error", "Email đã tồn tại!");
        res.redirect("back");
        return;
    }

    const dataUser = {
        fullName: user.fullName,
        email: user.email,
        password: md5(user.password),
        token: grenerateHelper.generateRandomString(30),
        status: "active"
    }

    const newUser = new User(dataUser);
    await newUser.save();

    res.cookie("tokenUser", newUser.token);
    res.redirect("/chat");
}

module.exports.login = async (req, res) => {
    res.render("client/pages/user/login")
}

module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    const existUser = await User.findOne({
        email: email,
        deleted: false
    });

    if(!existUser){
        req.flash("error", "Email không tồn tại trong hệ thống!");
        res.redirect("back");
        return;
    }

    if(md5(password) != existUser.password){
        req.flash("error", "Sai mật khẩu");
        res.redirect("back");
        return;
    }

    if(existUser.status != "active"){
        req.flash("error", "Tài khoản đã bị khóa");
        res.redirect("back");
        return;
    }

    res.cookie("tokenUser", existUser.token);

    req.flash("success", "Đăng nhập thành công!");

    res.redirect("/chat");

}

module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser");
    res.redirect("/chat/login");
}