import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { genRandomUuid } from 'App/Controllers/Helpers/utils'
import { supportedChains } from 'App/Controllers/Blockchain/ethers'

export default class Loan extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uniqueId: string = genRandomUuid()

  @column()
  public network: supportedChains

  @column()
  public contractLoanId: string

  @column()
  public contractPoolId: string

  @column()
  public borrower: string

  @column()
  public principal: string

  @column()
  public blockTimestamp: string

  @column()
  public status: 'open' | 'closed'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
