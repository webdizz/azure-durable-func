import * as df from "durable-functions";

const orchestrator = df.orchestrator(function* (context) {
  const outputs = [];

  context.log(
    "#bulk-load-orchestrator Is about to trigger first execution of bulk-load-executor"
  );
  outputs.push(
    yield context.df.callActivity("bulk-load-executor", "product-family")
  );
  outputs.push(
    yield context.df.callActivity("bulk-load-executor", "digital-taxonomy")
  );

  context.log(`#bulk-load-orchestrator got response from executors ${outputs}`);

  return outputs;
});

export default orchestrator;
