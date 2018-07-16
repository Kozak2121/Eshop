/* eslint-disable prefer-const */

import _ from 'lodash';
import Post from './schema-mongo';
import Comment from '../Comment/schema-mongo';

const orderedFor = (rows, collection, field, singleObject) => {
  // return the rows ordered for the collection
  const inGroupsOfField = _.groupBy(rows, field);
  return collection.map(element => {
    const elementArray = inGroupsOfField[element];
    if (elementArray) {
      return singleObject ? elementArray[0] : elementArray;
    }
    return singleObject ? {} : [];
  });
};

export default class ModelClass {
  postsPagination(limit, offset) {
    let query = {};
    if (offset > 0) {
      query = { id: { $lt: offset } };
    }
    return Post.find(
      query,
      {},
      {
        limit,
        sort: { id: -1 }
      }
    );
  }

  getTotal() {
    return Post.count({});
  }

  getNextPageFlag(id) {
    return Post.count({ id: { $lt: id } });
  }

  addPost({ title, content }) {
    return new Post({
      title,
      content,
      createdAt: new Date()
    }).save();
  }

  post(id) {
    return Post.findOne({ id });
  }

  async getCommentsForPostIds(postIds) {
    const res = await Comment.find(
      { postId: { $in: postIds } },
      {},
      {
        sort: { id: -1 }
      }
    );
    return orderedFor(res, postIds, 'postId', false);
  }

  deletePost(id) {
    return Post.remove({ id });
  }

  editPost({ id, title, content }) {
    return Post.findOneAndUpdate(
      { id },
      {
        $set: {
          title,
          content
        }
      }
    );
  }

  addComment({ content, postId }) {
    return new Comment({
      content,
      postId
    }).save();
  }

  getComment(id) {
    return Comment.findOne({ id });
  }

  deleteComment(id) {
    return Comment.remove({ id });
  }

  editComment({ id, content }) {
    return Comment.findOneAndUpdate(
      { id },
      {
        $set: {
          content
        }
      }
    );
  }
}
