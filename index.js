const express = require('express');
const app = express();

const csurf = require('csurf');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const MONGODB_URI = 'mongodb+srv://artem:LmVIAtmN64WO5r5A@cluster0.qkp5a.mongodb.net/shop?retryWrites=true&w=majority';

const store = new MongoStore({
    collection: 'sessions',
    uri: MONGODB_URI
});

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({ 
    secret: 'some secret key',
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(csurf());
app.use(require('./middleware/variables'));
app.use(require('./middleware/user'));

app.use('/', require('./routes/home.routes'));
app.use('/courses', require('./routes/courses.routes'));
app.use('/add', require('./routes/add.routes'));
app.use('/card', require('./routes/card.routes'));
app.use('/orders', require('./routes/orders.routes'));
app.use('/auth', require('./routes/auth.routes'));

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

start();