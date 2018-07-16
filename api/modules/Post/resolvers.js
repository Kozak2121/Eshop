import { withFilter } from 'graphql-subscriptions';

export default pubsub => ({
  Query: {
    async posts(obj, { limit, offset }, context) {
      const edgesArray = [];
      const posts = await context.Post.postsPagination(limit, offset);
      posts.forEach(post => {
        edgesArray.push({
          cursor: post.id,
          node: {
            id: post.id,
            title: post.title,
            content: post.content
          }
        });
      });
      const endCursor =
        edgesArray.length > 0 ? edgesArray[edgesArray.length - 1].cursor : 0;

      const values = await Promise.all([
        context.Post.getTotal(),
        context.Post.getNextPageFlag(endCursor)
      ]);
      return {
        totalCount: values[0],
        edges: edgesArray,
        pageInfo: {
          endCursor,
          hasNextPage: values[1] > 0
        }
      };
    },
    post(obj, { id }, context) {
      return context.Post.post(id);
    }
  },
  Post: {
    comments({ id }, args, context) {
      return context.loaders.getCommentsForPostIds.load(id);
    }
  },
  Mutation: {
    async addPost(obj, { input }, context) {
      const oldPost = await context.Post.addPost(input);
      const post = await context.Post.post(oldPost.id);
      // publish for post list
      pubsub.publish('postsUpdated', {
        postsUpdated: {
          mutation: 'CREATED',
          id: post.id,
          node: post
        }
      });
      return post;
    },
    async deletePost(obj, { id }, context) {
      const post = await context.Post.post(id);
      const isDeleted = await context.Post.deletePost(id);
      if (isDeleted) {
        // publish for post list
        pubsub.publish('postsUpdated', {
          postsUpdated: {
            mutation: 'DELETED',
            id,
            node: post
          }
        });
        return { id: post.id };
      }
      return { id: null };
    },
    async editPost(obj, { input }, context) {
      await context.Post.editPost(input);
      const post = await context.Post.post(input.id);
      // publish for post list
      pubsub.publish('postsUpdated', {
        postsUpdated: {
          mutation: 'UPDATED',
          id: post.id,
          node: post
        }
      });
      // publish for edit post page
      pubsub.publish('postUpdated', { postUpdated: post });
      return post;
    },
    async addComment(obj, { input }, context) {
      const oldComment = await context.Post.addComment(input);
      const comment = await context.Post.getComment(oldComment.id);
      // publish for edit post page
      pubsub.publish('commentUpdated', {
        commentUpdated: {
          mutation: 'CREATED',
          id: comment.id,
          postId: input.postId,
          node: comment
        }
      });
      return comment;
    },
    async deleteComment(obj, { input: { id, postId } }, context) {
      await context.Post.deleteComment(id);
      // publish for edit post page
      pubsub.publish('commentUpdated', {
        commentUpdated: {
          mutation: 'DELETED',
          id,
          postId,
          node: null
        }
      });
      return { id };
    },
    async editComment(obj, { input }, context) {
      await context.Post.editComment(input);
      const comment = await context.Post.getComment(input.id);
      // publish for edit post page
      pubsub.publish('commentUpdated', {
        commentUpdated: {
          mutation: 'UPDATED',
          id: input.id,
          postId: input.postId,
          node: comment
        }
      });
      return comment;
    }
  },
  Subscription: {
    postsUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('postsUpdated'),
        (payload, variables) => variables.endCursor <= payload.postsUpdated.id
      )
    },
    postUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('postUpdated'),
        (payload, variables) => payload.postUpdated.id === variables.id
      )
    },

    commentUpdated: {
      subscribe: withFilter(
        () => pubsub.asyncIterator('commentUpdated'),
        (payload, variables) =>
          payload.commentUpdated.postId === variables.postId
      )
    }
  }
});
