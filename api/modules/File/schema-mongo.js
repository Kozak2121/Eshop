import mongoose from 'mongoose';

const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const fileSchema = mongoose.Schema({
  name: String,
  type: String,
  size: Number,
  path: String,
  id: {
    type: Number,
    required: true,
    unique: true
  }
});

fileSchema.plugin(autoIncrement.plugin, {
  model: 'File',
  field: 'id',
  startAt: 1
});
export default mongoose.model('File', fileSchema);
