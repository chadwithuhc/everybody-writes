(function() {
  'use strict';

  // HOME

  var socket = io()

  var joinRoomInput = document.querySelector('#joinRoomInput')
  if (joinRoomInput) {
    joinRoomInput.focus()
  }

  var joinRoomForm = document.querySelector('#joinRoomForm')
  if (joinRoomForm) {
    joinRoomForm.addEventListener('submit', function (event) {
      event.preventDefault()
      window.location.href = '/rooms/' + joinRoomInput.value
    })
  }

  // ROOM

  var user = {}

  var app = document.querySelector('#app')

  var studentNameInput = document.querySelector('#studentName')
  if (studentNameInput) {

  }

  var joinRoomWithNameForm = document.querySelector('#joinRoomWithNameForm')
  if (joinRoomWithNameForm) {
    joinRoomWithNameForm.addEventListener('submit', function (event) {
      event.preventDefault()

      user = {
        id: socket.id,
        name: studentNameInput.value
      }

      socket.emit('join', {
        room: ROOM,
        user: user
      })
    })
  }

  socket.on('joined', function (roomInfo) {
    console.info('Joined', roomInfo)

    // Bootstrap 4 hidden styling
    joinRoomWithNameForm.hidden = true

    renderApp(roomInfo)
  })

  function renderApp(roomInfo) {
    app.innerHTML = ''
    writeUsers(roomInfo.users)
  }

  function writeUsers(users) {
    var template = document.querySelector('#usersTemplate').innerHTML

    var html = users.reduce((content, user) => {
      return content + '<a class="nav-item nav-link" data-user-id="' + user.id + '">' + user.name + '</a>'
    }, '')

    app.innerHTML += template.replace('{users}', html).replace('{userCount}', users.length)
  }

}())
