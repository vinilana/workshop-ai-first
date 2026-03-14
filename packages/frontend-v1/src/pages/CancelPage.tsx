import { useSearchParams, Link } from 'react-router-dom'

function CancelPage() {
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ backgroundColor: 'white', border: '2px solid #cc0000', padding: '40px' }}>
        <h1 style={{ color: '#cc0000', fontSize: '32px', marginBottom: '15px', fontFamily: 'Times New Roman, serif' }}>Pagamento cancelado</h1>
        <p style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>
          O pagamento nao foi processado.
        </p>
        <p style={{ fontSize: '14px', color: '#999', marginBottom: '25px' }}>
          Nenhum valor foi cobrado. Voce pode tentar novamente.
        </p>
        {sessionId && (
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '20px' }}>
            Sessao: {sessionId}
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

export default CancelPage
