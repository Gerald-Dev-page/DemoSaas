// src/pages/Dashboard.jsx
import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, DollarSign,
  ShoppingCart, Package, BarChart2,
  FileDown, Calendar, Lock
} from 'lucide-react';
import '../styles/dashboard.css';

// ── Helpers ────────────────────────────────────────────────
const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const formatPrice = (n) =>
  n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

// ── Mock Data Generator ────────────────────────────────────
const CATEGORIAS = ['Categoría 1', 'Categoría 2', 'Servicio', 'Promoción'];
const CLIENTES   = ['Supermercado El Sol','María González','Restaurante La Pampa',
                    'Carlos Herrera','Distribuidora Norte','Laura Pérez'];
const CATALOGO   = [
  { id_producto: 'SKU-001', nombre: 'Producto A',   tipo: 'Categoría 1', precio: 1200  },
  { id_producto: 'SKU-002', nombre: 'Producto B',   tipo: 'Categoría 1', precio: 3400  },
  { id_producto: 'SKU-003', nombre: 'Producto C',   tipo: 'Categoría 2', precio: 800   },
  { id_producto: 'SKU-005', nombre: 'Servicio A',   tipo: 'Servicio',    precio: 5000  },
  { id_producto: 'SKU-006', nombre: 'Servicio B',   tipo: 'Servicio',    precio: 9800  },
  { id_producto: 'SKU-007', nombre: 'Promo Pack 1', tipo: 'Promoción',   precio: 4200  },
];

// Genera ventas para los últimos N días con variación realista
const generarVentasMock = () => {
  const ventas = [];
  const hoy    = new Date();
  let id       = 1;

  for (let diasAtras = 0; diasAtras < 30; diasAtras++) {
    const fecha    = new Date(hoy);
    fecha.setDate(hoy.getDate() - diasAtras);
    // Menos ventas en fines de semana
    const esFinDeSemana = [0, 6].includes(fecha.getDay());
    const cantVentas    = esFinDeSemana
      ? Math.floor(Math.random() * 3) + 1
      : Math.floor(Math.random() * 6) + 3;

    for (let i = 0; i < cantVentas; i++) {
      const prod     = CATALOGO[Math.floor(Math.random() * CATALOGO.length)];
      const cantidad = Math.floor(Math.random() * 4) + 1;
      ventas.push({
        id_venta:       `V-${String(id++).padStart(4,'0')}`,
        fecha:          toDateStr(fecha),
        cliente:        CLIENTES[Math.floor(Math.random() * CLIENTES.length)],
        id_producto:    prod.id_producto,
        tipo:           prod.tipo,
        nombre_producto:prod.nombre,
        cantidad,
        precio_unitario:prod.precio,
        total:          prod.precio * cantidad,
      });
    }
  }
  return ventas;
};

const MOCK_VENTAS = generarVentasMock();
// ──────────────────────────────────────────────────────────

