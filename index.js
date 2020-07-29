const express = require('express');
const app = express();

const csurf = require('csurf');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongodb-session')(session);

const keys = require('./keys/index');

const store = new MongoStore({
    collection: 'sessions',
    uri: keys.MONGO_URI
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
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store
}));

app.use(csurf());
app.use(flash());
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
        await mongoose.connect(keys.MONGO_URI, {
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