const keys = require('../keys/index');

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Восстановление пароля.',
        html: `
            <h1>Вызабыли пароль?</h1>
            <p>Если нет, то проигнорируйте это письмо!</p>
            <p>Иначе, перейдите по ссылке ниже.</p>
            <a href="${keys.BASE_URL}/auth/password/${token}">Восстановить доступ</a>
            <hr/>
            <a href="${keys.BASE_URL}">Магазин курсов</a>
        `
    }
}