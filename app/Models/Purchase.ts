import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { genRandomUuid } from 'App/Controllers/Helpers/utils'
import { supportedChains } from 'App/Controllers/Blockchain/ethers'

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
  public network: supportedChains

  @column()
  public orderId: string

  @column()
  public userAddress: string

  @column()
  public contractPurchaseId: string

  @column()
  public contractPoolId: string

  @column()
  public contractLoanId: string

  @column()
  public escrowAddress: string

  @column()
  public tokenAddress: string

  @column()
  public tokenId: string

  @column()
  public downPayment: string

  // OPEN | COMPLETED | FAILED | CLAIMED | LIQUIDATED | USER_REFUNDED
  @column()
  public status: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
