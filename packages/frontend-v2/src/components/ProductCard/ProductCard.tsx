import { Button } from '@/components/Button/Button';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  name: string;
  description: string;
  price: number;
  onAdd: () => void;
}

function formatBRL(amount: number): string {
  return (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function ProductCard({ name, description, price, onAdd }: ProductCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <h3 className={styles.name}>{name}</h3>
        <p className={styles.description}>{description}</p>
        <p className={styles.price}>{formatBRL(price)}</p>
      </div>
      <Button variant="primary" onClick={onAdd}>
        Adicionar
      </Button>
    </div>
  );
}
