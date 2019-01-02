'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NewsLetterSchema extends Schema {
  up () {
    this.create('newsletters', (table) => {
      table.increments()
      table.text('content').notNullable()
      table.boolean('status').notNullable().defaultTo(false)
      table.integer('nl_settings')
      table.timestamps()
    })
  }

  down () {
    this.drop('newsletters')
  }
}

module.exports = NewsLetterSchema
