import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'loan_repayments'
  /*
    contract_loan_repayment_id
    contract_loan_id
    amount
    type : part || full
   */
  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('unique_id').unique()
      table.string('contract_loan_repayment_id')
      table.string('contract_loan_id')
      table.string('contract_pool_id')
      table.integer('amount')
      table.string('type')

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
