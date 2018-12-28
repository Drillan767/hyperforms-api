'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NewsLetterSchema extends Schema {
  up () {
    this.create('emails', (table) => {
      table.increments()
      table.string('email', 150).notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('emails')
  }
}

module.exports = NewsLetterSchema
