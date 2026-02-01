import { Option } from "./Option.js?v=4b7549b1";

export class Setting extends Option {
  constructor(slug, label, { subname = null, onChange = null } = {}) {
    super(label, { subname, slug, onChange });
  }
}
