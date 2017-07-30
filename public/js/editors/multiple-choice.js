class MultipleChoiceEditor {

  // We expose our `contents.value` as "yes" or "no"
  // This means we need to convert to a checked radio on `setContents()`

  constructor({ container, emitEditorUpdates, config = {} }) {
    this.element = null
    this.inputs = [] // input radios
    this.contents = {}
    this.config = config
    this.template = Handlebars.compile(`
      <form name="multiple-choice">
        {{#each config.options}}
        <label><input type="{{../config.type}}" name="value" value="{{this.value}}" /> {{this.name}}</label><br/>
        {{/each}}
      </form>
    `)
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
    container.innerHTML = this.template({ config: this.config })

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

class MultipleChoiceEditorConfigure {

  constructor({ container, resolve }) {
    this.resolve = resolve
    this.template = Handlebars.compile(`
      <form name="multiple-choice-configure">
        <fieldset>
          <h3>Type</h3>
          <label><input type="radio" name="type" value="radio" /> Single Answer</label><br/>
          <label><input type="radio" name="type" value="checkbox" /> Multiple Answers</label>
        </fieldset>

        <fieldset>
          <textarea name="multiple-choice-options" cols="30" rows="6"></textarea>
        </fieldset>

        <button type="submit">Create</button>
      </form>
    `)

    // Bindings
    this.onSubmit = this.onSubmit.bind(this)
    this.onComplete = this.onComplete.bind(this)

    return this.create(container)
  }

  create(container) {
    // Generate HTML & write
    container.innerHTML = this.template({  })

    // Store element for later
    this.element = container.children[0]
    this.optionsElement = this.element.querySelector('[name="multiple-choice-options"]')

    // Add any listeners
    this.element.addEventListener('submit', this.onSubmit)

    return this
  }

  teardown() {
    this.element.removeEventListener('submit', this.onSubmit)
    this.element.remove()
    this.element = null
  }

  convertTextareaToOptionsArray(contents) {
    const options = contents.split('\n')
    return options.map((option) => {
      return {
        name: option,
        value: option
      }
    })
  }

  onSubmit(e) {
    e.preventDefault()
    const data = new FormData(e.target)

    /**
     * SAMPLE:
     * { type: 'radio', options: [
         {name:'Yeah Dude!',value:'yeahdude'},
         {name:'Nah Dude!',value:'nahdude'},
       ]}
     */
    const config = {
      type: data.get('type') || 'radio',
      options: this.convertTextareaToOptionsArray(data.get('multiple-choice-options'))
    }

    this.onComplete(config)
  }

  onComplete(config) {
    this.teardown()
    this.resolve(config)
  }

}

MultipleChoiceEditor.Configure = MultipleChoiceEditorConfigure

window.MultipleChoiceEditor = MultipleChoiceEditor
