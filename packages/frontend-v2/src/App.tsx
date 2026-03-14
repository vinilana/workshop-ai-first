import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout/Layout';
import { ProductsPage } from '@/pages/Products/ProductsPage';
import { CheckoutPage } from '@/pages/Checkout/CheckoutPage';
import { SuccessPage } from '@/pages/Success/SuccessPage';
import { CancelPage } from '@/pages/Cancel/CancelPage';

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<ProductsPage />} />
        <Route path="/checkout/:id" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/cancel" element={<CancelPage />} />
      </Routes>
    </Layout>
  );
}
