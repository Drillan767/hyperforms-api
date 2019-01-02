'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EmailSchema extends Schema {
  up () {
    this.create('emails', (table) => {
      table.increments()
      table.string('email', 150).notNullable()
      table.string('confirm_token', 150)
      table.boolean('confirmed')
      table.timestamps()
    })
  }

  down () {
    this.drop('emails')
  }
}

module.exports = EmailSchema
