import { toast } from '../lib/toast';

export function showError(message) {
  toast.error(message);
}
