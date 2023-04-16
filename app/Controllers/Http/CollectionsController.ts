import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema } from '@ioc:Adonis/Core/Validator'
import { formatErrorMessage } from '../Helpers/utils';
import Rarible from '../Marketplace/Rarible';

export default class CollectionsController {

  public async create({ request, response }: HttpContextContract) {
    try {
      const data = request.body();
      await this.validate(request)

      return await new Rarible().collectionDetails(data.address, data.network)

    } catch (error) {
      response.status(400).json({ data: await formatErrorMessage(error) })
    }
  }


  private async validate(request) {
    const Schema = schema.create({
      address: schema.string(),
      network: schema.string(),
    })
    await request.validate({ schema: Schema });
  }

}
