import mongoose from 'mongoose';

const deepPopulate = require('mongoose-deep-populate')(mongoose);
const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

export const profileSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  fullName: String
});

const userSchema = mongoose.Schema({
  username: String,
  role: String,
  isActive: Boolean,
  email: String,
  password: String,
  profile: {
    type: profileSchema,
    default: null
  },
  id: {
    type: Number,
    required: true,
    unique: true
  }
});
userSchema.plugin(autoIncrement.plugin, {
  model: 'User',
  field: 'id',
  startAt: 1
});
userSchema.plugin(deepPopulate);
export default mongoose.model('User', userSchema);
