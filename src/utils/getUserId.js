import jwt from 'jsonwebtoken'

const getUserId = (request, requireAuth = true) => {
  const header = request.request ? request.request.headers.authorization : request.connection.context.Authorization

  if (header) {
    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return decoded.userId
  }
  if (requireAuth) {
    throw new Error('authentication required')
  }

  return null
}

export default getUserId

// const dummy = async () => {
//   const email = 'evan@gmail.com'
//   const password = 'pass12345'
//   const hashedPassword = '$2a$10$oWvsH9hYTtQ9Jkci5/fXj.iIQgthzOHjal/6IOTmDVPw/ZePJ7k2i'
//   const isMatch = await bcrypt.compare(password, hashedPassword)
//   console.log(isMatch)
// }
//dummy()
