const express = require('express');
const bodyParser = require('body-parser');
const flash = require('express-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const env = require('dotenv');
require('dotenv').config();
const systemConfig = require('./config/system');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const port = process.env.PORT;

const server = http.createServer(app);
const io = new Server(server);

const routeClient = require('./routes/client/index.route');

const database = require('./config/database');
database.connect();

app.set('views', `${__dirname}/views`); //Tìm đến thư mục tên là views 
app.set('view engine', 'pug'); //template engine sử dụng: pug 

app.use(express.static(`${__dirname}/public`)); // Thiết lập thư mục chứa file tĩnh

// Khai báo biến toàn cục cho file pug 
app.locals.prefixAdmin = systemConfig.prefixAdmin;

// Khai báo biến toàn cục cho file js backend
global._io = io;

// create application/x-www-form-urlencoded parser
app.use(bodyParser.urlencoded({
    extended: false
}))

//parser application/json
app.use(bodyParser.json())

//flash
app.use(cookieParser('JHSNDJS'));
app.use(session({
    cookie: {
        maxAge: 60000
    }
}));
app.use(flash());

//Khai báo đường dẫn
routeClient(app);

server.listen(port, () => {
    console.log(`App listening on port ${port}`);
})