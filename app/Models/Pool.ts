import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { genRandomUuid } from 'App/Controllers/Helpers/utils'


/*

    table.string('unique_id').unique()
    table.string('creator_id')
    table.string('amount')
    table.string('payment_cycle')
    table.string('apr')
    table.string('duration_in_secs')
    table.string('duration_in_months')
    table.string('status')
 */
export default class Pool extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uniqueId: string = genRandomUuid()

  @column()
  public poolId: string

  @column()
  public creatorId: string

  // @column()
  // public amount: number

  @column()
  public paymentCycle: string

  @column()
  public apr: number

  @column()
  public durationInSecs: number

  @column()
  public durationInMonths: number

  @column()
  public status: 'active' | 'closed'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
