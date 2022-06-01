import { AzureFunction, Context } from "@azure/functions";

const bulkLoaderFunction: AzureFunction = async function (
  context: Context
): Promise<string> {
  context.log(
    `#bulk-load-executor Is about to perform operation for ${context.bindings.name}`
  );
  return `Hello ${context.bindings.name}!`;
};

export default bulkLoaderFunction;
