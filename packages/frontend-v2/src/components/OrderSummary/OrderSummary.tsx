import styles from './OrderSummary.module.css';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  total: number;
}

function formatBRL(amount: number): string {
  return (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function OrderSummary({ items, total }: OrderSummaryProps) {
  return (
    <div className={styles.summary}>
      <h3 className={styles.title}>Resumo do pedido</h3>
      <ul className={styles.items}>
        {items.map((item, index) => (
          <li key={index} className={styles.item}>
            <div className={styles.itemLeft}>
              <span className={styles.itemName}>{item.name}</span>
              <span className={styles.itemQty}>Qtd: {item.quantity}</span>
            </div>
            <span className={styles.itemPrice}>{formatBRL(item.price * item.quantity)}</span>
          </li>
        ))}
      </ul>
      <div className={styles.divider} />
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatBRL(total)}</span>
      </div>
    </div>
  );
}
