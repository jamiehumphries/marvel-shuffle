import { Option } from "./Option.js?v=cd61c427";

export class Setting extends Option {
  constructor(slug, label, { subname = null, onChange = null } = {}) {
    super(label, { subname, slug, onChange });
  }
}
