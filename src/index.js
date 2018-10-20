import {GraphQLServer} from 'graphql-yoga'
import uuidv4 from 'uuid/v4'

//demo data
let users = [
  {
    id: '1',
    name: 'thai',
    email: 'thai@gmail.com'
  },
  {
    id: '2',
    name: 'evan',
    email: 'evan@gmail.com',
    age: 99
  },
  {
    id: '3',
    name: 'emily',
    email: 'emily@gmail.com',
    age: 20
  }
]

let posts = [
  {
    id: '1',
    title: 'hellow world',
    body: 'sup my dogf',
    published: true,
    author: '1'
  },
  {
    id: '2',
    title: 'burn it down',
    body: 'death to the npcs',
    published: false,
    author: '3'
  },
  {
    id: '3',
    title: 'bring it up',
    body: 'raise from the ashes',
    published: true,
    author: '3'
  }
]

let comments = [
  {id: 'rf234', text: 'this is a stupid comment', post: '1', author: '2'},
  {id: 'r423f', text: 'your the best in the world', post: '2', author: '2'},
  {id: 'f34', text: 'you know it', post: '3', author: '1'},
  {id: 'wqr32', text: 'last comment ever in the univierse', post: '1', author: '3'}
]

const typeDefs = `
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query: String): [Comment!]!
    me: User!
    post: Post!
  }

  type Mutation {
    createUser(data: CreateUserInput!): User!
    createPost(data: CreatePostInput!): Post!
    createComment(data: CreateCommentInput!): Comment!
    deleteUser(id: String!): User!
    deletePost(id: String!): Post!
    deleteComment(id: String!): Comment!
  }

  input CreateUserInput {
    name: String!,
    email: String!,
    age: Int
  }

  input CreatePostInput {
    title: String!,
    body: String!,
    published: Boolean!,
    author: String!,    
  }

  input CreateCommentInput {
    text: String!,
    post: String!,
    author: String!
  }

  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }

  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`

const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return users
      }
      return users.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase())
      })
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return posts
      }
      return posts.filter(post => {
        return (
          post.title.toLowerCase().includes(args.query.toLowerCase()) ||
          post.body.toLowerCase().includes(args.query.toLowerCase())
        )
      })
    },
    comments(parent, args, ctx, info) {
      if (!args.query) {
        return comments
      }
      return comments.filter(comment => {
        return comment.text.toLowerCase().includes(args.query.toLowerCase())
      })
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
  },
  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some(user => user.email === args.data.email)
      if (emailTaken) {
        throw new Error('email taken')
      }
      const user = {
        id: uuidv4(),
        ...args.data
      }
      users.push(user)
      return user
    },
    createPost(parent, args, ctx, info) {
      const userExist = users.some(user => user.id === args.data.author)
      if (!userExist) {
        throw new Error('User not found')
      }
      const post = {
        id: uuidv4(),
        ...args.data
      }
      posts.push(post)
      return post
    },
    createComment(parent, args, ctx, info) {
      const userExist = users.some(user => user.id === args.data.author)
      const postExist = posts.some(post => post.id === args.data.post && post.published)
      if (!userExist) {
        throw new Error('user not found')
      }
      if (!postExist) {
        throw new Error('post not found')
      }
      const comment = {
        id: uuidv4(),
        ...args.data
      }
      comments.push(comment)
      return comment
    },
    deleteUser(parent, args, ctx, info) {
      const userIndex = users.findIndex(user => user.id === args.id)
      if (userIndex === -1) {
        throw new Error('could not find user')
      }
      const deletedUser = users.splice(userIndex, 1)
      posts = posts.filter(post => {
        const match = post.author === args.id
        if (match) {
          comments = comments.filter(comment => comment.post !== post.id)
        }
        return !match
      })
      comments = comments.filter(comment => comment.author !== args.id)
      return deletedUser[0]
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = posts.findIndex(post => post.id === args.id)
      if (postIndex === -1) {
        throw new Error('could not find post')
      }
      const deletedPost = posts.splice(postIndex, 1)
      comments = comments.filter(comment => comment.post !== args.id)
      return deletedPost[0]
    },
    deleteComment(parent, args, ctx, info) {
      const commentIndex = comments.findIndex(comment => comment.id === args.id)
      if (commentIndex === -1) {
        throw new Error('could not find comment')
      }
      return comments.splice(commentIndex, 1)[0]
    }
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author)
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.post === parent.id)
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter(post => post.author === parent.id)
    },
    comments(parent, args, ctx, info) {
      return comments.filter(comment => comment.author === parent.id)
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return users.find(user => user.id === parent.author)
    },
    post(parent, args, ctx, info) {
      return posts.find(post => post.id === parent.post)
    }
  }
}

const server = new GraphQLServer({
  typeDefs,
  resolvers
})

server.start(() => {
  console.log('the server is up')
})
