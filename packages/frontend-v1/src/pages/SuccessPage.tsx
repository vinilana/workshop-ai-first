import { useSearchParams, Link } from 'react-router-dom'

function SuccessPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', border: '2px solid #006600', padding: '40px' }}>
        <h1 style={{ color: '#006600', fontSize: '32px', marginBottom: '15px', fontFamily: 'Times New Roman, serif' }}>Pagamento realizado com sucesso!</h1>
        <p style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>
          Obrigado pela sua compra. Seu pagamento foi processado com sucesso.
        </p>
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '25px' }}>
          Voce recebera um email com os detalhes da compra.
        </p>
        {sessionId && (
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px' }}>
            ID da transacao: {sessionId}
          </p>
        )}
        <Link
          to="/"
          style={{
            display: 'inline-block',
            backgroundColor: '#1a1a6e',
            color: 'white',
            textDecoration: 'none',
            padding: '10px 25px',
            fontSize: '14px',
          }}
        >
          Voltar para a Loja
        </Link>
      </div>
    </div>
  )
}

export default SuccessPage
