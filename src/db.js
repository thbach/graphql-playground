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
  },
  {
    id: '4',
    title: 'herew we go again',
    body: 'ground hog fay',
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

const db = {
  users,
  posts,
  comments
}

export default db
