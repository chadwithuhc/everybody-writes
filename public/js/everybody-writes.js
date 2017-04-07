(function() {
  'use strict';

  // HOME

  let socket = io()

  let joinRoomInput = document.querySelector('#joinRoomInput')
  if (joinRoomInput) {
    joinRoomInput.focus()
  }

  let joinRoomForm = document.querySelector('#joinRoomForm')
  if (joinRoomForm) {
    joinRoomForm.addEventListener('submit', (event) => {
      event.preventDefault()
      window.location.href = '/rooms/' + joinRoomInput.value
    })
  }

  // ROOM

  let user = {}

  let studentNameInput = document.querySelector('#studentName')
  if (studentNameInput) {
    studentNameInput.focus()
  }

  let joinRoomWithNameForm = document.querySelector('#joinRoomWithNameForm')
  if (joinRoomWithNameForm) {
    joinRoomWithNameForm.addEventListener('submit', (event) => {
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

  socket.on('joined', (roomInfo) => {
    console.info('Joined', roomInfo)

    // Bootstrap 4 hidden styling
    joinRoomWithNameForm.hidden = true

    renderApp(roomInfo)
  })

  socket.on('updates.user', (roomInfo) => {
    console.info('Updates', roomInfo)
    writeUsers(roomInfo.users)
  })

  function renderApp(roomInfo) {
    writeUsers(roomInfo.users)
    writeContentEditor()
  }

  function writeUsers(users) {
    let template = document.querySelector('#usersTemplate').innerHTML

    // Find and mark owner
    let ownerUser = users.shift()
    ownerUser.owner = true

    // Sort rest by Alphabetical Order
    let orderedUsers = [ownerUser].concat(
      users.sort((a, b) => a.name > b.name)
    )

    let html = orderedUsers.reduce((content, user) => {
      let ownerTemplate = user.owner ? `<small class="badge badge-pill badge-default text-uppercase">Owner</small>` : ''

      return content + `<a class="nav-item nav-link" data-user-id="${user.id}">${user.name} ${ownerTemplate}</a>`
    }, '')

    console.log(document.querySelector('[data-target-for="usersTemplate"]'))
    document.querySelector('[data-target-for="usersTemplate"]').innerHTML = template.replace('{users}', html).replace('{userCount}', orderedUsers.length)

    // Write to standalone user partials
    document.querySelector('[data-target-for="userName"]').textContent = user.name
  }

  function writeContentEditor() {
    let template = document.querySelector('#contentTemplate').innerHTML

    // PROFIT

    document.querySelector('[data-target-for="contentTemplate"]').innerHTML = template
  }

}())
