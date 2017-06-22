class CodeEditor {

  constructor({ container, emitEditorUpdates }) {
    console.info('New Editor: CodeEditor')
    this.element = null
    this.codemirror = null // Codemirror instance
    this.contents = {}
    this.emitEditorUpdates = emitEditorUpdates

    // Bindings
    this.onChange = this.onChange.bind(this)

    return this.create(container)
  }

  getContents() {
    // Grab value from the "editor"

    // Then return
    return this.contents
  }

  setContents(editorContents) {
    // Set your contents however needed
    this.contents.value = editorContents.value

    // Set codemirror value
    this.codemirror.setValue(editorContents.value)
  }

  create(container) {
    // Generate HTML & write
    // container.innerHTML = this.template
    this.codemirror = CodeMirror(container, {
      mode: 'javascript',
      theme: 'material',
      lineNumbers: true
    })

    // Store element for later
    this.element = container.children[0]

    // Add any listeners
    this.codemirror.on('change', this.onChange)

    return this
  }

  teardown() {
    // Remove any listeners
    this.codemirror.off('change', this.onChange)
    this.element.remove()
    this.element = null
  }


  onChange() {
    this.contents.value = this.codemirror.getValue()

    this.emitEditorUpdates(this.contents.value)
  }

}

window.CodeEditor = CodeEditor
