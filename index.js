const express = require('express');
const app = express();

const mongoose = require('mongoose');
const path = require('path');
const exphbs = require('express-handlebars');

const User = require('./models/user');

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', 'views');

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('5f1ec7ab3dff1a1f9fd8647b');
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
    }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', require('./routes/home.routes'));
app.use('/courses', require('./routes/courses.routes'));
app.use('/add', require('./routes/add.routes'));
app.use('/card', require('./routes/card.routes'));
app.use('/orders', require('./routes/orders.routes'));

const PORT = process.env.PORT || 3000;

const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://artem:LmVIAtmN64WO5r5A@cluster0.qkp5a.mongodb.net/shop?retryWrites=true&w=majority', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        const candidate = await User.findOne();
        if (!candidate) {
            const user = new User({
                email: 'q@mail.ru',
                name: 'Artem',
                cart: {items: []}
            });

            await user.save();
        }
        app.listen(PORT, () => {
            console.log(`Server has been started on port ${PORT}`);
        });
    } catch (err) {
        console.log(err);
    }
}

start();