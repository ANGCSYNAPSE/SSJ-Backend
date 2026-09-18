import { Entity } from "../../common/Repository";

/** "Our Initiatives" cards on the home page. */
export interface Initiative extends Entity {
  tag: string;
  title: string;
  desc: string;
  image: string;
  order: number;
}
