import { FormEvent, ChangeEvent } from 'react';
import { CardInput } from '@/components/CardInput/CardInput';
import { Button } from '@/components/Button/Button';
import { usePaymentForm } from '@/hooks/usePaymentForm';
import styles from './PaymentForm.module.css';

interface PaymentFormProps {
  total: number;
  onSubmit: (data: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    holderName: string;
    email: string;
  }) => void;
  loading?: boolean;
}

function formatBRL(amount: number): string {
  return (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function PaymentForm({ total, onSubmit, loading }: PaymentFormProps) {
  const { form, errors, setField, setExpiry, validate, getRawCardNumber } = usePaymentForm();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      cardNumber: getRawCardNumber(),
      expMonth: form.expMonth,
      expYear: form.expYear,
      cvc: form.cvc,
      holderName: form.holderName,
      email: form.email,
    });
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.section}>
        <label className={styles.label}>E-mail</label>
        <input
          type="email"
          className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
          placeholder="seu@email.com"
          value={form.email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField('email', e.target.value)}
          autoComplete="email"
        />
        {errors.email && <span className={styles.error}>{errors.email}</span>}
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Informacoes do cartao</label>
        <div className={styles.cardGroup}>
          <CardInput
            value={form.cardNumber}
            onChange={(value) => setField('cardNumber', value)}
            error={errors.cardNumber}
          />
          <div className={styles.cardRow}>
            <input
              type="text"
              className={`${styles.input} ${styles.cardExpiry} ${errors.expMonth ? styles.inputError : ''}`}
              placeholder="MM / AA"
              value={form.expMonth && form.expYear ? `${form.expMonth}/${form.expYear}` : form.expMonth || ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setExpiry(e.target.value)}
              inputMode="numeric"
              autoComplete="cc-exp"
              maxLength={5}
            />
            <input
              type="text"
              className={`${styles.input} ${styles.cardCvc} ${errors.cvc ? styles.inputError : ''}`}
              placeholder="CVC"
              value={form.cvc}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setField('cvc', e.target.value)}
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
            />
          </div>
          {(errors.expMonth || errors.cvc) && (
            <span className={styles.error}>{errors.expMonth || errors.cvc}</span>
          )}
        </div>
      </div>

      <div className={styles.section}>
        <label className={styles.label}>Nome do titular</label>
        <input
          type="text"
          className={`${styles.input} ${errors.holderName ? styles.inputError : ''}`}
          placeholder="Nome impresso no cartao"
          value={form.holderName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setField('holderName', e.target.value)}
          autoComplete="cc-name"
        />
        {errors.holderName && <span className={styles.error}>{errors.holderName}</span>}
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        style={{ width: '100%', padding: '12px', fontSize: '16px', marginTop: '8px' }}
      >
        Pagar {formatBRL(total)}
      </Button>
    </form>
  );
}
