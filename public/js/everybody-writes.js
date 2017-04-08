(function() {
  'use strict';

  let socket = io()

  let me = {}
  let ownerUser = {}
  let changingOwner = false

  let studentNameInput = document.querySelector('#studentName')
  if (studentNameInput) {
    studentNameInput.focus()
  }

  let joinRoomWithNameForm = document.querySelector('#joinRoomWithNameForm')
  if (joinRoomWithNameForm) {
    joinRoomWithNameForm.addEventListener('submit', (event) => {
      event.preventDefault()

      me = {
        id: socket.id,
        name: studentNameInput.value
      }

      socket.emit('join', {
        room: ROOM,
        user: me,
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
      const ownerTemplate = user.id === ownerUser.id ? `<small class="badge badge-pill badge-default text-uppercase">Owner</small>` : ''

      const currentUserClass = me.id === user.id ? 'text-warning' : ''

      return content + `<a class="nav-item nav-link ${currentUserClass}" data-user-id="${user.id}" data-trigger="clickUser">${user.name} ${ownerTemplate}</a>`
    }, '')

    document.querySelector('[data-target-for="usersTemplate"]').innerHTML = template.replace('{users}', html).replace('{userCount}', orderedUsers.length)

    // Write to standalone user partials
    document.querySelector('[data-target-for="userName"]').textContent = me.name

    writeOwnerControls()
  }

  function writeContentEditor() {
    let template = document.querySelector('#contentTemplate').innerHTML

    document.querySelector('[data-target-for="contentTemplate"]').innerHTML = template
  }

  function writeOwnerControls() {
    let template = document.querySelector('#ownerControlsTemplate').innerHTML

    document.querySelector('[data-target-for="ownerControlsTemplate"]').innerHTML = me.id === ownerUser.id ? template : ''
  }

  function initChangeOwner() {
    let template = document.querySelector('#changeOwnerTemplate').innerHTML

    changingOwner = true

    document.querySelector('[data-target-for="contentTemplate"]').innerHTML = template
  }

  function changeOwner(ownerId) {
    console.log('changeOwner', ownerId)
    socket.emit('changeOwner', { ownerId, authId: me.id })
    changingOwner = false
    writeContentEditor()
  }

  function cancelChangeOwner() {
    changingOwner = false
    writeContentEditor()
  }

  // Event Delegations
  document.addEventListener('click', (event) => {
    if (event.target.dataset.trigger === 'changeOwner') {
      // Toggle
      if (changingOwner) {
        cancelChangeOwner()
      }
      else {
        initChangeOwner()
      }
    }

    if (event.target.dataset.trigger === 'clickUser') {
      // If we're changing the user
      if (changingOwner) {
        changeOwner(event.target.dataset.userId)
      }
      // Otherwise show their editor
      else {
        // TODO
      }
    }
  })

}())
