import {Prisma} from 'prisma-binding'

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466'
})

const createPostForUser = async (authorId, data) => {
  const post = await prisma.mutation.createPost(
    {
      data: {
        ...data,
        author: {
          connect: {
            id: authorId
          }
        }
      }
    },
    '{id}'
  )
  const user = await prisma.query.user(
    {
      where: {
        id: authorId
      }
    },
    '{id name email posts {id title published}}'
  )
  return user
}

const updatePostForUser = async (postId, data) => {
  const post = await prisma.mutation.updatePost(
    {
      where: {
        id: postId
      },
      data
    },
    `{id author {id}}`
  )

  const user = await prisma.query.user(
    {
      where: {
        id: post.author.id
      }
    },
    '{id name email posts {id title published}}'
  )
  return user
}

// createPostForUser('cjnjtaift00100b773i3fhj2k', {
//   title: 'great books to read3',
//   body: 'art of war',
//   published: true
// })
//   .then(data => {
//     console.log(JSON.stringify(data, undefined, 2))
//   })
//   .catch(e => {
//     console.log(e)
//   })

// updatePostForUser('cjnjtmnoo00280b77fh8n59dc', {title: 'updated post', published: false})
//   .then(data => {
//     console.log(JSON.stringify(data, undefined, 2))
//   })
//   .catch(e => {
//     console.log(e)
//   })
