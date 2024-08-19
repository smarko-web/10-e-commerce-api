const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const { attachCookiesToResponse, createTokenUser, checkPermissions } = require('../utils');

const getAllUsers = async (req, res) => {
    const users = await User.find({role: 'user'}).select('-password');
    res.status(StatusCodes.OK).json({users});
    // res.send('Get All Users');
};
const getSingleUser = async (req, res) => {
    const user = await User.findOne({_id: req.params.id}).select('-password');
    
    if (!user) {
        throw new CustomError.NotFoundError(`No user found with id: ${req.params.id}`);
    }
    checkPermissions(req.user, user._id);
    res.status(StatusCodes.OK).json({user});
};
const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({user: req.user}); // not qurring db
};
       
        // //update user with user.save() uses the pre('save') hook so it hash the password again even thogh the password is not changed
const updateUser = async (req, res) => {
    const {email, name} = req.body;

    if (!name || !email) {
        throw new CustomError.BadRequestError('Please provide both values');
    }
    const user = await User.findOne({_id: req.user.userId});
    user.email = email;
    user.name = name;  
    
    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});

    res.status(StatusCodes.OK).json({user: tokenUser});

    // res.send('Update User');
    // res.send(req.body);
};
 //update user with findOneAndUpdate
// const updateUser = async (req, res) => {
//     const {email, name} = req.body;

//     if (!name || !email) {
//         throw new CustomError.BadRequestError('Please provide both values');
//     }
//     const user = await User.findOneAndUpdate(
//         {_id: req.user.userId}, 
//         {name, email}, 
//         {new: true, runValidators: true}
//     );

//     const tokenUser = createTokenUser(user);
//     attachCookiesToResponse({res, user: tokenUser});

//     res.status(StatusCodes.OK).json({user: tokenUser});

//     // res.send('Update User');
//     // res.send(req.body);
// };
const updateUserPassword = async (req, res) => {
   const { oldPassword, newPassword } = req.body;

   if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError('Please provide both values');   
    }
    const user = await User.findOne({_id: req.user.userId});

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    user.password = newPassword;

    await user.save();

    res.status(StatusCodes.OK).json({msg: 'Password Updated'});

};

module.exports = {getAllUsers, getSingleUser, showCurrentUser, updateUser, updateUserPassword};