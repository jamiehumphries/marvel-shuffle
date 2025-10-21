import { Option } from "./Option.js?v=e23707aa";

export class Setting extends Option {
  constructor(slug, label, { subname = null, onChange = null } = {}) {
    super(label, { subname, slug, onChange });
  }
}
