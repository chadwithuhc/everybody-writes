class YesNoEditor {

  // We expose our `contents.value` as "yes" or "no"
  // This means we need to convert to a checked radio on `setContents()`

  constructor({ container, emitEditorUpdates }) {
    console.info('New Editor: YesNo')
    this.element = null
    this.inputs = [] // input radios
    this.contents = {}
    this.template = `
      <form name="yes-no">
        <label><input type="radio" name="value" value="yes" /> Yes</label><br/>
        <label><input type="radio" name="value" value="no" /> No</label>
      </form>
    `
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

    this.inputs.forEach(el => {
      el.checked = (editorContents.value === el.value)
    })
  }

  create(container) {
    // Generate HTML & write
    container.innerHTML = this.template

    // Store element for later
    this.element = container.children[0]
    this.inputs = []

    // Add any listeners
    Array.from(this.element.children).forEach(el => {
      if (el.children.length && el.children[0].tagName === 'INPUT') {
        this.inputs.push(el.children[0])
        el.children[0].addEventListener('change', this.onChange)
      }
    })

    return this
  }

  teardown() {
    // Remove any listeners
    this.inputs.forEach(el => {
      el.removeEventListener('change', this.onChange)
    })
    this.element.remove()
    this.element = null
  }


  onChange(e) {
    if (e.target.checked) {
      this.contents.value = e.target.value
    }

    this.emitEditorUpdates(this.contents.value)
  }

}
