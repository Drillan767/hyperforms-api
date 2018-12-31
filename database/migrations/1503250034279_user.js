'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 150).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('picture', 255)
      table.text('biography')
      table.string('facebook', 255)
      table.string('twitter', 255)
      table.string('instagram', 255)
      table.string('reset_token', 255)
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
