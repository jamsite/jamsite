class DataContext {
  // static
  // dynamic

  constructor () {
    this.static = {}
    this.dynamic = Object.create(this.static)
  }

  data (contextData = {}) {
    const data = Object.create(this.dynamic)
    Object.assign(data, contextData)
    return data
  }

  addStatic (name, data) {
    this.static[name] = data
  }

  addDynamic (name, data) {
    this.dynamic[name] = data

    // static data object with the same name becomes
    // dynamic data object prototype
    if (
      data !== null &&
      typeof data === 'object' &&
      this.static[name] !== null &&
      typeof this.static[name] === 'object'
    ) {
      Object.setPrototypeOf(data, this.static[name])
    }
  }

  removeStatic (name) {
    delete this.static[name]
  }

  removeDynamic (name) {
    delete this.dynamic[name]
  }
}

module.exports = DataContext
