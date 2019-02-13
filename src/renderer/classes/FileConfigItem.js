export default class FileConfigItem {
  constructor (id, fieldName, linePosition, charLength, type, options) {
    this.id = id
    this.fieldName = fieldName
    this.type = type
    this.options = options
    this.linePosition = {
      value: linePosition,
      errors: []
    }
    this.charLength = {
      value: charLength,
      errors: []
    }
  }

  get endLinePosition () {
    return parseInt(this.linePosition.value) + parseInt(this.charLength.value) - 1
  }
}
