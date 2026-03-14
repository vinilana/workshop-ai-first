import { ChangeEvent } from 'react';
import styles from './CardInput.module.css';

interface CardInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

function detectBrand(number: string): string {
  const digits = number.replace(/\s/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^5[1-5]/.test(digits)) return 'Mastercard';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^6(?:011|5)/.test(digits)) return 'Discover';
  if (/^(?:636368|438935|504175|451416|636297)/.test(digits)) return 'Elo';
  return '';
}

export function CardInput({ value, onChange, error }: CardInputProps) {
  const brand = detectBrand(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        placeholder="1234 1234 1234 1234"
        value={value}
        onChange={handleChange}
        inputMode="numeric"
        autoComplete="cc-number"
        maxLength={19}
      />
      {brand && <span className={styles.brand}>{brand}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
