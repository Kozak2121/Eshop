import mongoose from 'mongoose';

const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const commentSchema = mongoose.Schema({
  content: String,
  postId: Number,
  id: {
    type: Number,
    required: true,
    unique: true
  }
});

commentSchema.plugin(autoIncrement.plugin, {
  model: 'Comment',
  field: 'id',
  startAt: 1
});
export default mongoose.model('Comment', commentSchema);
