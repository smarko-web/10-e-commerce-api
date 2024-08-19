const Users = require('../models/User')
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {attachCookiesToResponse, createTokenUser} = require('../utils');

const register = async (req, res) => {
    const {email, name, password} = req.body;
    const existingUser = await Users.findOne({email});
    if (existingUser) {
        throw new CustomError.BadRequestError('Email already exists');
    }

        // first register user is an admin
    const isFirstAccount = await Users.countDocuments({}) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await Users.create({name, email, password, role });

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});

    res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
    const {email, password} = req.body;

    if (!email || !password) {
        throw new CustomError.BadRequestError('There are empty field(s)');   
    }
    const user = await Users.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid Credential(s)');
    }
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invalid Credential(s)');
    }
    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res, user: tokenUser});
    res.status(StatusCodes.OK).json({ user: tokenUser });
    // res.send('login user');
};
const logout = async (req, res) => {
    res.cookie('token', 'logout', {
        httpOnly: true,
        expires: new Date(Date.now()),       
    });
    res.status(StatusCodes.OK).json({ msg: 'user logged out successfully!'}); // just for dev
};

module.exports = {register,login,logout} 