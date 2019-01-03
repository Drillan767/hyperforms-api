'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class NewsLetter extends Model {
  static get table () {
    return 'newsletters'
  }
}

module.exports = NewsLetter
