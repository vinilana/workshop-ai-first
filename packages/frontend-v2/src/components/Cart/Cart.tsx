import { Button } from '@/components/Button/Button';
import styles from './Cart.module.css';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  loading?: boolean;
}

function formatBRL(amount: number): string {
  return (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function Cart({ items, onRemove, onCheckout, loading }: CartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className={styles.cart}>
        <h3 className={styles.title}>Carrinho</h3>
        <p className={styles.empty}>Seu carrinho esta vazio</p>
      </div>
    );
  }

  return (
    <div className={styles.cart}>
      <h3 className={styles.title}>Carrinho</h3>
      <ul className={styles.items}>
        {items.map(item => (
          <li key={item.productId} className={styles.item}>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemQty}>x{item.quantity}</span>
            </div>
            <div className={styles.itemActions}>
              <span className={styles.itemPrice}>{formatBRL(item.price * item.quantity)}</span>
              <button className={styles.removeBtn} onClick={() => onRemove(item.productId)}>
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className={styles.divider} />
      <div className={styles.subtotalRow}>
        <span>Subtotal</span>
        <span className={styles.subtotalValue}>{formatBRL(subtotal)}</span>
      </div>
      <Button variant="primary" onClick={onCheckout} loading={loading} style={{ width: '100%', marginTop: '12px' }}>
        Finalizar Compra
      </Button>
    </div>
  );
}
