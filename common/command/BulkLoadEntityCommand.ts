import { BulkLoadEntity } from "./BulkLoadEntity";

export interface BulkLoadEntityCommand {
  sbu: string;
  banner: string;
  maxItems: number | undefined;
  entity: BulkLoadEntity;
}
