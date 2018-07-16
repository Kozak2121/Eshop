/* import _ from 'lodash';
import Comment from './schema-mongo';

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
}; */

export default class ModelClass {
  /* postsPagination(limit, offset) {
    let query = {};
    if (offset > 0) {
      query = {id: {$lt: offset}};
    }
    return Post.find(query, {}, {
      limit: limit,
      sort: {id: -1}
    });
  }

  getTotal() {
    return Post.count({});
  }

  getNextPageFlag( id) {
    return Post.count({id: {$lt: id}});
  }

  addPost({ title, content }) {
    const post = new Post({
      title,
      content,
      createdAt: new Date()
    });
    return post.save();
  }

  post(id) {
    return Post.findOne({id});
  }

    async getCommentsForPostIds(postIds) {
      let res = Comment.find(query, {}, {
        limit: limit,
        sort: {id: -1}
      });


      let res = await knex
        .select('id', 'content', 'post_id AS postId')
        .from('comment')
        .whereIn('post_id', postIds);

      return orderedFor(res, postIds, 'postId', false);
    }

    deletePost(id) {
      return knex('post')
        .where('id', '=', id)
        .del();
    }

    editPost({ id, title, content }) {
      return knex('post')
        .where('id', '=', id)
        .update({
          title: title,
          content: content
        });
    }

    addComment({ content, postId }) {
      return knex('comment')
        .insert({ content, post_id: postId })
        .returning('id');
    }

    getComment(id) {
      return knex
        .select('id', 'content')
        .from('comment')
        .where('id', '=', id)
        .first();
    }

    deleteComment(id) {
      return knex('comment')
        .where('id', '=', id)
        .del();
    }

    editComment({ id, content }) {
      return knex('comment')
        .where('id', '=', id)
        .update({
          content: content
        });
    } */
}
