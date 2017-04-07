var socket = io()

socket.on('news', function (data) {
  console.log(data)
  socket.emit('my other event', { my: 'data' })
})

var joinRoomInput = document.querySelector('#joinRoomInput')
if (joinRoomInput) {
  joinRoomInput.focus()
}

var joinRoomForm = document.querySelector('#joinRoomForm')
joinRoomForm.addEventListener('submit', function (event) {
  event.preventDefault()
  window.location.href = '/rooms/' + joinRoomInput.value
})
