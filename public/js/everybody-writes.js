(function() {
  'use strict';

  let socket = io()

  let user = {}
  let ownerUser = {}

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
        user: user,
        mocked: MOCKED
      })
    })
  }

  socket.on('joined', (roomInfo) => {
    console.info('Joined', roomInfo)

    // Bootstrap 4 hidden styling
    joinRoomWithNameForm.hidden = true

    renderApp(roomInfo)
  })

  socket.on('updates.users', (roomInfo) => {
    console.info('updates.users', roomInfo)
    // Only re-render the users so we don't overwrite the editor while user is editing
    writeUsers(roomInfo.users)
  })

  function renderApp(roomInfo) {
    writeUsers(roomInfo.users)
    writeContentEditor()
  }

  function writeUsers(users) {
    let template = document.querySelector('#usersTemplate').innerHTML

    // Find and mark owner
    ownerUser = users.shift()

    // Sort rest by Alphabetical Order
    let orderedUsers = [ownerUser].concat(
      users.sort((a, b) => {
        a = a.name.toLowerCase()
        b = b.name.toLowerCase()
        if (a < b) return -1
        if (a > b) return 1
        return 0
      })
    )

    let html = orderedUsers.reduce((content, user) => {
      let ownerTemplate = user.id === ownerUser.id ? `<small class="badge badge-pill badge-default text-uppercase">Owner</small>` : ''

      return content + `<a class="nav-item nav-link" data-user-id="${user.id}">${user.name} ${ownerTemplate}</a>`
    }, '')

    document.querySelector('[data-target-for="usersTemplate"]').innerHTML = template.replace('{users}', html).replace('{userCount}', orderedUsers.length)

    // Write to standalone user partials
    document.querySelector('[data-target-for="userName"]').textContent = user.name

    writeOwnerControls()
  }

  function writeContentEditor() {
    let template = document.querySelector('#contentTemplate').innerHTML

    document.querySelector('[data-target-for="contentTemplate"]').innerHTML = template
  }

  function writeOwnerControls() {
    let template = document.querySelector('#ownerControlsTemplate').innerHTML

    document.querySelector('[data-target-for="ownerControlsTemplate"]').innerHTML = user.id === ownerUser.id ? template : ''
  }

}())
