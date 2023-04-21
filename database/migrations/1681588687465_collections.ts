import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'collections'

  // returns: name, description, avatar, *owner, items, *total_volume, floor_price, website.
  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.string('unique_id').unique()
      table.string('address')
      table.string('network')
      table.string('name')
      table.string('description')
      table.string('avatar')
      table.string('owner')
      table.string('no_of_items')
      table.string('total_volume')
      table.string('floor_price')
      table.string('website')
      table.string('status')

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
