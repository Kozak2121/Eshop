import product from './Product';
import post from './Post';
import comment from './Comment';
import user from './User';
import file from './File';
import Feature from './connector';

export default new Feature(user, file, post, product, comment);
