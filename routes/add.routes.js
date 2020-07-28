const { Router } = require("express");
const Course = require('../models/course');
const auth = require('../middleware/auth');

const addRouter = Router();

addRouter.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    });
});

addRouter.post('/', auth, async (req, res) => {
    try {
        const { title, price, image } = req.body;
        const course = new Course({
            title, price, image, userId: req.user
        });
        await course.save();

        res.redirect('/courses');
    } catch (err) {
        res.status(500).json({ message: 'Something wrong!' });
    }
});

module.exports = addRouter;