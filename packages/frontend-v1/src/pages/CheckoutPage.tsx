import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// TODO: mover tipos para arquivo separado
interface LineItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  total: number
}

interface CheckoutSession {
  id: string
  status: string
  lineItems: LineItem[]
  totalAmount: number
  currency: string
  successUrl: string
  cancelUrl: string
}

interface CheckoutPageProps {
  clearCart: () => void
}

function CheckoutPage({ clearCart }: CheckoutPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [session, setSession] = useState<CheckoutSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // campos do formulario - todos aqui mesmo, cada um com seu useState
  const [email, setEmail] = useState('')
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [telefone, setTelefone] = useState('')
  const [numeroCartao, setNumeroCartao] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [nomeCartao, setNomeCartao] = useState('')

  // erros de validacao inline - um state pra cada campo
  const [emailError, setEmailError] = useState('')
  const [nomeCompletoError, setNomeCompletoError] = useState('')
  const [telefoneError, setTelefoneError] = useState('')
  const [numeroCartaoError, setNumeroCartaoError] = useState('')
  const [validadeError, setValidadeError] = useState('')
  const [cvvError, setCvvError] = useState('')
  const [nomeCartaoError, setNomeCartaoError] = useState('')

  // buscar sessao de checkout
  useEffect(() => {
    if (!id) return

    fetch('http://localhost:3000/checkout/sessions/' + id)
      .then(res => {
        if (!res.ok) throw new Error('Sessao nao encontrada')
        return res.json()
      })
      .then(response => {
        console.log('sessao response:', response)
        // desembrulhar wrapper {data, success} se existir
        const raw = response.data ? response.data : response
        if (raw.status !== 'open') {
          setError('Esta sessao de pagamento ja foi processada ou expirou.')
        }
        // mapear campos snake_case para camelCase
        const mapped: CheckoutSession = {
          id: raw.id,
          status: raw.status,
          totalAmount: raw.total_amount || raw.totalAmount || 0,
          currency: raw.currency || 'brl',
          successUrl: raw.success_url || raw.successUrl || '',
          cancelUrl: raw.cancel_url || raw.cancelUrl || '',
          lineItems: (raw.line_items || raw.lineItems || []).map((li: any) => ({
            productId: li.product_id || li.productId,
            productName: li.product_name || li.productName || 'Produto',
            quantity: li.quantity,
            unitPrice: li.unit_amount || li.unitPrice || 0,
            total: li.total_amount || li.total || (li.unit_amount || 0) * li.quantity,
          })),
        }
        setSession(mapped)
        setLoading(false)
      })
      .catch(err => {
        console.log('erro ao buscar sessao:', err)
        setError('Erro ao carregar dados do pagamento.')
        setLoading(false)
      })
  }, [id])

  // formatacao de preco (duplicado de HomePage, deveria ser util)
  const formatarPreco = (centavos: number) => {
    return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  // outro formatador de preco, duplicado de proposito
  const formatPrecoSimples = (val: number) => {
    return 'R$ ' + (val / 100).toFixed(2).replace('.', ',')
  }

  // formatar numero do cartao com espacos
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 16) value = value.substring(0, 16)
    // adicionar espacos a cada 4 digitos
    let formatted = ''
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' '
      formatted += value[i]
    }
    setNumeroCartao(formatted)
    setNumeroCartaoError('')
  }

  // formatar expiry MM/AA
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.substring(0, 4)
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2)
    }
    setValidade(value)
    setValidadeError('')
  }

  // validar CVV - so numeros
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value.length > 4) value = value.substring(0, 4)
    setCvv(value)
    setCvvError('')
  }

  // validacao do form - tudo junto, bagunca intencional, checagens duplicadas
  const validateForm = (): boolean => {
    let valid = true

    // validar email
    if (!email) {
      setEmailError('Email e obrigatorio')
      valid = false
    } else if (!email.includes('@') || !email.includes('.')) {
      setEmailError('Email invalido')
      valid = false
    } else {
      setEmailError('')
    }

    // validar nome completo
    if (!nomeCompleto) {
      setNomeCompletoError('Nome completo e obrigatorio')
      valid = false
    } else if (nomeCompleto.trim().length < 3) {
      setNomeCompletoError('Nome muito curto')
      valid = false
    } else if (!nomeCompleto.includes(' ')) {
      setNomeCompletoError('Informe nome e sobrenome')
      valid = false
    } else {
      setNomeCompletoError('')
    }

    // validar telefone
    if (!telefone) {
      setTelefoneError('Telefone e obrigatorio')
      valid = false
    } else if (telefone.replace(/\D/g, '').length < 10) {
      setTelefoneError('Telefone invalido (minimo 10 digitos)')
      valid = false
    } else if (telefone.replace(/\D/g, '').length > 11) {
      setTelefoneError('Telefone invalido (maximo 11 digitos)')
      valid = false
    } else {
      setTelefoneError('')
    }

    // validar numero do cartao
    const cleanCard = numeroCartao.replace(/\s/g, '')
    if (!cleanCard) {
      setNumeroCartaoError('Numero do cartao e obrigatorio')
      valid = false
    } else if (cleanCard.length < 13 || cleanCard.length > 16) {
      setNumeroCartaoError('Numero do cartao invalido')
      valid = false
    } else {
      setNumeroCartaoError('')
    }

    // validar validade
    if (!validade) {
      setValidadeError('Validade e obrigatoria')
      valid = false
    } else if (validade.length !== 5) {
      setValidadeError('Data invalida (MM/AA)')
      valid = false
    } else {
      const parts = validade.split('/')
      const month = parseInt(parts[0])
      const year = parseInt(parts[1])
      if (month < 1 || month > 12) {
        setValidadeError('Mes invalido')
        valid = false
      } else if (year < 24) {
        setValidadeError('Cartao expirado')
        valid = false
      } else {
        setValidadeError('')
      }
    }

    // validar CVV
    if (!cvv) {
      setCvvError('CVV e obrigatorio')
      valid = false
    } else if (cvv.length < 3) {
      setCvvError('CVV invalido')
      valid = false
    } else {
      setCvvError('')
    }

    // validar nome no cartao
    if (!nomeCartao) {
      setNomeCartaoError('Nome no cartao e obrigatorio')
      valid = false
    } else if (nomeCartao.trim().length < 3) {
      setNomeCartaoError('Nome no cartao muito curto')
      valid = false
    } else {
      setNomeCartaoError('')
    }

    return valid
  }

  // submeter pagamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // limpar erros antes de validar
    setEmailError('')
    setNomeCompletoError('')
    setTelefoneError('')
    setNumeroCartaoError('')
    setValidadeError('')
    setCvvError('')
    setNomeCartaoError('')

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const paymentData = {
        checkout_session_id: id,
        customer_email: email,
        payment_method: {
          type: 'credit_card',
          card: {
            number: numeroCartao.replace(/\s/g, ''),
            holder_name: nomeCartao,
            exp_month: parseInt(validade.split('/')[0], 10),
            exp_year: parseInt('20' + validade.split('/')[1], 10),
            cvc: cvv,
          },
        },
      }

      console.log('enviando pagamento:', paymentData)

      const response = await fetch('http://localhost:3000/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Erro no pagamento')
      }

      const resultResponse = await response.json()
      const result = resultResponse.data ? resultResponse.data : resultResponse
      console.log('resultado:', result)

      clearCart()

      // redirecionar baseado no status
      if (result.status === 'paid' || result.status === 'completed' || result.status === 'approved' || result.status === 'succeeded') {
        navigate('/success?session_id=' + id)
      } else {
        navigate('/cancel?session_id=' + id)
      }
    } catch (err: any) {
      console.log('erro pagamento:', err)
      alert('Erro ao processar pagamento: ' + (err.message || 'Tente novamente'))
    } finally {
      setSubmitting(false)
    }
  }

  // cancelar pagamento
  const handleCancel = () => {
    if (window.confirm('Tem certeza que deseja cancelar o pagamento?')) {
      navigate('/cancel?session_id=' + id)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: '#666' }}>Carregando dados do pagamento...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px', color: 'red', backgroundColor: '#ffe0e0', padding: '20px', border: '1px solid red' }}>{error}</p>
        <br />
        <a href="/">Voltar para a loja</a>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ color: '#1a1a6e', marginBottom: '5px', fontFamily: 'Times New Roman, serif' }}>Pagamento</h1>
      <hr style={{ border: '1px solid #1a1a6e', marginBottom: '20px' }} />

      {/* layout com table porque sim */}
      <table style={{ width: '100%', border: 'none' }}>
        <tbody>
          <tr style={{ verticalAlign: 'top' }}>
            {/* formulario de pagamento */}
            <td style={{ width: '60%', paddingRight: '20px', border: 'none' }}>
              <div style={{ backgroundColor: 'white', border: '2px solid #ccc', padding: '20px' }}>
                <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '18px', borderBottom: '1px solid #eee', paddingBottom: '8px', fontFamily: 'Times New Roman, serif' }}>
                  Dados do Pagamento
                </h2>

                <form onSubmit={handleSubmit}>
                  {/* dados pessoais */}
                  <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#f0f0ff', border: '1px solid #9999cc' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '15px', color: '#555', borderBottom: '1px solid #999', paddingBottom: '5px' }}>Dados Pessoais</h3>

                    {/* email */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                        Email *
                      </label>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
                        placeholder="seu@email.com"
                        style={{ width: '100%', padding: '8px', fontSize: '14px', border: emailError ? '2px solid red' : '1px solid #ccc' }}
                      />
                      {emailError && <span style={{ color: 'red', fontSize: '12px' }}>{emailError}</span>}
                    </div>

                    {/* nome completo */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        value={nomeCompleto}
                        onChange={(e) => { setNomeCompleto(e.target.value); setNomeCompletoError('') }}
                        placeholder="Seu nome completo"
                        style={{ width: '100%', padding: '8px', fontSize: '14px', border: nomeCompletoError ? '2px solid red' : '1px solid #ccc' }}
                      />
                      {nomeCompletoError && <span style={{ color: 'red', fontSize: '12px' }}>{nomeCompletoError}</span>}
                    </div>

                    {/* telefone */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                        Telefone *
                      </label>
                      <input
                        type="text"
                        value={telefone}
                        onChange={(e) => { setTelefone(e.target.value); setTelefoneError('') }}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        style={{ width: '100%', padding: '8px', fontSize: '14px', border: telefoneError ? '2px solid red' : '1px solid #ccc' }}
                      />
                      {telefoneError && <span style={{ color: 'red', fontSize: '12px' }}>{telefoneError}</span>}
                    </div>
                  </div>

                  {/* dados do cartao */}
                  <div style={{ marginBottom: '15px', padding: '12px', backgroundColor: '#fff8f0', border: '1px solid #cc9966' }}>
                    <h3 style={{ marginBottom: '10px', fontSize: '15px', color: '#555', borderBottom: '1px solid #999', paddingBottom: '5px' }}>Cartao de Credito</h3>

                    {/* numero do cartao */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                        Numero do Cartao *
                      </label>
                      <input
                        type="text"
                        value={numeroCartao}
                        onChange={handleCardNumberChange}
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        style={{ width: '100%', padding: '8px', fontSize: '16px', fontFamily: 'monospace', letterSpacing: '2px', border: numeroCartaoError ? '2px solid red' : '1px solid #ccc' }}
                      />
                      {numeroCartaoError && <span style={{ color: 'red', fontSize: '12px' }}>{numeroCartaoError}</span>}
                    </div>

                    {/* validade e CVV na mesma linha - gambiarra com table */}
                    <table style={{ width: '100%', border: 'none', marginBottom: '10px' }}>
                      <tbody>
                        <tr>
                          <td style={{ border: 'none', paddingRight: '10px', width: '50%' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                              Validade (MM/AA) *
                            </label>
                            <input
                              type="text"
                              value={validade}
                              onChange={handleExpiryChange}
                              placeholder="MM/AA"
                              maxLength={5}
                              style={{ width: '100%', padding: '8px', fontSize: '14px', border: validadeError ? '2px solid red' : '1px solid #ccc' }}
                            />
                            {validadeError && <span style={{ color: 'red', fontSize: '12px' }}>{validadeError}</span>}
                          </td>
                          <td style={{ border: 'none', width: '50%' }}>
                            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                              CVV *
                            </label>
                            <input
                              type="text"
                              value={cvv}
                              onChange={handleCvvChange}
                              placeholder="000"
                              maxLength={4}
                              style={{ width: '120px', padding: '8px', fontSize: '14px', border: cvvError ? '2px solid red' : '1px solid #ccc' }}
                            />
                            {cvvError && <span style={{ color: 'red', fontSize: '12px' }}>{cvvError}</span>}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* nome no cartao */}
                    <div style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px', fontSize: '13px', color: '#555' }}>
                        Nome no Cartao *
                      </label>
                      <input
                        type="text"
                        value={nomeCartao}
                        onChange={(e) => { setNomeCartao(e.target.value.toUpperCase()); setNomeCartaoError('') }}
                        placeholder="NOME COMO ESTA NO CARTAO"
                        style={{ width: '100%', padding: '8px', fontSize: '14px', textTransform: 'uppercase', border: nomeCartaoError ? '2px solid red' : '1px solid #ccc' }}
                      />
                      {nomeCartaoError && <span style={{ color: 'red', fontSize: '12px' }}>{nomeCartaoError}</span>}
                    </div>
                  </div>

                  <hr style={{ margin: '15px 0', border: '1px solid #eee' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={handleCancel}
                      style={{
                        backgroundColor: '#999',
                        color: 'white',
                        border: 'none',
                        padding: '10px 25px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        backgroundColor: submitting ? '#999' : '#006600',
                        color: 'white',
                        border: 'none',
                        padding: '12px 35px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {submitting ? 'Processando...' : 'Pagar ' + (session ? formatarPreco(session.totalAmount) : '')}
                    </button>
                  </div>
                </form>
              </div>
            </td>

            {/* resumo do pedido */}
            <td style={{ width: '40%', border: 'none' }}>
              <div style={{ backgroundColor: '#f5f5dc', border: '2px solid #cc9900', padding: '20px' }}>
                <h2 style={{ color: '#333', marginBottom: '15px', fontSize: '18px', borderBottom: '1px solid #cc9900', paddingBottom: '8px', fontFamily: 'Times New Roman, serif' }}>
                  Resumo do Pedido
                </h2>

                {session && session.lineItems && session.lineItems.length > 0 ? (
                  <div>
                    {session.lineItems.map((item, idx) => (
                      <div key={idx} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.productName || 'Produto'}</span>
                          <span style={{ fontSize: '14px' }}>x{item.quantity}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                          <span style={{ color: '#666', fontSize: '12px' }}>Preco unit.: {formatPrecoSimples(item.unitPrice)}</span>
                          <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatarPreco(item.total)}</span>
                        </div>
                      </div>
                    ))}

                    <div style={{ borderTop: '2px solid #333', paddingTop: '10px', marginTop: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total</span>
                        <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#006600' }}>
                          {formatarPreco(session.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#666' }}>Carregando itens...</p>
                )}

                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#fff9e6', border: '1px solid #ffcc00', fontSize: '12px', color: '#666' }}>
                  <p><strong>Pagamento seguro</strong></p>
                  <p>Seus dados estao protegidos.</p>
                  <p style={{ marginTop: '5px' }}>Sessao: {id?.substring(0, 8)}...</p>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default CheckoutPage
