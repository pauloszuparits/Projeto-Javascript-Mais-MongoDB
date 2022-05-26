const mongoose = require('mongoose');

const Calculos = mongoose.model('Calculos', {
    tmb: Number,
    agua: Number,
    carboidrato: Number,
    proteina: Number,
    gordura: Number,
    email: String
});

module.exports = Calculos;