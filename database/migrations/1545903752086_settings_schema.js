'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SettingsSchema extends Schema {
  up () {
    this.create('settings', (table) => {
      table.increments()
      table.string('soundcloud', 255)
      table.string('youtube', 255)
      table.string('spotify', 255)
      table.string('songkick', 255)
      table.string('landing_bg', 255)
      table.string('shop_bg', 255)
      table.string('bio_bg', 255)
      table.string('contact_bg', 255)
      table.timestamps()
    })
  }

  down () {
    this.drop('settings')
  }
}

module.exports = SettingsSchema
