import BaseSchema from '@ioc:Adonis/Lucid/Schema'

/*
contract_loan_id
contract_pool_id
borrower
principal
 */

export default class extends BaseSchema {
  protected tableName = 'loans'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('unique_id').unique()
      table.string('network').notNullable()
      table.string('contract_loan_id').notNullable()
      table.string('contract_pool_id').notNullable()
      table.string('borrower').notNullable()
      table.string('principal').notNullable()

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
