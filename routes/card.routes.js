const { Router } = require("express");
const Course = require("../models/course");

const cardRouter = Router();

function mapCartItems(cart) {
    return cart.map(c => ({
        ...c.courseId._doc, count: c.count
    }));
}

function computePrice(courses) {
    return courses.reduce((total, course) => {
        return total += course.price * course.count;
    }, 0);
}

cardRouter.post('/add', async (req, res) => {
    const course = await Course.findById(req.body.id);
    await req.user.addToCart(course);
    res.redirect('/card');
});

cardRouter.delete('/remove/:id', async (req, res) => {
    await req.user.removeFromCart(req.params.id);
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();
    const courses = mapCartItems(user.cart.items);
    const cart = {
        courses,
        price: computePrice(courses)
    }

    res.status(200).json(cart);
});

cardRouter.get('/', async (req, res) => {
    const user = await req.user
        .populate('cart.items.courseId')
        .execPopulate();

    const courses = mapCartItems(user.cart.items);

    res.render('card', {
        title: 'Корзина',
        isCard: true,
        courses: courses,
        price: computePrice(courses)
    });
});

module.exports = cardRouter;