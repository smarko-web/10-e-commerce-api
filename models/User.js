const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Plese provide name'],
        minlength: 2,
        maxlength: 50,
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'Please provide email'],
        validate: {
            validator: validator.isEmail,
            message: 'Please provide valid email',
        },
        },
    password:{
            type: String,
            required: [true, 'Please provide password'],
            minlength: 4,
            
        },
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    }
});
UserSchema.pre('save', async function(){
    // console.log(this.modifiedPaths());
    if (!this.isModified('password')) return; //not hash password if not changed
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function(inputPassword) {
    const isMatch = await bcrypt.compare(inputPassword, this.password);
    return isMatch;
}

mongoose.set('strictQuery', true);

module.exports = mongoose.model('User', UserSchema);
