const { Router } = require("express");
const Course = require("../models/course");
const auth = require('../middleware/auth');
const { validationResult } = require('express-validator');
const { courseValidators } = require('../utils/validators');

const coursesRouter = Router();

function isOwner(course, req) {
    return course.userId.toString() === req.user._id.toString();
}

coursesRouter.get('/', async (req, res) => {
    try {
        const courses = await Course.find().populate('userId', 'email name').lean();
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        });
    } catch (err) {
        console.log(err);
    }
});

coursesRouter.get('/:id/edit', auth, async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }

    try {
        const course = await Course.findById(req.params.id).lean();

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }

        res.render('course-edit', {
            title: `Редактировать ${course.title}`,
            course
        });
    } catch (err) {
        console.log(err);
    }
});

coursesRouter.post('/remove', auth, async (req, res) => {
    try {
        await Course.deleteOne({
            _id: req.body.id,
            userId: req.user._id
        });
        res.redirect('/courses');
    } catch (err) {
        console.log(err);
    }
});

coursesRouter.post('/edit', auth, courseValidators, async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).redirect(`/courses/${req.body.id}/edit?allow=true`);
    }

    try {
        const { id } = req.body;
        delete req.body.id; 

        const course = await Course.findById(id);

        if (!isOwner(course, req)) {
            return res.redirect('/courses');
        }
        Object.assign(course, req.body);
        await course.save();
        res.redirect('/courses');
    } catch (err) {
        console.log(err);
    }
});

coursesRouter.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).lean();
        res.render('course', {
            layout: 'empty',
            title: `Курс ${course.title}`,
            course
        });
    } catch (err) {
        console.log(err);
    }
});

module.exports = coursesRouter;