import { ChangeEvent } from 'react';
import styles from './CustomerForm.module.css';

interface CustomerFormProps {
  email: string;
  name: string;
  onEmailChange: (value: string) => void;
  onNameChange: (value: string) => void;
  emailError?: string;
  nameError?: string;
}

export function CustomerForm({
  email,
  name,
  onEmailChange,
  onNameChange,
  emailError,
  nameError,
}: CustomerFormProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.field}>
        <label className={styles.label}>E-mail</label>
        <input
          type="email"
          className={`${styles.input} ${emailError ? styles.inputError : ''}`}
          placeholder="seu@email.com"
          value={email}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onEmailChange(e.target.value)}
          autoComplete="email"
        />
        {emailError && <span className={styles.error}>{emailError}</span>}
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Nome completo</label>
        <input
          type="text"
          className={`${styles.input} ${nameError ? styles.inputError : ''}`}
          placeholder="Nome completo"
          value={name}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onNameChange(e.target.value)}
          autoComplete="name"
        />
        {nameError && <span className={styles.error}>{nameError}</span>}
      </div>
    </div>
  );
}
