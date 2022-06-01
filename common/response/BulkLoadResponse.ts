import { BulkLoadEntityCommand } from "../command/BulkLoadEntityCommand";

export class BulkLoadResponse {
  _command: BulkLoadEntityCommand | undefined;
  data: Array<string>;
}
