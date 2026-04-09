// src/pages/Ventas.jsx
import { useState, useEffect } from 'react';
import { ShoppingCart, User, Package, Clock, TrendingUp, Lock } from 'lucide-react';
import '../styles/ventas.css';

// ── Mock Data ──────────────────────────────────────────────
const MOCK_CLIENTES = [
  { id_cliente: 'C-001', nombre: 'Supermercado El Sol'  },
  { id_cliente: 'C-002', nombre: 'María González'       },
  { id_cliente: 'C-003', nombre: 'Restaurante La Pampa' },
  { id_cliente: 'C-004', nombre: 'Carlos Herrera'       },
  { id_cliente: 'C-005', nombre: 'Distribuidora Norte'  },
  { id_cliente: 'C-006', nombre: 'Laura Pérez'          },
];

const MOCK_CATALOGO = [
  { id_producto: 'SKU-001', nombre: 'Producto A',   tipo: 'Categoría 1', precio: 1200  },
  { id_producto: 'SKU-002', nombre: 'Producto B',   tipo: 'Categoría 1', precio: 3400  },
  { id_producto: 'SKU-003', nombre: 'Producto C',   tipo: 'Categoría 2', precio: 800   },
  { id_producto: 'SKU-005', nombre: 'Servicio A',   tipo: 'Servicio',    precio: 5000  },
  { id_producto: 'SKU-006', nombre: 'Servicio B',   tipo: 'Servicio',    precio: 9800  },
  { id_producto: 'SKU-007', nombre: 'Promo Pack 1', tipo: 'Promoción',   precio: 4200  },
];

// Historial mock del día — hace que el demo se vea "vivo"
const MOCK_HISTORIAL = [
  { id: 1, cliente: 'Supermercado El Sol',  producto: 'Producto A',   cantidad: 3, total: 3600,  hora: '09:14' },
  { id: 2, cliente: 'Carlos Herrera',       producto: 'Servicio A',   cantidad: 1, total: 5000,  hora: '10:02' },
  { id: 3, cliente: 'Distribuidora Norte',  producto: 'Promo Pack 1', cantidad: 2, total: 8400,  hora: '11:30' },
  { id: 4, cliente: 'María González',       producto: 'Producto C',   cantidad: 5, total: 4000,  hora: '12:47' },
];

const formatPrice = (n) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });
// ──────────────────────────────────────────────────────────

