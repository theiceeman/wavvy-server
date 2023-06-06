import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import { supportedChains } from 'App/Controllers/types';

/*
|--------------------------------------------------------------------------
| Provider
|--------------------------------------------------------------------------
|
| Your application is not ready when this file is loaded by the framework.
| Hence, the top level imports relying on the IoC container will not work.
| You must import them inside the life-cycle methods defined inside
| the provider class.
|
| @example:
|
| public async ready () {
|   const Database = this.app.container.resolveBinding('Adonis/Lucid/Database')
|   const Event = this.app.container.resolveBinding('Adonis/Core/Event')
|   Event.on('db:query', Database.prettyPrint)
| }
|
*/
export default class IndexerProvider {
  // import Post Model inside class
  constructor(protected app: ApplicationContract) { }

  public register() {
    // Register your own bindings
  }

  public async boot() {
    // All bindings are ready, feel free to use them
  }

  public async ready() {
    // App is ready
    const Indexer = (await import('App/Controllers/Blockchain/Indexer')).default;

    // await new Indexer(supportedChains.polygonMumbai).streamPastEvents()
    await new Indexer(supportedChains.matic).streamPastEvents()

    // await new Indexer(supportedChains.polygonMumbai).ethersListeners()
    await new Indexer(supportedChains.matic).PurchaseCreated()

    // await new Indexer(supportedChains.polygonMumbai).LoanCreatedListener()
    // await new Indexer(supportedChains.polygonMumbai).PurchaseCompletedListener()

    // await new Indexer(supportedChains.polygonMumbai).LoanRepaid()
    // await new Indexer(supportedChains.polygonMumbai).NFTClaimed()
  }

  public async shutdown() {
    // Cleanup, since app is going down
  }
}
