/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'
import OpenSea from 'App/Controllers/Marketplace/OpenSea'
import { supportedChains } from 'App/Controllers/types'

Route.get('/', async () => {
  return { hello: 'world' }
})


Route.post('/user/:walletAddress', 'UsersController.create')


Route.group(() => {
  Route.post('/new', 'CollectionsController.create')
  Route.post('/status/:id', 'CollectionsController.status')
  Route.get('/active', 'CollectionsController.view')
  Route.get('/:collectionId', 'CollectionsController.single')
  //
}).prefix('/collections')


Route.group(() => {
  Route.get('/get/:collectionId/:tokenId', 'TokensController.tokenDetails')
}).prefix('/tokens')


Route.group(() => {
  Route.post('/create', 'PurchasesController.create')
  Route.get('/user/projects/:userId', 'PurchasesController.userPurchases')  // my projects
  Route.get('/recent', 'PurchasesController.recent')
}).prefix('/purchase')


Route.group(() => {
  Route.get('/totalVolume', 'PoolsController.totalVolumeInPools')
  Route.get('/totalLiquidityBorrowed', 'LoansController.totalLoansBorrowed')
  Route.get('/totalLiquidityAvailable', 'PoolsController.totalVolumeAvailableInPools')

  Route.get('/active', 'PoolsController.viewActive')
  Route.get('/:uniqueId', 'PoolsController.single')
  Route.get('/user/:userAddress', 'PoolsController.user')

  Route.post('/create', 'PoolsController.create')
  Route.post('/status/:uniqueId', 'PoolsController.status')
  Route.post('/fund', 'PoolFundingsController.create')
}).prefix('/pools')


Route.group(() => {
  // buy with qredos modal endpoint
  Route.get('/terms/:poolUniqueId/:collectionUniqueId/:tokenId', 'LoansController.loanTerms')

  Route.post('/create', 'LoansController.create')
}).prefix('/loan')


Route.group(() => {
  Route.get('/timeline/:loanUniqueId', 'LoanRepaymentsController.timeline')   // loan schedule
  Route.get('/amount/:loanUniqueId', 'LoanRepaymentsController.amountToPay')


  Route.post('/', 'LoanRepaymentsController.create')
}).prefix('/repayment')


Route.get('/test', async () => {
  return await new OpenSea(supportedChains.goerli).createPurchase('0xc06ce325fccceaaeb809f00d1a9f7e844bd8ff09', '89')
})
