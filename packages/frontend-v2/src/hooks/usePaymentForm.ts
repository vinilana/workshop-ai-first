import { useState, useCallback } from 'react';

export interface PaymentFormState {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  holderName: string;
  email: string;
  name: string;
}

export interface PaymentFormErrors {
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  holderName?: string;
  email?: string;
  name?: string;
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

export function usePaymentForm() {
  const [form, setForm] = useState<PaymentFormState>({
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvc: '',
    holderName: '',
    email: '',
    name: '',
  });

  const [errors, setErrors] = useState<PaymentFormErrors>({});

  const setField = useCallback((field: keyof PaymentFormState, value: string) => {
    setForm(prev => {
      if (field === 'cvc') {
        return { ...prev, cvc: value.replace(/\D/g, '').slice(0, 4) };
      }
      return { ...prev, [field]: value };
    });
    setErrors(prev => ({ ...prev, [field]: undefined }));
  }, []);

  const setExpiry = useCallback((value: string) => {
    const formatted = formatExpiry(value);
    const parts = formatted.split('/');
    setForm(prev => ({
      ...prev,
      expMonth: parts[0] || '',
      expYear: parts[1] || '',
    }));
    setErrors(prev => ({ ...prev, expMonth: undefined, expYear: undefined }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: PaymentFormErrors = {};
    const digits = form.cardNumber.replace(/\s/g, '');

    if (!digits || digits.length < 13) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }
    if (!form.expMonth || !form.expYear) {
      newErrors.expMonth = 'Data de validade obrigatória';
    }
    if (!form.cvc || form.cvc.length < 3) {
      newErrors.cvc = 'CVC inválido';
    }
    if (!form.holderName.trim()) {
      newErrors.holderName = 'Nome do titular obrigatório';
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const getRawCardNumber = useCallback(() => {
    return form.cardNumber.replace(/\s/g, '');
  }, [form.cardNumber]);

  const getExpiry = useCallback(() => {
    return `${form.expMonth}/${form.expYear}`;
  }, [form.expMonth, form.expYear]);

  return {
    form,
    errors,
    setField,
    setExpiry,
    validate,
    getRawCardNumber,
    getExpiry,
  };
}
