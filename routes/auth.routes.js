const { Router } = require("express");
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const keys = require('../keys/index');
const regEmail = require('../emails/registration');
const resetEmail = require('../emails/reset');
const { validationResult } = require('express-validator');
const { registerValidators } = require('../utils/validators');

const authRouter = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: { api_key: keys.SENDGRID_API_KEY }
}));

authRouter.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Авторизация',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError')
    });
});

authRouter.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login/#login');
    });
});

authRouter.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const candidate = await User.findOne({ email });

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password);

            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save(err => {
                    if (err) {
                        throw err;
                    }
                    res.redirect('/');
                });
            } else {
                req.flash('loginError', 'Неверный пароль.')
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'Такого пользователя не существует.')
            res.redirect('/auth/login#login');
        }
    } catch (err) {
        console.log(err);
    }
    
});

authRouter.post('/register', registerValidators, async (req, res) => {
    try {
        const {email, password, name} = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }
        const hashedPass = await bcrypt.hash(password, 12);
        const user = new User({
            email, name, 
            password: hashedPass,
            cart: { items: [] }
        });
        await user.save();
        await transporter.sendMail(regEmail(email));
        res.redirect('/auth/login#login');
    } catch (err) {
        console.log(err);
    }
});

authRouter.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Восстановление пароля',
        error: req.flash('error')
    });
});

authRouter.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login');
    }
    try {
        const user = await User.findOne({
            resetToken: req.params.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (!user) {
            return res.redirect('/auth/login');
        } else {
            res.render('auth/password', {
                title: 'Новый пароль',
                error: req.flash('error'),
                userId: user._id.toString(),
                token: req.params.token
            });
        }
    } catch (err) {
        console.log(err);
    }
});

authRouter.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                req.flash('error', 'Что-то пошло не так, повторите попытку позже.');
                return res.redirect('/auth/reset');
            }

            const token = buffer.toString('hex');
            const candidate = await User.findOne({ email: req.body.email });

            if (candidate) {
                candidate.resetToken = token;
                candidate.resetTokenExp = Date.now() + 3600000;
                await candidate.save();
                await transporter.sendMail(resetEmail(candidate.email, token));
                res.redirect('/auth/login');
            } else {
                req.flash('error', 'Такого пользователя не существует.');
                res.redirect('/auth/reset');
            }
        });
    } catch (err) {
        console.log(err);
    }
});

authRouter.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.body.userId,
            resetToken: req.body.token,
            resetTokenExp: {$gt: Date.now()}
        });

        if (user) {
            user.password = await bcrypt.hash(req.body.password, 12);
            user.resetToken = undefined;
            user.resetTokenExp = undefined;
            await user.save();
            res.redirect('/auth/login');
        } else {
            req.flash('loginError', 'Время для восстановления пароля истекло.')
            res.redirect('/auth/login');
        }

    } catch (err) {
        console.log(err);
    }
});

module.exports = authRouter;