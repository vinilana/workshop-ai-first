import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// TODO: tipar direito depois
interface Product {
  id: string
  name: string
  description: string
  price: number // em centavos
  active: boolean
}

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface HomePageProps {
  cart: CartItem[]
  addToCart: (product: { id: string; name: string; price: number }) => void
  removeFromCart: (productId: string) => void
  getCartTotal: () => number
  setCheckoutSessionId: (id: string | null) => void
}

function HomePage({ cart, addToCart, removeFromCart, getCartTotal, setCheckoutSessionId }: HomePageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingCheckout, setCreatingCheckout] = useState(false)
  const navigate = useNavigate()

  // buscar produtos
  useEffect(() => {
    // TODO: tratar erros melhor
    fetch('http://localhost:3000/products')
      .then(response => {
        if (!response.ok) {
          throw new Error('Erro ao buscar produtos')
        }
        return response.json()
      })
      .then(data => {
        console.log('produtos carregados:', data)
        // api pode retornar com wrapper {data, success} ou array direto
        const rawProducts = data.data ? data.data : data
        // mapear precos do formato da api (prices array) para o formato simples
        const mapped = rawProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
          price: p.prices && p.prices.length > 0 ? p.prices[0].unit_amount : (p.price || 0),
        }))
        setProducts(mapped)
        setLoading(false)
      })
      .catch(err => {
        console.log('erro:', err)
        setError('Falha ao carregar produtos. Tente novamente.')
        setLoading(false)
      })
  }, [])

  // formatar preco
  const formatPrice = (priceInCents: number) => {
    return 'R$ ' + (priceInCents / 100).toFixed(2).replace('.', ',')
  }

  // criar sessao de checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Seu carrinho esta vazio!')
      return
    }

    setCreatingCheckout(true)

    try {
      const lineItems = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }))

      const response = await fetch('http://localhost:3000/checkout/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line_items: lineItems,
          success_url: window.location.origin + '/success',
          cancel_url: window.location.origin + '/cancel',
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar sessao')
      }

      const sessionResponse = await response.json()
      const session = sessionResponse.data ? sessionResponse.data : sessionResponse
      console.log('sessao criada:', session)
      setCheckoutSessionId(session.id)
      navigate('/checkout/' + session.id)
    } catch (err) {
      console.log('erro checkout:', err)
      alert('Erro ao criar checkout. Tente novamente.')
    } finally {
      setCreatingCheckout(false)
    }
  }

  // duplicacao intencional de formatacao do preco no carrinho
  const formatCartPrice = (val: number) => {
    const reais = val / 100
    return 'R$ ' + reais.toFixed(2).replace('.', ',')
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a1a6e', marginBottom: '5px', fontSize: '28px' }}>Nossos Produtos</h1>
      <hr style={{ border: '1px solid #1a1a6e', marginBottom: '20px' }} />

      {loading && <p style={{ color: '#666', fontSize: '16px' }}>Carregando produtos...</p>}

      {error && <p style={{ color: 'red', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#ffe0e0', padding: '10px', border: '1px solid red' }}>{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p style={{ color: '#999' }}>Nenhum produto disponivel no momento.</p>
      )}

      {/* tabela de produtos - sim, usando table pra layout */}
      {!loading && products.length > 0 && (
        <table style={{ width: '100%', marginBottom: '30px', backgroundColor: 'white' }}>
          <thead>
            <tr style={{ backgroundColor: '#1a1a6e', color: 'white' }}>
              <th style={{ textAlign: 'left', padding: '10px' }}>Produto</th>
              <th style={{ textAlign: 'left', padding: '10px' }}>Descricao</th>
              <th style={{ textAlign: 'right', padding: '10px' }}>Preco</th>
              <th style={{ textAlign: 'center', padding: '10px' }}>Acao</th>
            </tr>
          </thead>
          <tbody>
            {products.filter(p => p.active !== false).map((product, index) => (
              <tr key={product.id} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ padding: '10px', fontWeight: 'bold', fontSize: '15px' }}>
                  {product.name}
                </td>
                <td style={{ padding: '10px', color: '#666', fontSize: '13px' }}>
                  {product.description || 'Sem descricao'}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#006600', fontSize: '16px' }}>
                  {formatPrice(product.price)}
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <button
                    onClick={() => addToCart({ id: product.id, name: product.name, price: product.price })}
                    style={{
                      backgroundColor: '#ff6600',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    Adicionar ao Carrinho
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* carrinho - tudo junto aqui mesmo */}
      <div style={{ backgroundColor: 'white', border: '2px solid #1a1a6e', padding: '20px' }}>
        <h2 style={{ color: '#1a1a6e', marginBottom: '10px', fontSize: '22px' }}>Carrinho de Compras</h2>

        {cart.length === 0 ? (
          <p style={{ color: '#999', fontStyle: 'italic' }}>Seu carrinho esta vazio. Adicione produtos acima.</p>
        ) : (
          <div>
            <table style={{ width: '100%', marginBottom: '15px' }}>
              <thead>
                <tr style={{ backgroundColor: '#eee' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Item</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Qtd</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Preco Unit.</th>
                  <th style={{ textAlign: 'right', padding: '8px' }}>Subtotal</th>
                  <th style={{ textAlign: 'center', padding: '8px' }}>Remover</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: '8px' }}>{item.name}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatCartPrice(item.price)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>
                      {formatCartPrice(item.price * item.quantity)}
                    </td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          backgroundColor: '#cc0000',
                          color: 'white',
                          border: 'none',
                          padding: '4px 10px',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', borderTop: '2px solid #333', paddingTop: '10px', marginBottom: '15px' }}>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#1a1a6e' }}>
                Total: {formatPrice(getCartTotal())}
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button
                onClick={handleCheckout}
                disabled={creatingCheckout}
                style={{
                  backgroundColor: creatingCheckout ? '#999' : '#006600',
                  color: 'white',
                  border: 'none',
                  padding: '12px 30px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: creatingCheckout ? 'not-allowed' : 'pointer',
                }}
              >
                {creatingCheckout ? 'Criando...' : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default HomePage
