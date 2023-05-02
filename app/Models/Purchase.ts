import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { genRandomUuid } from 'App/Controllers/Helpers/utils'

/*
contractPoolId
escrowAddress
tokenAddress
token_id
down_payment
principal

 */
export default class Purchase extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uniqueId: string = genRandomUuid()

  @column()
  public orderId: string

  @column()
  public contractPurchaseId: string

  @column()
  public contractPoolId: string

  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
