(function() {
  'use strict';

  let socket = io()

  let me = {}
  let ownerUser = {}
  let changingOwner = false
  let sendEditorUpdates = false
  let trackMyChanges = true

  let Editor = null
  const { DEFAULT_EDITOR_TYPE } = CONFIG

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

  function writeContentEditor(value) {
    value = value || me.value || ''

    if (!Editor) {
      changeEditorType(DEFAULT_EDITOR_TYPE)
    }
    else {
      Editor.setContents({ value })
    }
  }

  function emitEditorUpdates(value) {
    // Keep my value up to date for sending at random times
    //   We turn this off when we're writing someone elses changes
    if (trackMyChanges) {
      me.value = value
    }

    // But only send if we are current selected user
    if (sendEditorUpdates) {
      socket.emit('updates.editor', { value })
    }
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

  function showEditor(userId) {
    // Am I the owner? Then I can see other students work
    if (ownerUser.id !== me.id) {
      console.error('ERR:', 'You are not the owner')
      return
    }

    // Am I showing my own editor?
    if (me.id === userId) {
      socket.emit('updates.editor.terminate')
      writeContentEditor(me.value)
      trackMyChanges = true
      return
    }

    // Stop tracking my changes
    trackMyChanges = false
    // Submit the request to the server, then the user
    socket.emit('updates.editor.request', { userId })
  }

  // Listen for all updates
  socket.on('updates.editor', ({ value }) => {
    if (ownerUser.id === me.id) {
      writeContentEditor(value)
    }
  })

  // We are being requested to send updates
  socket.on('updates.editor.request', () => {
    sendEditorUpdates = true
    trackMyChanges = true
    socket.emit('updates.editor.requestFulfilled', me)
  })

  // We are terminating editor update requests
  socket.on('updates.editor.terminate', () => {
    sendEditorUpdates = false
    trackMyChanges = true
  })

  function getRandomAnswer() {
    if (ownerUser.id !== me.id) {
      console.error('ERR:', 'You are not the owner')
      return
    }

    console.info('Getting random answer...')

    socket.emit('updates.editor.random')
  }

  socket.on('updates.editor.randomAnswer', (userId) => {
    showEditor(userId)
  })

  function changeEditorType(name) {
    if (window.hasOwnProperty(name) && typeof window[name] === 'function') {
      // Teardown old editor
      if (Editor) {
        Editor.teardown()
        Editor = null
      }

      createEditorConfig(name).then((config) => {
        Editor = new window[name]({
          container: document.querySelector('[data-target-for="contentTemplate"]'),
          emitEditorUpdates,
          config
        })
        Editor.setContents({ value: me.value || '' })
      })
    }
  }

  function createEditorConfig(name) {
    return new Promise((resolve, reject) => {
      const NewEditor = window[name]

      if (NewEditor.Configure && typeof NewEditor.Configure === 'function') {
        new NewEditor.Configure({
          container: document.querySelector('[data-target-for="contentTemplate"]'),
          resolve
        })
        return
      }

      resolve()
    })
  }

  socket.on('updates.editor.type', (type) => {
    changeEditorType(type)
  })

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
        showEditor(event.target.dataset.userId)
      }
    }

    if (event.target.dataset.trigger === 'randomAnswer') {
      // We need owner access to do this
      getRandomAnswer()
    }

    if (event.target.dataset.trigger === 'changeEditorType') {
      event.preventDefault()
      socket.emit('updates.editor.type', event.target.dataset.type)
    }
  })

}())
