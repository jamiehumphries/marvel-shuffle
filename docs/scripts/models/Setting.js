import { Option } from "./Option.js?v=f6da124b";

export class Setting extends Option {
  constructor(slug, label, { onChange = null, defaultValue = null } = {}) {
    super(label, { slug, onChange, defaultValue });
  }
}
