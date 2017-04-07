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
    let roomInfo = {
      name: room,
      users: []
    }

    // Create or get room in our map
    if (!rooms.hasOwnProperty(room)) {
      rooms[room] = roomInfo
    }
    else {
      roomInfo = rooms[room]
    }

    socket.join(room)
    roomInfo.users.push(user)
    console.log('JOIN ROOM:', roomInfo)

    socket.emit('joined', roomInfo)
  })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/rooms/:name', (req, res) => {
  res.render('room', { room: req.params.name })
})

server.listen(app.get('port'), () => console.log('Running at http://localhost:' + app.get('port')))
