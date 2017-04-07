const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const rooms = {}

app.set('port', process.env.PORT || 3000)

app.set('view engine', 'hbs')

app.use(express.static('public'))

io.on('connection', (socket) => {

  socket.on('join', ({ room, user }) => {
    socket.user = user

    // Create or get room in our map
    if (!rooms.hasOwnProperty(room)) {
      rooms[room] = socket.room = {
        name: room,
        users: []
      }
    }
    else {
      socket.room = rooms[room]
    }

    socket.join(room)
    socket.room.users.push(user)
    console.log('JOIN ROOM:', socket.room.name, socket.user)

    socket.emit('joined', socket.room)
    io.in(socket.room.name).emit('updates.user', socket.room)
  })

  socket.on('disconnect', () => {
    // If a user connected AND joined the room
    if (socket.room) {
      const index = socket.room.users.indexOf(socket.user)
      socket.room.users.splice(index, 1)

      // Send user updates to everyone in room
      io.in(socket.room.name).emit('updates.user', socket.room)
      console.log('DISCONNECTED:', socket.room.name, socket.user)
    }
  })
})


app.get('/', (req, res) => {
  res.render('index')
})

app.get('/rooms/:name', (req, res) => {
  res.render('room', { room: req.params.name })
})

server.listen(app.get('port'), () => console.log('Running at http://localhost:' + app.get('port')))
