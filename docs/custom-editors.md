# Custom Editors

```js
class TextareaEditor {

  constructor({ container, emitEditorUpdates }) {
    this.element = null
    this.contents = {}
    this.template = `<textarea class="form-control" style="height:80vh"></textarea>`
    this.emitEditorUpdates = emitEditorUpdates

    // Bindings
    this.onKeyUp = this.onKeyUp.bind(this)

    return this.create(container)
  }

  getContents() {
    // Grab value from the "editor"

    // Then return
    return this.contents
  }

  setContents(editorContents) {
    // Set your contents however needed
    this.contents.value = this.element.value = editorContents.value
  }

  create(container) {
    // Generate HTML & write
    container.innerHTML = this.template

    // Store element for later
    this.element = container.children[0]

    // Add any listeners
    this.element.addEventListener('keyup', this.onKeyUp)

    return this
  }

  teardown() {
    // Remove any listeners
    this.element.removeEventListener('keyup', this.onKeyUp)
    this.element.remove()
    this.element = null
  }


  onKeyUp(e) {
    this.contents.value = e.target.value

    // Emit editor updates when done
    this.emitEditorUpdates(this.contents.value)
  }

}
```

```js
var editorContents = {
  value: string,
  options: [],

}
```

Sample Editor Types:

- YesNo
- Multiple Choice
- Code Editor
