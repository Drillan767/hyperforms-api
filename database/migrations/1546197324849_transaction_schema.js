'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class TransactionSchema extends Schema {
  up () {
    this.create('transactions', (table) => {
      table.increments()
      table.string('email', 150).notNullable()
      table.string('first_name', 150).notNullable()
      table.string('last_name', 150).notNullable()
      table.string('total_amount', 150).notNullable()
      table.text('detail_transaction')
      table.boolean('paid')
      table.boolean('sound_sent')

      table.timestamps()
    })
  }

  down () {
    this.drop('transactions')
  }
}

module.exports = TransactionSchema
