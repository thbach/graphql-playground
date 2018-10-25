import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import getUserId from '../utils/getUserId'

const Mutation = {
  async createUser(parent, args, {prisma}, info) {
    if (args.data.password.length < 8) {
      throw new Error('must be 8 characters or longer')
    }

    const password = await bcrypt.hash(args.data.password, 10)

    const user = prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    })

    return {
      user,
      token: jwt.sign({userId: user.id}, process.env.JWT_SECRET)
    }
  },
  async login(parent, args, {prisma}, info) {
    const [user] = await prisma.query.users({where: {email: args.data.email}})
    if (!user) {
      throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password)
    if (!isMatch) {
      throw new Error('unable to login')
    }

    return {
      user,
      token: jwt.sign({userId: user.id}, process.env.JWT_SECRET)
    }
  },
  async createPost(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    return prisma.mutation.createPost(
      {
        data: {
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          author: {
            connect: {
              id: userId
            }
          }
        }
      },
      info
    )
  },
  async createComment(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          post: {connect: {id: args.data.post}},
          author: {connect: {id: userId}}
        }
      },
      info
    )
  },
  async deleteUser(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    return prisma.mutation.deleteUser({where: {id: userId}}, info)
  },
  async deletePost(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    const postExist = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExist) {
      throw new Error('unable to delete post')
    }
    return prisma.mutation.deletePost({where: {id: args.id}}, info)
  },
  async deleteComment(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    const commentExist = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })
    if (!commentExist) {
      throw new Error('unable to delete comment')
    }
    return prisma.mutation.deleteComment({where: {id: args.id}}, info)
  },
  async updateUser(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)

    return prisma.mutation.updateUser(
      {
        where: {id: userId},
        data: args.data
      },
      info
    )
  },
  async updatePost(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    const postExist = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExist) {
      throw new Error('could not update post')
    }

    return prisma.mutation.updatePost(
      {
        where: {id: args.id},
        data: args.data
      },
      info
    )
  },
  async updateComment(parent, args, {prisma, request}, info) {
    const userId = getUserId(request)
    const commentExist = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })
    if (!commentExist) {
      throw new Error('could not update comment')
    }
    return prisma.mutation.updateComment(
      {
        where: {id: args.id},
        data: args.data
      },
      info
    )
  }
}

export default Mutation
