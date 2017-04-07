const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.set('port', process.env.PORT || 3000)

app.set('view engine', 'hbs')

app.use(express.static('public'))

io.on('connection', (socket) => {

  socket.emit('news', { hello: 'world' })
  socket.on('my other event', function (data) {
    console.log(data)
  })
})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/rooms/:name', (req, res) => {
  res.render('room', { room: req.params.name })
})

server.listen(app.get('port'), () => console.log('Running at http://localhost:' + app.get('port')))
