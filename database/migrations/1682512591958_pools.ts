import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pools'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('unique_id').unique()
      table.string('contract_pool_id').notNullable()
      table.string('network').notNullable()
      table.string('creator_id').notNullable()
      // table.integer('amount')
      table.string('payment_cycle').notNullable()
      table.integer('apr').notNullable()
      table.integer('duration_in_secs').notNullable()
      table.integer('duration_in_months').notNullable()
      table.string('status')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
