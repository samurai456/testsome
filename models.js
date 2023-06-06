const mongoose = require('mongoose');

const Message = mongoose.Schema({
    src: {type: String, required: true},
    dst: {type: String, required: true},
    theme: {type: String, required: false},
    msg: {type: String, required: true},
    date: {type: Date, required: true},
});

module.exports = mongoose.model('Message', Message);