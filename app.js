const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const dotenv = require('dotenv');
const userRouter = require('./Routes/userRoutes');
const adminRouter = require('./Routes/adminRoutes');
const db = require('./helpers/connection');
const app = express();

dotenv.config({ path: './config.env' });

db.connect();

app.set('view engine', 'ejs');

app.use(expressLayouts);
app.set('layout', './layouts/layout.ejs', './layouts/adminLayout.ejs');

app.use(express.static('./public'));
app.use(express.static('./public/admin'));
app.use(express.json());
app.use(fileUpload());

app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));

console.log('execution started');

app.use('/', userRouter);
app.use('/admin', adminRouter);

app.use(function (req, res, next) {
  res.status(404).send("<h1>Sorry can't find that.... 404!</h1>");
});

app.listen(process.env.PORT, () => {
  console.log('server is listening from the port .....!');
});
