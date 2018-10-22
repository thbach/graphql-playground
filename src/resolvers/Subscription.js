const Subscription = {
  comment: {
    subscribe(parent, args, {pubSub, db}, info) {
      const {postId} = args
      const post = db.posts.find(post => post.id === postId && post.published)
      if (!post) {
        throw new Error('post not founbd')
      }
      return pubSub.asyncIterator(`comment ${postId}`)
    }
  },
  post: {
    subscribe(parent, args, {pubSub}, info) {
      return pubSub.asyncIterator('post')
    }
  }
}

export default Subscription
