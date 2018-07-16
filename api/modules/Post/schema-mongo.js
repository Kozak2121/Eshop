import mongoose from 'mongoose';

const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const postSchema = mongoose.Schema({
  title: String,
  content: String,
  comments: [Number],
  id: {
    type: Number,
    required: true,
    unique: true
  }
});
postSchema.plugin(autoIncrement.plugin, {
  model: 'Post',
  field: 'id',
  startAt: 1
});
export default mongoose.model('Post', postSchema);
