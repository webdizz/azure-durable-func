import { AzureFunction, Context } from "@azure/functions";
import { BulkLoadEntity } from "../common/command/BulkLoadEntity";
import { BulkLoadEntityCommand } from "../common/command/BulkLoadEntityCommand";
import { BulkLoadResponse } from "../common/response/BulkLoadResponse";
import { Md5 } from "ts-md5/dist/md5";

const bulkLoaderFunction: AzureFunction = async function (
  context: Context,
  command: BulkLoadEntityCommand
): Promise<BulkLoadResponse> {
  context.log(
    `#bulk-load-executor is about to perform bulk load for sbu=${command.sbu} banner=${command.banner} entity=${command.entity.name} `
  );

  let response: BulkLoadResponse;
  if ("product-family" == command.entity.name) {
    if (command.entity.cursor) {
      // case for bulk load with pagination over cursor
      context.log(
        `#bulk-load-executor going to execute load for ${command.entity.name} for cursor=${command.entity.cursor}`
      );
      const entityForCommand = command.entity;
      response = {
        data: [`some data for cursor ${entityForCommand.cursor}`],
        _command: {
          entity: entityForCommand,
        } as BulkLoadEntityCommand,
      };
    } else if (!command.entity.cursor && !command.entity.id) {
      // case for bulk load with pagination over cursor for the first page
      context.log(
        `#bulk-load-executor going to execute load for ${command.entity.name} for cursor=${command.entity.cursor} for the first page`
      );
      const entityForCommand = command.entity;
      entityForCommand.cursor = Md5.hashStr(Date.now().toString());
      response = {
        data: [`some data for first page ${entityForCommand.cursor}`],
        _command: {
          entity: entityForCommand,
        } as BulkLoadEntityCommand,
      };
    } else if (command.entity.id) {
      // case for bulk load with id
      const entityForCommand = command.entity;
      response = {
        data: ["some data for id=" + command.entity.id],
      } as BulkLoadResponse;
    }
  } else {
    response = {
      data: [`response for entity ${command.entity.name}`],
    } as BulkLoadResponse;
  }

  return response;
};

export default bulkLoaderFunction;