export default function Dashboard() {
  const [loading,          setLoading]          = useState(true);
  const [tipoFiltro,       setTipoFiltro]       = useState('dia');
  const hoyStr                                   = toDateStr(new Date());
  const primerDiaMes                             = toDateStr(new Date(new Date().setDate(1)));
  const [fechaSeleccionada,setFechaSeleccionada] = useState(hoyStr);
  const [fechaInicio,      setFechaInicio]       = useState(primerDiaMes);
  const [fechaFin,         setFechaFin]          = useState(hoyStr);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // ── Métricas principales ──
  const metricas = useMemo(() => {
    const enRango = (fechaStr) => tipoFiltro === 'dia'
      ? fechaStr === fechaSeleccionada
      : fechaStr >= fechaInicio && fechaStr <= fechaFin;

    // Período anterior (misma duración, desplazado atrás)
    const diasRango = tipoFiltro === 'dia' ? 1
      : Math.max(1, Math.round((new Date(fechaFin) - new Date(fechaInicio)) / 86400000) + 1);

    const inicioAnterior = new Date(tipoFiltro === 'dia'
      ? fechaSeleccionada : fechaInicio);
    inicioAnterior.setDate(inicioAnterior.getDate() - diasRango);
    const finAnterior    = new Date(tipoFiltro === 'dia'
      ? fechaSeleccionada : fechaFin);
    finAnterior.setDate(finAnterior.getDate() - diasRango);
    const inicioAntStr   = toDateStr(inicioAnterior);
    const finAntStr      = toDateStr(finAnterior);

    const enRangoAnterior = (f) => f >= inicioAntStr && f <= finAntStr;

    let ingresos = 0, ingresosAnt = 0, ingresosHoy = 0;
    let transacciones = 0, transaccionesAnt = 0;
    const porCategoria = {};

    MOCK_VENTAS.forEach(v => {
      if (v.fecha === hoyStr)        ingresosHoy += v.total;
      if (enRango(v.fecha)) {
        ingresos      += v.total;
        transacciones += 1;
        porCategoria[v.tipo] = (porCategoria[v.tipo] || 0) + v.cantidad;
      }
      if (enRangoAnterior(v.fecha)) {
        ingresosAnt      += v.total;
        transaccionesAnt += 1;
      }
    });

    const pctIngresos = ingresosAnt > 0
      ? Math.round(((ingresos - ingresosAnt) / ingresosAnt) * 100) : null;
    const pctTrans    = transaccionesAnt > 0
      ? Math.round(((transacciones - transaccionesAnt) / transaccionesAnt) * 100) : null;

    const totalUnidades = Object.values(porCategoria).reduce((a,b) => a+b, 0) || 1;

    return {
      ingresosHoy, ingresos, pctIngresos,
      transacciones, pctTrans,
      ticketPromedio: transacciones > 0 ? Math.round(ingresos / transacciones) : 0,
      porCategoria, totalUnidades,
    };
  }, [tipoFiltro, fechaSeleccionada, fechaInicio, fechaFin, hoyStr]);

  // ── Tendencia últimos 7 días (para el gráfico de barras) ──
  const tendencia7d = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const str   = toDateStr(d);
      const total = MOCK_VENTAS
        .filter(v => v.fecha === str)
        .reduce((a, v) => a + v.total, 0);
      const label = d.toLocaleDateString('es-AR', { weekday: 'short' });
      return { str, total, label };
    });
  }, []);

  const maxBar = Math.max(...tendencia7d.map(d => d.total), 1);

  // ── Últimas ventas del período ──
  const ultimasVentas = useMemo(() => {
    const enRango = (f) => tipoFiltro === 'dia'
      ? f === fechaSeleccionada
      : f >= fechaInicio && f <= fechaFin;
    return MOCK_VENTAS.filter(v => enRango(v.fecha)).slice(0, 5);
  }, [tipoFiltro, fechaSeleccionada, fechaInicio, fechaFin]);

  if (loading) return (
    <div className="dash-loading">
      <div className="loading-spinner" />
      <span>Analizando métricas...</span>
    </div>
  );

  const labelPeriodo = tipoFiltro === 'dia'
    ? `Fecha: ${fechaSeleccionada}`
    : `${fechaInicio} → ${fechaFin}`;

  return (
    <div className="page-container dashboard-page">

      {/* ── Header ── */}
      <header className="page-header dashboard-header">
        <div>
          <h2>Panel de Rendimiento</h2>
          <p>Reporte analítico de ventas e ingresos.</p>
        </div>
        <div className="dashboard-controls no-print">
          <select
            className="filtro-selector"
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
          >
            <option value="dia">Día específico</option>
            <option value="rango">Rango de fechas</option>
          </select>

          {tipoFiltro === 'rango' ? (
            <div className="rango-fechas">
              <input type="date" className="fecha-selector"
                value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              <span className="rango-sep">→</span>
              <input type="date" className="fecha-selector"
                value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
          ) : (
            <input type="date" className="fecha-selector"
              value={fechaSeleccionada} onChange={(e) => setFechaSeleccionada(e.target.value)} />
          )}

          <button className="btn-export no-print" onClick={() => window.print()}>
            <FileDown size={15} /> Exportar PDF
          </button>
        </div>
      </header>

      {/* ── Demo Banner ── */}
      <div className="demo-banner no-print">
        <Lock size={14} />
        <span>Modo demo — datos simulados para ilustrar las capacidades del sistema.</span>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid">

        {/* Ingresos hoy */}
        <div className="kpi-card kpi-highlight">
          <div className="kpi-icon"><DollarSign size={20} /></div>
          <div className="kpi-label">Ingresos de hoy</div>
          <div className="kpi-value">{formatPrice(metricas.ingresosHoy)}</div>
          <div className="kpi-sub">Cierre a las 00:00 hs</div>
        </div>

        {/* Ingresos período */}
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-blue"><TrendingUp size={20} /></div>
          <div className="kpi-label">Ingresos del período</div>
          <div className="kpi-value">{formatPrice(metricas.ingresos)}</div>
          <div className="kpi-sub">{labelPeriodo}</div>
          {metricas.pctIngresos !== null && (
            <div className={`kpi-badge ${metricas.pctIngresos >= 0 ? 'badge-up' : 'badge-down'}`}>
              {metricas.pctIngresos >= 0
                ? <TrendingUp size={11} />
                : <TrendingDown size={11} />}
              {Math.abs(metricas.pctIngresos)}% vs período anterior
            </div>
          )}
        </div>

        {/* Transacciones */}
        <div className="kpi-card">
          <div className="kpi-icon kpi-icon-green"><ShoppingCart size={20} /></div>
          <div className="kpi-label">Transacciones</div>
          <div className="kpi-value">{metricas.transacciones}</div>
          <div className="kpi-sub">
            Ticket promedio: {formatPrice(metricas.ticketPromedio)}
          </div>
          {metricas.pctTrans !== null && (
            <div className={`kpi-badge ${metricas.pctTrans >= 0 ? 'badge-up' : 'badge-down'}`}>
              {metricas.pctTrans >= 0
                ? <TrendingUp size={11} />
                : <TrendingDown size={11} />}
              {Math.abs(metricas.pctTrans)}% vs período anterior
            </div>
          )}
        </div>
      </div>

      {/* ── Módulos ── */}
      <div className="dash-modules">

        {/* Gráfico tendencia 7d */}
        <div className="dash-module module-wide">
          <div className="module-header">
            <h3><BarChart2 size={16} /> Tendencia — últimos 7 días</h3>
          </div>
          <div className="bar-chart">
            {tendencia7d.map((d) => {
              const pct     = Math.round((d.total / maxBar) * 100);
              const esHoy   = d.str === hoyStr;
              return (
                <div className="bar-col" key={d.str}>
                  <div className="bar-amount">{formatPrice(d.total)}</div>
                  <div className="bar-track">
                    <div
                      className={`bar-fill ${esHoy ? 'bar-fill-today' : ''}`}
                      style={{ height: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                  <div className={`bar-label ${esHoy ? 'bar-label-today' : ''}`}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Distribución por categoría */}
        <div className="dash-module">
          <div className="module-header">
            <h3><Package size={16} /> Distribución por categoría</h3>
          </div>
          <div className="cat-list">
            {CATEGORIAS.map((cat, i) => {
              const cant  = metricas.porCategoria[cat] || 0;
              const pct   = Math.round((cant / metricas.totalUnidades) * 100);
              const colors= ['#2563EB','#22C55E','#F59E0B','#A855F7'];
              return (
                <div className="cat-row" key={cat}>
                  <div className="cat-info">
                    <span className="cat-dot" style={{ background: colors[i] }} />
                    <span className="cat-name">{cat}</span>
                    <span className="cat-units">{cant} u.</span>
                  </div>
                  <div className="cat-bar-track">
                    <div className="cat-bar-fill"
                      style={{ width: `${pct}%`, background: colors[i] }} />
                  </div>
                  <span className="cat-pct">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Últimas ventas ── */}
      <div className="card table-card" style={{ marginTop: '1.5rem' }}>
        <h3 className="table-title">
          <Calendar size={16} />
          Últimas ventas del período
          <span className="table-count">{ultimasVentas.length} registros</span>
        </h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Producto</th>
                <th>Cant.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {ultimasVentas.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign:'center', color:'var(--color-text-muted)', padding:'2rem' }}>
                    Sin ventas en el período seleccionado.
                  </td>
                </tr>
              ) : ultimasVentas.map(v => (
                <tr key={v.id_venta}>
                  <td><span className="id-badge">{v.id_venta}</span></td>
                  <td className="td-muted">{v.fecha}</td>
                  <td className="td-nombre">{v.cliente}</td>
                  <td className="td-muted">{v.nombre_producto}</td>
                  <td className="td-muted">×{v.cantidad}</td>
                  <td className="td-precio">{formatPrice(v.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print footer */}
      <div className="print-footer only-print">
        Reporte generado el {new Date().toLocaleDateString('es-AR')} · {labelPeriodo}
      </div>

    </div>
  );
}