const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'Please provide product name'],
        maxlength: [100, 'Name can not be more than 100 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        default: 0,
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'Please provide product description'],
        maxlength: [1000, 'Name can not be more than 1000 characters'],
    },
    image: {
        type: String,
        default: '/uploads/example.jpeg',
    },
    category: {
        type: String,
        required: [true, 'Please provide product category'],
        enum: ['office', 'kitchen', 'bedroom'],
    },
    company: {
        type: String,
        required: [true, 'Please provide product company'],
        enum: {
            values: ['ikea', 'liddy', 'marcos'],
            messages: '{VALUE} is not supported',
        },
    },
    colors: {
        type: [String],
        default: ['#222'],
        required: true, 
    },
    featured: {
        type: Boolean,
        default: false, 
    },
    freeShipping: {
        type: Boolean,
        default: false, 
    },
    inventory: {
        type: Number,
        required: true,
        default: 15, 
    },
    averageRating: {
        type:Number,
        default: 0,
    },
    numOfReviews: {
        type:Number,
        default: 0,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    }
}, {timestamps: true, });

productSchema.set('toJSON', {virtuals: true});
productSchema.set('toObject', {virtuals: true}); 

// Use virtual When The model Don’t Have a Field That Relations With Another model
///////make sure that you have .populate in the controller where you want to see this virtual
productSchema.virtual('reviews', {
    ref: 'Review',
    localField: '_id',
    foreignField: 'product',
    justOne: false,
    // match: { rating: 1}
});

// delete all reviews That Belong to a product when it is deleted
productSchema.pre('remove', async function (next) {
    await this.model('Review').deleteMany({product: this._id});
})

module.exports = mongoose.model('Product', productSchema);