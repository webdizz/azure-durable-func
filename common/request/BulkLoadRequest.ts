import { Entity } from "./Entity";

export class BulkLoadRequest {
  sbu: string;
  banner: string;
  maxItems: number = 10;
  entities: Array<Entity>;
}
