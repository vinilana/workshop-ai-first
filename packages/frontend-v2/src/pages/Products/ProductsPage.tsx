import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Cart, CartItem } from '@/components/Cart/Cart';
import { Spinner } from '@/components/Spinner/Spinner';
import { createCheckoutSession } from '@/services/checkout.service';
import styles from './ProductsPage.module.css';

export function ProductsPage() {
  const { products, loading, error } = useProducts();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();

  const addToCart = useCallback((product: { id: string; name: string; price: number }) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const handleCheckout = useCallback(async () => {
    if (cartItems.length === 0) return;

    try {
      setCheckoutLoading(true);
      const session = await createCheckoutSession({
        items: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      navigate(`/checkout/${session.id}`);
    } catch (err) {
      console.error('Erro ao criar sessao de checkout:', err);
    } finally {
      setCheckoutLoading(false);
    }
  }, [cartItems, navigate]);

  if (loading) return <Spinner />;
  if (error) return <p className={styles.error}>{error}</p>;

  return (
    <div className={styles.page}>
      <div className={styles.productsSection}>
        <h2 className={styles.heading}>Produtos</h2>
        <div className={styles.grid}>
          {products.map(product => (
            <ProductCard
              key={product.id}
              name={product.name}
              description={product.description}
              price={product.price}
              onAdd={() => addToCart(product)}
            />
          ))}
        </div>
      </div>
      <aside className={styles.cartSection}>
        <Cart
          items={cartItems}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          loading={checkoutLoading}
        />
      </aside>
    </div>
  );
}