export default function Ventas() {
  const [clientes]  = useState(MOCK_CLIENTES);
  const [catalogo]  = useState(MOCK_CATALOGO);
  const [historial, setHistorial] = useState(MOCK_HISTORIAL);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [busquedaCliente, setBusquedaCliente] = useState('');
  const [formData, setFormData] = useState({
    id_cliente: '', id_producto: '',
    cantidad: 1, precio_unitario: 0, total: 0
  });

  // Fake load — simula que el sistema carga datos reales
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(t);
  }, []);

  const handleClienteBuscador = (e) => {
    const val = e.target.value;
    setBusquedaCliente(val);
    const encontrado = clientes.find(c => c.nombre === val);
    setFormData(prev => ({ ...prev, id_cliente: encontrado?.id_cliente || '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let next = { ...formData, [name]: value };

    if (name === 'id_producto') {
      const prod   = catalogo.find(p => p.id_producto === value);
      const precio = prod ? parseFloat(prod.precio) : 0;
      next.precio_unitario = precio;
      next.total = precio * next.cantidad;
    }
    if (name === 'cantidad') {
      const cant = parseInt(value) || 0;
      next.total = next.precio_unitario * cant;
    }
    setFormData(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.id_cliente) return;
    if (!formData.id_producto || formData.cantidad <= 0) return;

    setSaving(true);

    // Simula delay de red
    setTimeout(() => {
      const cliente = clientes.find(c => c.id_cliente === formData.id_cliente);
      const prod    = catalogo.find(p => p.id_producto === formData.id_producto);
      const ahora   = new Date();
      const hora    = ahora.toTimeString().slice(0, 5);

      setHistorial(prev => [{
        id:       Date.now(),
        cliente:  cliente?.nombre  || '—',
        producto: prod?.nombre     || '—',
        cantidad: formData.cantidad,
        total:    formData.total,
        hora,
      }, ...prev]);

      setFormData(prev => ({
        ...prev,
        id_producto: '', cantidad: 1, precio_unitario: 0, total: 0
      }));

      setSaving(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }, 800);
  };

  const totalDia = historial.reduce((a, v) => a + v.total, 0);

  if (loading) return (
    <div className="ventas-loading">
      <div className="loading-spinner" />
      <span>Cargando sistema...</span>
    </div>
  );

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <header className="page-header">
        <div>
          <h2>Registrar Nueva Venta</h2>
          <p>Seleccioná el cliente y producto para registrar la transacción.</p>
        </div>
        <div className="header-badge">
          <TrendingUp size={14} />
          {formatPrice(totalDia)} hoy
        </div>
      </header>

      {/* ── Demo Banner ── */}
      <div className="demo-banner">
        <Lock size={14} />
        <span>Modo demo — las ventas no se guardan en el sistema real.</span>
      </div>

      {showToast && (
        <div className="demo-toast">
          ✓ Venta registrada en el historial. En el sistema real se guardaría en la base de datos.
        </div>
      )}

      {/* ── Formulario ── */}
      <div className="form-card ventas-form">

        {/* Cliente */}
        <div className="form-group">
          <label><User size={13} /> Cliente</label>
          <input
            list="lista-clientes"
            placeholder="Escribí nombre o razón social..."
            value={busquedaCliente}
            onChange={handleClienteBuscador}
            autoComplete="off"
          />
          <datalist id="lista-clientes">
            {clientes.map(c => <option key={c.id_cliente} value={c.nombre} />)}
          </datalist>
          {busquedaCliente && !formData.id_cliente && (
            <small className="field-hint error">Cliente no encontrado. Seleccioná uno de la lista.</small>
          )}
          {formData.id_cliente && (
            <small className="field-hint success">✓ Cliente vinculado correctamente</small>
          )}
        </div>

        {/* Producto + Cantidad */}
        <div className="form-row ventas-row">
          <div className="form-group">
            <label><Package size={13} /> Producto</label>
            <select name="id_producto" value={formData.id_producto} onChange={handleChange} required>
              <option value="">— Seleccione producto —</option>
              {catalogo.map(p => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre} · {p.tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Cantidad</label>
            <input
              type="number"
              name="cantidad"
              min="1"
              value={formData.cantidad}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Resumen */}
        <div className="form-summary">
          <div className="summary-item">
            <span>Precio unitario</span>
            <strong>{formatPrice(formData.precio_unitario)}</strong>
          </div>
          <div className="summary-item highlight">
            <span>Total a cobrar</span>
            <strong>{formatPrice(formData.total)}</strong>
          </div>
        </div>

        <button
          className="btn-primary btn-full"
          onClick={handleSubmit}
          disabled={saving || !formData.id_cliente || !formData.id_producto}
        >
          {saving
            ? <><div className="btn-spinner" /> Registrando...</>
            : <><ShoppingCart size={16} /> Confirmar Venta</>}
        </button>
      </div>

      {/* ── Historial del día ── */}
      <div className="card table-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="table-title">
          <Clock size={16} />
          Ventas del día
          <span className="table-count">{historial.length} registros</span>
        </h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Hora</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {historial.map(v => (
                <tr key={v.id}>
                  <td><span className="hora-badge">{v.hora}</span></td>
                  <td className="td-nombre">{v.cliente}</td>
                  <td className="td-muted">{v.producto}</td>
                  <td className="td-muted">×{v.cantidad}</td>
                  <td className="td-precio">{formatPrice(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Total del día */}
        <div className="table-footer">
          <span>Total acumulado del día</span>
          <strong className="total-dia">{formatPrice(totalDia)}</strong>
        </div>
      </div>

    </div>
  );
}