import { Link } from 'react-router-dom';
import styles from './SuccessPage.module.css';

export function SuccessPage() {
  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.checkmark}>&#10003;</div>
        <h1 className={styles.title}>Pagamento confirmado!</h1>
        <p className={styles.message}>
          Seu pagamento foi processado com sucesso.
        </p>
        <Link to="/" className={styles.link}>
          Voltar para a loja
        </Link>
      </div>
    </div>
  );
}
