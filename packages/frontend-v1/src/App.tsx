import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CheckoutPage from './pages/CheckoutPage'
import SuccessPage from './pages/SuccessPage'
import CancelPage from './pages/CancelPage'

// TODO: mover carrinho para contexto ou redux
// por enquanto fica aqui mesmo

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null)

  // funcao para adicionar no carrinho - feita rapido
  const addToCart = (product: { id: string; name: string; price: number }) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = () => {
    let total = 0
    for (let i = 0; i < cart.length; i++) {
      total = total + cart[i].price * cart[i].quantity
    }
    return total
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div>
      <div style={{ backgroundColor: '#1a1a6e', padding: '10px 20px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '20px', fontWeight: 'bold' }}>
          Dom Pagamentos
        </Link>
        <div style={{ color: '#ffcc00', fontWeight: 'bold' }}>
          Carrinho: {cartCount} {cartCount === 1 ? 'item' : 'itens'}
          {cartCount > 0 && (
            <span style={{ marginLeft: '10px' }}>
              (R$ {(getCartTotal() / 100).toFixed(2).replace('.', ',')})
            </span>
          )}
        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <HomePage
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            getCartTotal={getCartTotal}
            setCheckoutSessionId={setCheckoutSessionId}
          />
        } />
        <Route path="/checkout/:id" element={
          <CheckoutPage clearCart={clearCart} />
        } />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>

      <div style={{ backgroundColor: '#333', color: '#aaa', textAlign: 'center', padding: '15px', marginTop: '40px', fontSize: '12px' }}>
        <p>&copy; 2024 Dom Pagamentos - Todos os direitos reservados</p>
      </div>
    </div>
  )
}

export default App
