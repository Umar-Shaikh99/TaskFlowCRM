const jsonServer = require('json-server')
const fs = require('fs')
const path = require('path')

const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)
server.use(jsonServer.bodyParser)

// Custom CORS setup to prevent any preflight blocks
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  next()
})

// POST /auth/login
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'))
    const user = db.users.find((u) => u.email === email && u.password === password)

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'This user account is inactive' })
    }

    // Generate mock base64 token representing a JWT
    const tokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      exp: Date.now() + 60 * 60 * 1000, // 1 hour expiration
    }

    const refreshPayload = {
      sub: user.id,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days expiration
    }

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64')
    const refreshToken = Buffer.from(JSON.stringify(refreshPayload)).toString('base64')

    // Clean user object for client payload
    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    }

    // Record login activity log
    const activity = {
      id: String(Date.now()),
      type: 'auth_login',
      description: `${user.name} logged into the platform`,
      userId: user.id,
      createdAt: new Date().toISOString(),
    }
    db.activities.push(activity)
    fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2))

    return res.json({
      token,
      refreshToken,
      user: safeUser,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error during authentication' })
  }
})

// POST /auth/refresh
server.post('/auth/refresh', (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' })
  }

  try {
    const payload = JSON.parse(Buffer.from(refreshToken, 'base64').toString('utf8'))

    if (payload.exp < Date.now()) {
      return res.status(401).json({ message: 'Refresh token expired' })
    }

    const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'))
    const user = db.users.find((u) => u.id === payload.sub)

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const tokenPayload = {
      sub: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      exp: Date.now() + 60 * 60 * 1000, // 1 hour expiration
    }

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64')

    return res.json({ token })
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }
})

// Middleware to protect API routes (Validate Bearer token)
server.use((req, res, next) => {
  // Allow public options check
  if (req.method === 'OPTIONS') {
    return next()
  }

  // Bypass authentication for logins and refresh routes
  if (req.path === '/auth/login' || req.path === '/auth/refresh') {
    return next()
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization token required' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf8'))

    if (payload.exp < Date.now()) {
      return res.status(401).json({ message: 'Authorization token expired' })
    }

    req.user = payload
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid authorization token' })
  }
})

// Custom Activity Auditing Middleware
server.use((req, res, next) => {
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)
  if (!isWrite) {
    return next()
  }

  // Bypass authentication for logins and refresh routes
  if (req.path === '/auth/login' || req.path === '/auth/refresh') {
    return next()
  }

  // Intercept the response send method to log operations upon success
  const originalSend = res.send
  res.send = function (body) {
    originalSend.apply(res, arguments)

    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const db = JSON.parse(fs.readFileSync(path.join(__dirname, 'db.json'), 'utf8'))
        const user = req.user || { sub: 'guest', name: 'System User' }
        let parsedBody = {}
        try {
          parsedBody = JSON.parse(body)
        } catch (_) {}

        let type = 'general_mutation'
        let description = ''

        if (req.path.startsWith('/tasks')) {
          if (req.method === 'POST') {
            type = 'task_created'
            description = `Task '${parsedBody.title || 'Untitled'}' was created by ${user.name}`
          } else if (req.method === 'PATCH' || req.method === 'PUT') {
            const isCompleted = parsedBody.status === 'DONE'
            type = isCompleted ? 'task_completed' : 'task_updated'
            description = isCompleted
              ? `Task '${parsedBody.title || 'Untitled'}' was completed by ${user.name}`
              : `Task '${parsedBody.title || 'Untitled'}' was updated by ${user.name}`
          } else if (req.method === 'DELETE') {
            type = 'task_deleted'
            description = `A task was deleted by ${user.name}`
          }
        } else if (req.path.startsWith('/users')) {
          if (req.method === 'POST') {
            type = 'user_added'
            description = `New team member ${parsedBody.name || 'Unknown'} was invited by ${user.name}`
          } else if (req.method === 'PATCH' || req.method === 'PUT') {
            type = 'user_updated'
            description = `User profile for ${parsedBody.name || 'Unknown'} was updated by ${user.name}`
          } else if (req.method === 'DELETE') {
            type = 'user_deleted'
            description = `A user account was deleted by ${user.name}`
          }
        }

        if (description) {
          const activity = {
            id: String(Date.now()),
            type,
            description,
            userId: String(user.sub),
            createdAt: new Date().toISOString(),
          }
          db.activities.push(activity)
          fs.writeFileSync(path.join(__dirname, 'db.json'), JSON.stringify(db, null, 2))
        }
      } catch (err) {
        console.error('Failed to log activity:', err)
      }
    }
  }

  next()
})

// Bind JSON Server router
server.use(router)

const PORT = 3001
server.listen(PORT, () => {
  console.log(`JSON Server with Mock JWT Middleware started on PORT :${PORT}`)
  console.log(`http://localhost:${PORT}`)
})
