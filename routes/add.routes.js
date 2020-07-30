const { Router } = require("express");
const Course = require('../models/course');
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');

const addRouter = Router();

addRouter.get('/', auth, (req, res) => {
    res.render('add', {
        title: 'Добавить курс',
        isAdd: true
    });
});

addRouter.post('/', auth, courseValidators, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('add', {
            title: 'Добавить курс',
            isAdd: true,
            error: errors.array()[0].msg,
            data: {
                title: req.body.title,
                price: req.body.price,
                image: req.body.image
            }
        });
    }

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