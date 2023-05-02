import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pools'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('unique_id').unique()
      table.string('contract_pool_id').unique()   //  id on smart contract
      table.string('creator_id')
      // table.integer('amount')
      table.string('payment_cycle')
      table.integer('apr')
      table.integer('duration_in_secs')
      table.integer('duration_in_months')
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
