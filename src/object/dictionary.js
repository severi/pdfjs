'use strict'

import PDFName from './name'
import * as PDFValue from './value'

export default class PDFDictionary {
  constructor(dictionary) {
    this.dictionary = {}
    if (dictionary) {
      for (const key in dictionary) {
        this.add(key, dictionary[key])
      }
    }
  }

  add(key, val) {
    if (typeof val === 'string') {
      val = new PDFName(val)
    }
    this.dictionary[new PDFName(key)] = val
  }

  set(key, val) {
    this.add(key, val)
  }

  has(key) {
    return String(new PDFName(key)) in this.dictionary
  }

  get(key) {
    return this.dictionary[new PDFName(key)]
  }

  del(key) {
    delete this.dictionary[new PDFName(key)]
  }

  get length() {
    let length = 0
    for (const key in this.dictionary) {
      length++
    }
    return length
  }

  toString() {
    let str = ''
    for (const key in this.dictionary) {
      const val = this.dictionary[key]
      str += `${key} ${val === null ? 'null' : val}`.replace(/^/gm, '\t') + '\n'
    }
    return `<<\n${str}>>`
  }

  static async parse(xref, lexer, trial) {
    if (lexer.getString(2) !== '<<') {
      if (trial) {
        return undefined
      }

      throw new Error('Invalid dictionary')
    }

    lexer.shift(2)
    lexer.skipWhitespace(null, true)

    const dictionary = new PDFDictionary()

    while (lexer.getString(2) !== '>>') {
      const key = await PDFName.parse.call(this, xref, lexer)
      lexer.skipWhitespace(null, true)

      const value = await PDFValue.parse.call(this, xref, lexer)
      dictionary.set(key, value)

      lexer.skipWhitespace(null, true)
    }

    lexer.shift(2)

    return dictionary
  }
}