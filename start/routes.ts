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
import Indexer from 'App/Controllers/Blockchain/Indexer'

Route.get('/', async () => {
  return { hello: 'world' }
})


Route.post('/user/:walletAddress', 'UsersController.create')


Route.group(() => {
  Route.post('/new', 'CollectionsController.create')
  Route.post('/status/:id', 'CollectionsController.status')
  Route.get('/active', 'CollectionsController.view')
}).prefix('/collections')


Route.group(() => {
  Route.get('/get/:collectionId/:tokenId', 'TokensController.tokenDetails')
}).prefix('/tokens')


Route.group(() => {
  Route.post('/create', 'PurchasesController.create')
  // update purchase status
  // user purchases
  // all purchases - for recent purchase section.
}).prefix('/purchase')


Route.group(() => {
  Route.get('/totalVolume', 'PoolsController.totalVolumeInPools')
  Route.get('/totalLiquidityBorrowed', 'LoansController.totalLoansBorrowed')
  Route.get('/totalLiquidityAvailable', 'PoolsController.totalVolumeAvailableInPools')

  Route.get('/', 'PoolsController.view')
  Route.get('/:uniqueId', 'PoolsController.single')
  Route.get('/user/:userAddress', 'PoolsController.user')

  Route.post('/create', 'PoolsController.create')
  Route.post('/status/:uniqueId', 'PoolsController.status')
  Route.post('/fund/:contractPoolId', 'PoolFundingsController.create')
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
  new Indexer().test()
})
