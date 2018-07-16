import mongoose from 'mongoose';

const autoIncrement = require('mongoose-auto-increment');

autoIncrement.initialize(mongoose);

const productPropertySchema = mongoose.Schema({
  productProperty: Number,
  propertyValue: String,
  unit: Number
});

const productSchema = mongoose.Schema({
  title: String,
  description: String,
  shortDescription: String,
  price: Number,
  sku: String,
  properties: [productPropertySchema],
  createdAt: Date,
  id: Number
});

productSchema.plugin(autoIncrement.plugin, {
  model: 'Product',
  field: 'id',
  startAt: 1
});
export default mongoose.model('Product', productSchema);
