import { useState, useEffect } from 'react';
import { getCheckoutSession, CheckoutSession } from '@/services/checkout.service';

export function useCheckoutSession(id: string | undefined) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchSession() {
      try {
        setLoading(true);
        const data = await getCheckoutSession(id!);
        if (!cancelled) {
          setSession(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar sessão');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchSession();
    return () => { cancelled = true; };
  }, [id]);

  return { session, loading, error };
}
