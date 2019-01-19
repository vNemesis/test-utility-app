export default class LedgerConfigItem {
  constructor (id, fieldName, linePosition, charLength, type, sharedData) {
    this.id = id
    this.fieldName = fieldName
    this.type = type
    this.sharedData = sharedData
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
