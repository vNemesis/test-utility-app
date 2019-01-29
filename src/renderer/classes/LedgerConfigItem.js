export default class LedgerConfigItem {
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
    return this.linePosition.value + (this.charLength.value - 1)
  }
}
