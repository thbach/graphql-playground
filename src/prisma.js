import {Prisma} from 'prisma-binding'
import {fragmentReplacements} from './resolvers/index'

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: process.env.PRISMA_SECRET,
  fragmentReplacements
})

export default prisma

// const createPostForUser = async (authorId, data) => {
//   const userExist = await prisma.exists.User({
//     id: authorId
//   })

//   if (!userExist) {
//     throw new Error('user not found')
//   }

//   const post = await prisma.mutation.createPost(
//     {
//       data: {
//         ...data,
//         author: {
//           connect: {
//             id: authorId
//           }
//         }
//       }
//     },
//     '{author {id name email posts {id title published}}}'
//   )

//   return post.author
// }

// const updatePostForUser = async (postId, data) => {
//   const postExist = await prisma.exists.Post({
//     id: postId
//   })

//   if (!postExist) {
//     throw new Error('post not found')
//   }

//   const post = await prisma.mutation.updatePost(
//     {
//       where: {
//         id: postId
//       },
//       data
//     },
//     `{author {id name email posts {id title published}}}`
//   )

//   return post.author
// }

// createPostForUser('cjnjtaift00100b773i3fhj2k', {
//   title: 'great books to read5',
//   body: 'art of war',
//   published: true
// })
//   .then(data => {
//     console.log(JSON.stringify(data, undefined, 2))
//   })
//   .catch(e => {
//     console.log(e.message)
//   })

// updatePostForUser('c/jnjtmnoo00280b77fh8n59dc', {title: 'updated post', published: false})
//   .then(data => {
//     console.log(JSON.stringify(data, undefined, 2))
//   })
//   .catch(e => {
//     console.log(e.message)
//   })
