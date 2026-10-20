// src/components/StatusBadge.jsx
import { statusLabel } from "../utils/course";

export default function StatusBadge({ status }) {
  const known = ["open", "close", "cancel"].includes(status) ? status : "unknown";
  return <span className={`status status--${known}`}>{statusLabel(status)}</span>;
}
