import { Link } from 'react-router-dom';
import styles from './CancelPage.module.css';

export function CancelPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>&#10005;</div>
        <h1 className={styles.title}>Pagamento cancelado</h1>
        <p className={styles.message}>
          O pagamento foi cancelado. Nenhuma cobranca foi realizada.
        </p>
        <Link to="/" className={styles.link}>
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
