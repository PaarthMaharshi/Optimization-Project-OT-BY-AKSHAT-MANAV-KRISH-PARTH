import CountUp from '../reactbits/CountUp';

/** Measured number that counts up when it scrolls into view; text such as "—" is shown as is. */
export default function StatNumber({ value, decimals, suffix = '' }: { value: number | string | null | undefined; decimals?: number; suffix?: string }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return <>{value ?? '—'}</>;
  return <CountUp to={value} from={0} duration={1.1} decimals={decimals ?? (Number.isInteger(value) ? 0 : 1)} suffix={suffix} trigger="view" />;
}
