const {
    format
} = require('timeago.js');
const bcrypt = require('bcryptjs');
const helper = {};

helper.timeago = (timestamp) => {

    return format(timestamp);

};

helper.isLoggedin = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/index');
    }
};
helper.isLoggedout = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/links');
    }
};

helper.encrypt = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

helper.comparePassword = async (password, bdpassword) => {
    const result = await bcrypt.compare(password, bdpassword);
    return result;
};

helper.rutVerify = (rut) => {
    const rawRut = rut.split('-')[0];
    const verif = rut.split('-')[1];
    var k = 2,
        sum = 0,
        res,
        vrf;
    for (var i = rawRut.length - 1; i >= 0; i--) {
        sum += rawRut.charAt(i) * k;
        if (k == 7) {
            k = 2;
        } else {
            k++;
        }
    }
    res = sum % 11;
    if (res == 1) {
        vrf = 'k';
    } else if (res == 0) {
        vrf = '0';
    } else {
        vrf = (11 - res).toString();
    }
    return (vrf == verif)
};

module.exports = helper;