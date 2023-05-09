import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { genRandomUuid } from 'App/Controllers/Helpers/utils'
import { supportedChains } from 'App/Controllers/Blockchain/ethers'


export default class Pool extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uniqueId: string = genRandomUuid()

  @column()
  public network: supportedChains

  @column()
  public contractPoolId: string

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
  public status: 'open' | 'closed'

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
