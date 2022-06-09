const mongoose = require("mongoose");

const ProductoSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    stock: {
        type: Number,
        required: true,
        default: 0,
    },
    precio: {
        type: Number,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

ProductoSchema.index({ nombre: 'text' })

module.exports = mongoose.model("Producto", ProductoSchema)