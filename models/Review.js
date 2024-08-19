const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: [true, 'Please provide rating'],
    },
    title: {
        type: String,
        trim: true,
        maxLength: 100,
        required: [true, 'Please provide review title'],
    },
    comment: {
        type: String,
        trim: true,
        maxLength: 250,
        required: [true, 'Please provide review body'],
    },
    user: {
        type: mongoose.Types.ObjectId, 
        ref: 'User',
    },
    product: {
        type: mongoose.Types.ObjectId,
        ref: 'Product',
    },
}, {timestamps: true});

// Make Sure That user Leave Only One Review For a Product
ReviewSchema.index({user: 1, product: 1}, {unique: true});

ReviewSchema.statics.calculateAverageRating = async function(productId) {
    const result = await this.aggregate([
        {$match: {product:productId}}, 
        {$group: {
              _id: null, averageRating: { $avg: '$rating'}, 
              numOfReviews: { $sum: 1 }
            }
          }
    ]);
    
    try {
        await this.model('Product').findOneAndUpdate(
            {_id: productId},
            {
            averageRating:Math.ceil(result[0]?.averageRating || 0),
            numOfReviews:result[0]?.numOfReviews || 0,
            }
    );
    } catch (error) {
     console.log(error);

    }
};

ReviewSchema.post('save', async function() {
    await this.constructor.calculateAverageRating(this.product);
});

ReviewSchema.post('remove', async function() {
    await this.constructor.calculateAverageRating(this.product);
});

module.exports = mongoose.model('Review', ReviewSchema);