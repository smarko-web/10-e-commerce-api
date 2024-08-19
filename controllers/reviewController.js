const Review = require('../models/Review');
const Product = require('../models/Product');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const { checkPermissions } = require('../utils');

const getAllReviews = async (req, res) => {
    const reviews = await Review.find({})
        .populate({
            path: 'product',
            select: 'name company price',
        })
        .populate({
            path: 'user',
            select: 'name',
        });

    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
};
const getSingleReview = async (req, res) => {
    const { id: reviewId } = req.params;

    const review = await Review.findOne({_id: reviewId})  
    .populate({
        path: 'product',
        select: 'name company price',
    });

    if (!review) {
        throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
    }
    res.status(StatusCodes.OK).json({review});
};
const createReview = async (req, res) => {
    const { product: productId } = req.body;

    const isValidProduct = await Product.findOne({_id: productId});

    if (!isValidProduct) {
        throw new CustomError.NotFoundError(`No product with id : ${productId}`);
    }

    const alreadyReviewed = await Review.findOne({product: productId,user:req.user.userId});

    if (alreadyReviewed) { 
        throw new CustomError.BadRequestError('User already reviewed the product');
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    res.status(StatusCodes.CREATED).json({review});
};
const updateReview = async (req, res) => {
    const {id: reviewId} = req.params;
    const {rating, title, comment} = req.body;
    const review = await Review.findOne({_id: reviewId});
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
    }
    console.log(req.user.userId);

    checkPermissions(req.user, review.user);
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    await review.save();
    res.status(StatusCodes.OK).json({msg: 'Review updated successfully', review});
};

const deleteReview = async (req, res) => {
    const {id: reviewId} = req.params;

    const review = await Review.findOne({_id: reviewId});
    if (!review) {
        throw new CustomError.NotFoundError(`No review with id : ${reviewId}`);
    }
    console.log(req.user.userId);

    checkPermissions(req.user, review.user);
    await review.remove();
    res.status(StatusCodes.OK).json({msg: 'Review deleted successfully'});
};

const getSingleProductReviews = async (req, res) => {
    const {id: productId} = req.params;
    const reviews = await Review.find({product: productId});
    // Add Myself 
    if (reviews.length <= 0) {
        throw new CustomError.NotFoundError(`This product Hasn’t Been Reviewed yet`);
    }

    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
}

module.exports = {
    getAllReviews,
    getSingleReview,
    createReview,
    updateReview,
    deleteReview,
    getSingleProductReviews
};