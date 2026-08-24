import { Option } from "./Option.js?v=19128fb1";

export class Setting extends Option {
  constructor(slug, label, { subname = null, onChange = null } = {}) {
    super(label, { subname, slug, onChange });
  }
}
