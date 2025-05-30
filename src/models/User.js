// const mongoose = require('mongoose');
import mongoose from 'mongoose';
// import validator from 'validator';
// import bcrypt from 'bcryptjs';
// const validator = require('validator');
// const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  id:{
    type: Number,
    unique: true,
    required: [true, 'Please provide id'],
    // minlength: 3,
    // maxlength: 500,
  },
  name: {
    type: String,
    required: [true, 'Please provide name'],
    minlength: 3,
    maxlength: 500,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    // validate: {
      // validator: validator.isEmail,
      // message: 'Please provide valid email',
    // },
  },
});

// UserSchema.pre('save', async function () {
//   // console.log(this.modifiedPaths());
//   // console.log(this.isModified('name'));
//   if (!this.isModified('password')) return;
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });

// UserSchema.methods.comparePassword = async function (canditatePassword) {
//   const isMatch = await bcrypt.compare(canditatePassword, this.password);
//   return isMatch;
// };

// module.exports = mongoose.model('User', UserSchema);

const User = mongoose.model('User', UserSchema);
export default User;