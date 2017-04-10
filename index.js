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

  // Send a request to get live updates from userId
  socket.on('updates.editor.request', ({ userId }) => {
    // If I am the owner
    if (socket.id !== socket.room.users[0].id) {
      console.log('ERR:', 'Non-owner requested editor value')
      return
    }

    let currentEditorId = rooms[socket.room.name].editorId
    if (currentEditorId) {
      console.log('EDITOR REVOKE:', currentEditorId)
      socket.to(currentEditorId).emit('updates.editor.terminate')
      rooms[socket.room.name].editorId = null
    }
    console.log('EDITOR UPDATE:', userId)
    rooms[socket.room.name].editorId = userId

    // If the user is a mocked user, we'll skip this
    if (!Number.isNaN(+userId)) {
      //socket.to(socket.room.users[0].id).emit('updates.editor', { value })
      console.log('ERR:', 'User was mocked so no request sent')
      return
    }

    socket.to(userId).emit('updates.editor.request')
  })

  // Terminate whoever was sharing coding
  socket.on('updates.editor.terminate', () => {
    let currentEditorId = rooms[socket.room.name].editorId
    if (currentEditorId) {
      console.log('EDITOR REVOKE:', currentEditorId)
      socket.to(currentEditorId).emit('updates.editor.terminate')
      rooms[socket.room.name].editorId = null
    }
  })

  socket.on('updates.editor.random', () => {
    // Only allow if owner
    if (socket.id === socket.room.users[0].id) {
      // Don't include our code
      let random = Math.floor(Math.random() * socket.room.users.slice(1).length) + 1
      let randomUser = socket.room.users[random]

      // Mock data support
      if (!Number.isNaN(+randomUser.id)) {
        socket.emit('updates.editor', { value: randomUser.value })
        console.log('RANDOM [MOCKED] ANSWER:', randomUser)
      }
      else {
        socket.emit('updates.editor.randomAnswer', randomUser.id)
        console.log('RANDOM ANSWER:', randomUser.name, randomUser.id)
      }
    }
    else {
      console.log('updates.editor.random ERR:', 'You are not an owner')
    }
  })

  // Request to listen to user editor changes fullfilled
  socket.on('updates.editor.requestFulfilled', ({ id, value }) => {
    // Set the userId to our room
    rooms[socket.room.name].editorId = id

    console.log('EMIT UPDATE:', value, 'updates.editor.requestFulfilled')
    socket.to(socket.room.users[0].id).emit('updates.editor', { value })
  })
  socket.on('updates.editor', ({ value }) => {
    console.log('EMIT UPDATE:', value, 'updates.editor')
    socket.to(socket.room.users[0].id).emit('updates.editor', { value })
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
