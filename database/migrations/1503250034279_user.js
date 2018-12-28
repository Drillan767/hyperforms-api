'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 150).notNullable().unique()
      table.string('password', 60).notNullable()
      table.string('picture', 255).notNullable()
      table.text('biography').notNullable()
      table.string('facebook', 255).notNullable()
      table.string('twitter', 255).notNullable()
      table.string('instagram', 255).notNullable()
      table.string('reset_token', 255)
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
