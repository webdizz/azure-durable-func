import * as df from "durable-functions";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { BulkLoadRequest } from "../common/request/BulkLoadRequest";

const httpStart: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<any> {
  const client = df.getClient(context);

  /*
  {
  "sbu": "FGL",
  "banner": "SC",
  "maxItems": 50,
  "entities": [
    {
      "name": "product-family"
    },
    {
      "name": "digital-taxonomy"
    }
  ]
}
*/
  const bulkLoadRequest = <BulkLoadRequest>req.body;
  context.log(
    `#bulk-load-initiator got request initiate load for sbu=${req.body.sbu} banner=${req.body.banner} entities=${JSON.stringify(req.body.entities)}`
  );

  const instanceId = await client.startNew(
    req.params.functionName,
    undefined,
    bulkLoadRequest
  );

  context.log(
    `#bulk-load-initiator Started orchestration with ID = '${instanceId}'.`
  );

  return client.createCheckStatusResponse(context.bindingData.req, instanceId);
};

export default httpStart;
