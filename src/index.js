import {GraphQLServer} from 'graphql-yoga'

//demo data
const users = [
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

const posts = [
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

const comments = [
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
