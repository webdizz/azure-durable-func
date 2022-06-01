import * as df from "durable-functions";
import { BulkLoadEntity } from "../common/command/BulkLoadEntity";
import { BulkLoadEntityCommand } from "../common/command/BulkLoadEntityCommand";
import { BulkLoadRequest } from "../common/request/BulkLoadRequest";
import { BulkLoadResponse } from "../common/response/BulkLoadResponse";

const orchestrator = df.orchestrator(function* (context) {
  const outputs = [];

  const bulkLoad: BulkLoadRequest = <BulkLoadRequest>context.df.getInput();
  const sbu = bulkLoad.sbu;
  const banner = bulkLoad.banner;
  const entities = bulkLoad.entities;

  context.log(
    `#bulk-load-orchestrator got input sbu=${sbu}, entities=${JSON.stringify(
      entities
    )}`
  );

  for (const entity of entities) {
    context.log(
      `#bulk-load-orchestrator is about to trigger execution of bulk-load-executor for sbu=${sbu} banner=${banner} entity=${entity.name}`
    );

    let bulkLoadCommand: BulkLoadEntityCommand;
    if ("product-family" == entity.name) {
      if (entity.ids) {
        // create command for load by ids
        const productFamilies = [];
        for (const pfId of entity.ids) {
          bulkLoadCommand = {
            banner: banner,
            sbu: sbu,
            entity: {
              name: entity.name,
              id: pfId,
            } as BulkLoadEntity,
          } as BulkLoadEntityCommand;

          context.log(
            `#bulk-load-orchestrator is about to trigger execution of bulk-load-executor for sbu=${sbu} banner=${banner} entity=${entity.name} and pfId=${pfId}`
          );
          productFamilies.push(
            yield context.df.callActivity("bulk-load-executor", bulkLoadCommand)
          );
        }
        outputs.push(productFamilies);
      } else {
        // crate command to load product-family by cursor
        bulkLoadCommand = {
          banner: banner,
          sbu: sbu,
          entity: {
            name: entity.name,
          } as BulkLoadEntity,
        } as BulkLoadEntityCommand;

        const pfCursorResponse: BulkLoadResponse =
          yield context.df.callActivity("bulk-load-executor", bulkLoadCommand);
        // walk via data items to load data for each PF
        const productFamilies = [];
        for (const pfItemId of pfCursorResponse.data) {
          bulkLoadCommand = {
            banner: banner,
            sbu: sbu,
            entity: {
              name: entity.name,
              id: pfItemId,
            } as BulkLoadEntity,
          } as BulkLoadEntityCommand;
          context.log(
            `#bulk-load-orchestrator is about to trigger execution of bulk-load-executor for sbu=${sbu} banner=${banner} entity=${entity.name} and pfId=${pfItemId} from cursor page ${pfCursorResponse._command.entity.cursor}`
          );
          productFamilies.push(
            yield context.df.callActivity("bulk-load-executor", bulkLoadCommand)
          );
        }
        context.log(
          `#bulk-load-orchestrator got response from pf bulk load for cursor ${JSON.stringify(
            pfCursorResponse
          )} and corresponding wal via items from cursor page ${JSON.stringify(
            productFamilies
          )}`
        );
      }
    } else {
      bulkLoadCommand = {
        banner: banner,
        sbu: sbu,
        entity: {
          name: entity.name,
        },
      } as BulkLoadEntityCommand;
      outputs.push(
        yield context.df.callActivity("bulk-load-executor", bulkLoadCommand)
      );
      context.log(
        `#bulk-load-orchestrator got response from executors for loading of ${
          bulkLoadCommand.entity.name
        } ${JSON.stringify(outputs)}`
      );
    }
  }

  return outputs;
});

export default orchestrator;
