'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NlSettingSchema extends Schema {
  up () {
    this.create('nl_settings', (table) => {
      table.increments()
      table.string('title', 150).notNullable()
      table.text('template')
      table.string('bottom_text')
      table.string('unsubscribe')
      table.timestamps()
    })
  }

  down () {
    this.drop('nl_settings')
  }
}

module.exports = NlSettingSchema
