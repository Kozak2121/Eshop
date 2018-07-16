/* eslint-disable prefer-const */
import { expect } from 'chai';

import { getApollo } from '../../testHelpers/integrationSetup';
import POSTS_QUERY from '../../../client/modules/Post/graphql/PostsQuery.graphql';
import POST_QUERY from '../../../client/modules/Post/graphql/PostQuery.graphql';
import ADD_POST from '../../../client/modules/Post/graphql/AddPost.graphql';
import EDIT_POST from '../../../client/modules/Post/graphql/EditPost.graphql';
import DELETE_POST from '../../../client/modules/Post/graphql/DeletePost.graphql';
import POSTS_SUBSCRIPTION from '../../../client/modules/Post/graphql/PostsSubscription.graphql';

describe('Post and comments example API works', () => {
  let apollo;
  let endCursor = 0;
  let totalCount = 0;
  beforeAll(() => {
    apollo = getApollo();
  });
  it('Publishes post on add', done => {
    apollo.mutate({
      mutation: ADD_POST,
      variables: {
        input: {
          title: 'New post 1',
          content: 'New post content 1'
        }
      }
    });
    let subscription;
    subscription = apollo
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { endCursor: 0 }
      })
      .subscribe({
        next(data) {
          endCursor = data.data.postsUpdated.node.id;
          expect(data.data.postsUpdated).to.deep.equal({
            mutation: 'CREATED',
            node: {
              id: endCursor,
              title: 'New post 1',
              content: 'New post content 1',
              __typename: 'Post'
            },
            __typename: 'UpdatePostPayload'
          });
          subscription.unsubscribe();
          done();
        }
      });
  });

  it('Query post list works', async () => {
    const result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 1, offset: 0 }
    });
    endCursor = result.data.posts.pageInfo.endCursor;
    totalCount = result.data.posts.totalCount;
    expect(result.data).to.deep.equal({
      posts: {
        totalCount,
        edges: [
          {
            cursor: endCursor,
            node: {
              id: endCursor,
              title: 'New post 1',
              content: 'New post content 1',
              __typename: 'Post'
            },
            __typename: 'PostEdges'
          }
        ],
        pageInfo: {
          endCursor,
          hasNextPage: true,
          __typename: 'PostPageInfo'
        },
        __typename: 'Posts'
      }
    });
  });

  it('Adding post works', async () => {
    const result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 1, offset: 0 },
      fetchPolicy: 'network-only'
    });
    expect(result.data.posts).to.have.property('totalCount', totalCount);
    expect(result.data.posts).to.have.nested.property(
      'edges[0].node.title',
      'New post 1'
    );
    expect(result.data.posts).to.have.nested.property(
      'edges[0].node.content',
      'New post content 1'
    );
  });

  it('Query single post with comments works', async () => {
    const result = await apollo.query({
      query: POST_QUERY,
      variables: { id: endCursor }
    });
    expect(result.data).to.deep.equal({
      post: {
        id: endCursor,
        title: 'New post 1',
        content: 'New post content 1',
        __typename: 'Post',
        comments: []
      }
    });
  });

  it('Publishes post on update', done => {
    apollo.mutate({
      mutation: EDIT_POST,
      variables: {
        input: {
          id: endCursor,
          title: 'New post 2',
          content: 'New post content 2'
        }
      }
    });

    let subscription;

    subscription = apollo
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { endCursor: 10 }
      })
      .subscribe({
        next(data) {
          expect(data.data.postsUpdated).to.deep.equal({
            mutation: 'UPDATED',
            node: {
              id: endCursor,
              title: 'New post 2',
              content: 'New post content 2',
              __typename: 'Post'
            },
            __typename: 'UpdatePostPayload'
          });
          subscription.unsubscribe();
          done();
        }
      });
  });

  it('Updating post works', async () => {
    const result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 1, after: 0 },
      fetchPolicy: 'network-only'
    });
    expect(result.data.posts).to.have.property('totalCount', totalCount);
    expect(result.data.posts).to.have.nested.property(
      'edges[0].node.title',
      'New post 2'
    );
    expect(result.data.posts).to.have.nested.property(
      'edges[0].node.content',
      'New post content 2'
    );
  });
  it('Publishes post on removal', done => {
    apollo.mutate({
      mutation: DELETE_POST,
      variables: { id: endCursor }
    });

    let subscription;

    subscription = apollo
      .subscribe({
        query: POSTS_SUBSCRIPTION,
        variables: { endCursor: 10 }
      })
      .subscribe({
        next(data) {
          expect(data.data.postsUpdated).to.deep.equal({
            mutation: 'DELETED',
            node: {
              id: endCursor,
              title: 'New post 2',
              content: 'New post content 2',
              __typename: 'Post'
            },
            __typename: 'UpdatePostPayload'
          });
          totalCount -= 1;
          endCursor -= 1;
          subscription.unsubscribe();
          done();
        }
      });
  });

  it('Deleting post works', async () => {
    const result = await apollo.query({
      query: POSTS_QUERY,
      variables: { limit: 2, after: 0 },
      fetchPolicy: 'network-only'
    });
    expect(result.data.posts).to.have.property('totalCount', totalCount);
    expect(result.data.posts).to.have.nested.property(
      'edges[0].node.title',
      'New post 1'
    );
    expect(result.data.posts).to.have.nested.property(
      'edges[0].node.content',
      'New post content 1'
    );
  });
});
