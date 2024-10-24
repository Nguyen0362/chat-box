const User = require('../../model/user.model');
const md5 = require('md5');
const grenerateHelper = require('../../helpers/generate.helper');
const { connection } = require('mongoose');

module.exports.register = (req, res) => {
    res.render("client/pages/user/register")
}

module.exports.registerPost = async (req, res) => {
    const user = req.body;
    
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
    res.redirect("/user/login");
}

module.exports.notFriend = async (req, res) => {
    const userIdA = res.locals.user.id;

    _io.once("connection", (socket) => {
        // Khi A gửi yêu cầu cho B
        socket.on("CLIENT_ADD_FRIEND", async (userIdB) => {
            // Thêm id của A vào acceptFriends của B
            const existAInB = await User.findOne({
                _id: userIdB,
                acceptFriends: userIdA
            })

            if(!existAInB){
                await User.updateOne({
                    _id: userIdB
                }, {
                    $push: {acceptFriends: userIdA}
                })
            }

             // Thêm id của B vào requestFriends  của A
             const existAInA = await User.findOne({
                _id: userIdA,
                requestFriends: userIdB
            })

            if(!existAInA){
                await User.updateOne({
                    _id: userIdA
                }, {
                    $push: {requestFriends: userIdB}
                })
            }
        })
    })

    const users = await User.find({
        $and: [
            { _id: { $ne: userIdA }, },
            { _id: { $nin: res.locals.user.requestFriends } },
            { _id: { $nin: res.locals.user.acceptFriends } }
        ],
        deleted: false,
        status: "active"
    }).select("id fullName avatar");

    res.render("client/pages/user/not-friend", {
        pageTitle: "Danh sách người dùng",
        users: users
    })
}

module.exports.request = async (req, res) => {
    const userIdA = res.locals.user.id;

    _io.once("connection", (socket) => {
        socket.on("CLIENT_CANCEL_FRIEND", async (userIdB) => {
            // xóa id của A trong acceptFriends của B
            const existAInB = await User.findOne({
                _id: userIdB,
                acceptFriends: userIdA
            });

            if(existAInB){
                await User.updateOne({
                    _id: userIdB
                }, {
                    $pull: {acceptFriends: userIdA}
                })
            }

            // xóa id của B trong requestFriends của A
            const existAInA = await User.findOne({
                _id: userIdA,
                requestFriends: userIdB
            });

            if(existAInA){
                await User.updateOne({
                    _id: userIdA
                }, {
                    $pull: {requestFriends: userIdB}
                })
            }
        })
    })

    const users = await User.find({
        _id: { $in: res.locals.user.requestFriends},
        deleted: false,
        status: "active"
    }).select("id fullName avatar");

    res.render("client/pages/user/request", {
        pageTitle: "Lời mời đã gửi",
        users: users
    })
}