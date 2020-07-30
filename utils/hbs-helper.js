module.exports = {
    ifEqual(a, b, options) {
        if (a == b) {
            return options.fn(this);
        }

        return options.inverse(this);
    }
}