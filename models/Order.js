const mongoose = require('mongoose');

const SingleOrderItemSchema = mongoose.Schema({
    name: {
        type: String, 
        required: true,
    },
    image: {
        type: String, 
        required: true,
    },
    price: {
        type: Number, 
        required: true,
    },
    amount: {
        type: Number, 
        required: true,
    },
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true,
    },
});

const orderSchema = mongoose.Schema({
    tax: {
        type: Number,
        required: true,
    },   
    shippingFee: {
        type: Number,
        required: true,
    },
    subtotal: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    orderItems: [SingleOrderItemSchema],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    clientSecret: {
        type: String,
        required: true,
    },
    paymentIntentId: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'failed', 'paid', 'cancelled', 'delivered'],
        default: 'pending'
    },

}, {timeStamps: true});

module.exports = mongoose.model('Order', orderSchema);





