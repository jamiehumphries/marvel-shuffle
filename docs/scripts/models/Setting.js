import { Option } from "./Option.js?v=ec367d18";

export class Setting extends Option {
  constructor(slug, label, { onChange = null, defaultValue = null } = {}) {
    super(label, { slug, onChange, defaultValue });
  }
}
