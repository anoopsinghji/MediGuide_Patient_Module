export type DemoPaymentMethod = 'card' | 'upi' | 'netbanking' | 'wallet';

export type DemoPaymentStatus = 'completed';

export interface DemoPaymentRecord {
  appointmentId: string;
  transactionId: string;
  paymentMethod: DemoPaymentMethod;
  paidAmount: number;
  paidAt: string;
  status: DemoPaymentStatus;
  isDemo: true;
}

const STORAGE_KEY = 'mediaguide.demoPayments.v1';

const readAllPayments = (): DemoPaymentRecord[] => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item) => item && typeof item === 'object' && item.appointmentId);
  } catch {
    return [];
  }
};

const writeAllPayments = (records: DemoPaymentRecord[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

export const generateDemoTransactionId = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `DEMO-TXN-${yyyy}${mm}${dd}-${hh}${min}${ss}-${suffix}`;
};

export const upsertDemoPaymentRecord = (record: DemoPaymentRecord) => {
  const current = readAllPayments();
  const next = current.filter((entry) => entry.appointmentId !== record.appointmentId);
  next.push(record);
  writeAllPayments(next);
};

export const getDemoPaymentRecord = (appointmentId: string) => {
  if (!appointmentId) return null;
  const all = readAllPayments();
  return all.find((entry) => entry.appointmentId === appointmentId) || null;
};

export const getDemoPaymentsMap = () => {
  const all = readAllPayments();
  return all.reduce<Record<string, DemoPaymentRecord>>((acc, entry) => {
    acc[entry.appointmentId] = entry;
    return acc;
  }, {});
};

export const clearAllDemoPayments = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
};
