const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const rooms = {}
let id = 0
const mockUsers = require('./mockUsers.json').map((user) => {
  user.id = (id++).toString()
  user.mocked = true
  return user
})

// DEBUGGING: Testing with mock users
app.set('mockData', false)

app.set('port', process.env.PORT || 3000)

app.set('view engine', 'hbs')

app.use(express.static('public'))

io.on('connection', (socket) => {

  socket.on('join', ({ room, user, mocked }) => {
    socket.user = user
    socket.mocked = mocked || app.get('mockData')

    // Create or get room in our map
    if (!rooms.hasOwnProperty(room)) {
      rooms[room] = socket.room = {
        name: room,
        users: socket.mocked ? [user].concat(mockUsers) : [],
        mocked: socket.mocked
      }
      console.log('CREATE ROOM:', socket.room.name, socket.mocked ? 'MOCKED' : '')
    }
    else {
      socket.room = rooms[room]
    }

    socket.join(room)


    if (!mocked) {
      socket.room.users.push(user)
    }
    console.log('JOIN ROOM:', socket.room.name, socket.user)

    socket.emit('joined', socket.room)
    io.in(socket.room.name).emit('updates.users', socket.room)
  })

  socket.on('changeOwner', ({ ownerId, authId }) => {
    // Ensure the real owner is making the request
    if (socket.id === authId && socket.room.users[0].id === authId) {
      // Loop through users to get index of user
      let index = -1
      let newOwner = socket.room.users.find((user, i) => {
        if (user.id === ownerId) {
          index = i
          return true
        }
      })
      // Splice out new owner
      socket.room.users.splice(index, 1)
      // Bump them to the front as owner
      socket.room.users.unshift(newOwner)
      io.in(socket.room.name).emit('updates.users', socket.room)
      console.log('CHANGE OWNER:', socket.room.name, socket.user)
    }
  })

  socket.on('disconnect', () => {
    // If a user connected AND joined the room
    if (socket.room) {
      const index = socket.room.users.indexOf(socket.user)
      socket.room.users.splice(index, 1)

      // Send user updates to everyone in room
      io.in(socket.room.name).emit('updates.users', socket.room)
      console.log('DISCONNECTED:', socket.room.name, socket.user)

      // Delete room if no users left
      if (!socket.room.users.length || socket.mocked) {
        delete rooms[socket.room.name]
        console.log('DELETE ROOM:', socket.room.name, Object.keys(rooms))
      }
    }
  })
})


app.get('/', (req, res) => {
  res.render('index')
})

app.get('/rooms/:name', (req, res) => {
  let room = req.params.name
  // If we want mocked data and no room exists, create it
  let mocked = !!req.query.mockData && !rooms.hasOwnProperty(room)

  res.render('room', { room, mocked })
})

server.listen(app.get('port'), () => console.log('Running at http://localhost:' + app.get('port')))
