const { Router } = require("express");

const homeRouter = Router();

homeRouter.get('/', (req, res) => {
    res.render('index', {
        title: 'Главная',
        isHome: true
    });
});

module.exports = homeRouter;