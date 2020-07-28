const { Router } = require("express");
const Course = require("../models/course");

const coursesRouter = Router();

coursesRouter.get('/', async (req, res) => {
    const courses = await Course.find().populate('userId', 'email name').lean();
    res.render('courses', {
        title: 'Курсы',
        isCourses: true,
        courses
    });
});

coursesRouter.get('/:id/edit', async (req, res) => {
    if (!req.query.allow) {
        return res.redirect('/');
    }

    const course = await Course.findById(req.params.id).lean();
    res.render('course-edit', {
        title: `Редактировать ${course.title}`,
        course
    });
});

coursesRouter.post('/remove', async (req, res) => {
    try {
        await Course.deleteOne({_id: req.body.id});
        res.redirect('/courses');
    } catch (err) {
        console.log(err);
    }
});

coursesRouter.post('/edit', async (req, res) => {
    const { id } = req.body;
    delete req.body.id;
    await Course.findByIdAndUpdate(id, req.body);
    res.redirect('/courses');
});

coursesRouter.get('/:id', async (req, res) => {
    const course = await Course.findById(req.params.id).lean();
    res.render('course', {
        layout: 'empty',
        title: `Курс ${course.title}`,
        course
    });
});

module.exports = coursesRouter;