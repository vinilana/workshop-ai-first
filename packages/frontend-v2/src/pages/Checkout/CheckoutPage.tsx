import { useParams, useNavigate } from 'react-router-dom';
import { useCheckoutSession } from '@/hooks/useCheckoutSession';
import { processPayment } from '@/services/payments.service';
import { PaymentForm } from '@/components/PaymentForm/PaymentForm';
import { OrderSummary } from '@/components/OrderSummary/OrderSummary';
import { Spinner } from '@/components/Spinner/Spinner';
import { useState } from 'react';
import styles from './CheckoutPage.module.css';

export function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const { session, loading, error } = useCheckoutSession(id);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePayment = async (data: {
    cardNumber: string;
    expMonth: string;
    expYear: string;
    cvc: string;
    holderName: string;
    email: string;
  }) => {
    if (!id) return;

    try {
      setPaymentLoading(true);
      setPaymentError(null);
      await processPayment({
        checkoutSessionId: id,
        ...data,
      });
      navigate('/success');
    } catch (err) {
      setPaymentError(
        err instanceof Error ? err.message : 'Erro ao processar pagamento'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!session) return <p className={styles.error}>Sessão não encontrada</p>;

  return (
    <div className={styles.page}>
      <div className={styles.formColumn}>
        <h2 className={styles.heading}>Pagamento</h2>
        {paymentError && <p className={styles.paymentError}>{paymentError}</p>}
        <PaymentForm
          total={session.total}
          onSubmit={handlePayment}
          loading={paymentLoading}
        />
      </div>
      <div className={styles.summaryColumn}>
        <OrderSummary
          items={session.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          }))}
          total={session.total}
        />
      </div>
    </div>
  );
}
