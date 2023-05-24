import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { genRandomUuid } from 'App/Controllers/Helpers/utils'
import { supportedChains } from 'App/Controllers/types'
// import { supportedChains } from 'App/Controllers/Blockchain/ethers'

export default class Collection extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public uniqueId: string = genRandomUuid()

  @column()
  public address: string

  @column()
  public network: supportedChains

  @column()
  public name: string

  @column()
  public description: string

  @column()
  public avatar: string

  @column()
  public bannerImageUrl: string

  @column()
  public owner: string

  @column()
  public noOfItems: string

  @column()
  public totalVolume: string

  @column()
  public floorPrice: string

  @column()
  public website: string

  // active | disabled
  @column()
  public status: string


  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
