import { ProductFilters as Filters } from '@/services/products.service';
import styles from './ProductFilters.module.css';

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ProductFilters({ filters, onChange }: ProductFiltersProps) {
  return (
    <div className={styles.filters}>
      <input
        type="text"
        className={styles.searchInput}
        placeholder="Buscar por nome..."
        value={filters.name || ''}
        onChange={(e) => onChange({ ...filters, name: e.target.value || undefined })}
      />
      <select
        className={styles.select}
        value={filters.active || ''}
        onChange={(e) => onChange({ ...filters, active: e.target.value || undefined })}
      >
        <option value="">Todos os status</option>
        <option value="true">Ativos</option>
        <option value="false">Inativos</option>
      </select>
      <select
        className={styles.select}
        value={filters.priceType || ''}
        onChange={(e) => onChange({ ...filters, priceType: e.target.value || undefined })}
      >
        <option value="">Todos os tipos</option>
        <option value="recurring">Recorrente</option>
        <option value="one_time">Avulso</option>
      </select>
    </div>
  );
}
