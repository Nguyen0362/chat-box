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

    const friendList = res.locals.user.friendsList;
    const friendListId = friendList.map(item => item.userId);

    const users = await User.find({
        $and: [
            { _id: { $ne: userIdA }, },
            { _id: { $nin: res.locals.user.requestFriends } },
            { _id: { $nin: res.locals.user.acceptFriends } },
            { _id: { $nin: friendListId } }
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

module.exports.accept = async (req, res) => {
    const userIdA = res.locals.user.id;

    _io.once("connection", (socket) => {
        socket.on("CLIENT_REFUSE_FRIEND", async (userIdB) => {
            //Xóa id của B trong acceptFriend của A
            const existBInA = await User.findOne({
                _id: userIdA,
                acceptFriends: userIdB
            });

            if(existBInA){
                await User.updateOne({
                    _id: userIdA
                }, {
                    $pull: { acceptFriends: userIdB }
                });
            };

            //Xóa id của A trong requestFriends của B
            const existBInB = await User.findOne({
                _id: userIdB,
                requestFriends: userIdA
            });

            if(existBInB){
                await User.updateOne({
                    _id: userIdB
                }, {
                    $pull: { requestFriends: userIdA }
                });
            };
        });

        socket.on("CLIENT_ACCEPT_FRIEND", async (userIdB) => {
            // Thêm {userId, roomChatId} của B vào friendsList của A
            // Xóa id của B trong acceptFriends của A
            const existBInA = await User.findOne({
                _id: userIdA,
                acceptFriends: userIdB
            });

            if(existBInA){
                await User.updateOne({
                    _id: userIdA
                }, {
                    $pull: { acceptFriends: userIdB },
                    $push: { 
                        friendsList: {
                            userId: userIdB,
                            roomChatId: ""
                        }
                    }
                });
            };

            // Thêm {userId, roomChatId} của A vào friendsList của B
            // Xóa id của A trong requestFriends của B
            const existBInB = await User.findOne({
                _id: userIdB,
                requestFriends: userIdA
            });

            if(existBInB){
                await User.updateOne({
                    _id: userIdB
                }, {
                    $pull: { requestFriends: userIdA },
                    $push: { 
                        friendsList: {
                            userId: userIdA,
                            roomChatId: ""
                        }
                    }
                });
            };
        });
    });

    const users = await User.find({
        _id: { $in: res.locals.user.acceptFriends},
        deleted: false,
        status: "active"
    }).select("id fullName avatar");

    res.render("client/pages/user/accept", {
        pageTitle: "Lời mời đã nhận",
        users: users
    })
}

module.exports.friends = async (req, res) => {

    const friendList = res.locals.user.friendsList;
    const friendListId = friendList.map(item => item.userId);
    
    const users = await User.find({
        _id: { $in: friendListId},
        deleted: false,
        status: "active"
    }).select("id fullName avatar");

    res.render("client/pages/user/friends", {
        pageTitle: "Danh sách bạn bè",
        users: users
    })
}