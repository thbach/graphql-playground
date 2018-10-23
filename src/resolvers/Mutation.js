import uuidv4 from 'uuid/v4'

const Mutation = {
  async createUser(parent, args, {prisma}, info) {
    return prisma.mutation.createUser({data: args.data}, info)
  },
  async createPost(parent, args, {prisma}, info) {
    return prisma.mutation.createPost(
      {
        data: {
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          author: {
            connect: {
              id: args.data.author
            }
          }
        }
      },
      info
    )
  },
  async createComment(parent, args, {prisma}, info) {
    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          post: {connect: {id: args.data.post}},
          author: {connect: {id: args.data.author}}
        }
      },
      info
    )
  },
  async deleteUser(parent, args, {prisma}, info) {
    return prisma.mutation.deleteUser({where: {id: args.id}}, info)
  },
  deletePost(parent, args, {db, pubSub}, info) {
    const postIndex = db.posts.findIndex(post => post.id === args.id)
    if (postIndex === -1) {
      throw new Error('could not find post')
    }
    const [post] = db.posts.splice(postIndex, 1)
    db.comments = db.comments.filter(comment => comment.post !== args.id)
    if (post.published) {
      pubSub.publish('post', {
        post: {
          mutation: 'DELETED',
          data: post
        }
      })
    }
    return post
  },
  deleteComment(parent, args, {db, pubSub}, info) {
    const commentIndex = db.comments.findIndex(comment => comment.id === args.id)
    if (commentIndex === -1) {
      throw new Error('could not find comment')
    }
    const [comment] = db.comments.splice(commentIndex, 1)
    pubSub.publish(`comment ${comment.post}`, {
      comment: {
        mutation: 'DELETED',
        data: comment
      }
    })
    return comment
  },
  async updateUser(parent, args, {prisma}, info) {
    return prisma.mutation.updateUser(
      {
        where: {id: args.id},
        data: args.data
      },
      info
    )
  },
  updatePost(parent, args, {db, pubSub}, info) {
    const {id, data} = args
    const post = db.posts.find(post => post.id === id)
    const originalPost = {...post}
    if (!post) {
      throw new Error('post not found')
    }
    if (typeof data.title === 'string') {
      post.title = data.title
    }
    if (typeof data.body === 'string') {
      post.body = data.body
    }
    if (typeof data.published === 'boolean') {
      post.published = data.published
      if (originalPost.published && !post.published) {
        pubSub.publish('post', {
          post: {
            mutation: 'DELETED',
            data: originalPost
          }
        })
      } else if (!originalPost.publish && post.published) {
        pubSub.publish('post', {
          post: {
            mutation: 'CREATED',
            data: post
          }
        })
      }
    } else if (post.published) {
      pubSub.publish('post', {
        post: {
          mutation: 'UPDATED',
          data: post
        }
      })
    }
    return post
  },
  updateComment(parent, args, {db, pubSub}, info) {
    const {id, data} = args
    const comment = db.comments.find(comment => comment.id === id)
    if (!comment) {
      throw new Error('comment not found')
    }
    if (typeof data.text === 'string') {
      comment.text = data.text
      pubSub.publish(`comment ${comment.post}`, {
        comment: {
          mutation: 'UPDATED',
          data: comment
        }
      })
    }
    return comment
  }
}

export default Mutation
