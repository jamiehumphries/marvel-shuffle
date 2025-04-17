import { Option } from "./Option.js?v=e1a27d50";

export class Setting extends Option {
  constructor(slug, label, { subname = null, onChange = null } = {}) {
    super(label, { subname, slug, onChange });
  }
}
