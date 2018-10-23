const Query = {
  users(parent, args, {prisma}, info) {
    const opArgs = {}
    if (args.query) {
      opArgs.where = {
        OR: [
          {
            name_contains: args.query
          },
          {
            email_contains: args.query
          }
        ]
      }
    }
    return prisma.query.users(opArgs, info)
  },
  posts(parent, args, {prisma}, info) {
    const opArgs = {}
    if (args.query) {
      opArgs.where = {
        OR: [
          {
            title_contains: args.query
          },
          {
            body_contains: args.query
          }
        ]
      }
    }
    return prisma.query.posts(opArgs, info)
  },
  comments(parent, args, {prisma}, info) {
    const opArgs = {}
    if (args.query) {
      opArgs.where = {
        text_contains: args.query
      }
    }
    return prisma.query.comments(opArgs, info)
  },
  me() {
    return {
      id: '12wf',
      name: 'Thai',
      email: 'thai@gmail.com',
      age: 34
    }
  },
  post() {
    return {
      id: 'rwf32',
      title: 'first post',
      body: 'whats up doc',
      published: false
    }
  }
}

export default Query
