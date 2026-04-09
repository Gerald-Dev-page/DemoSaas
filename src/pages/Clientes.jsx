// src/pages/Clientes.jsx
import { useState } from 'react';
import { Users, MapPin, Phone, PlusCircle, Lock } from 'lucide-react';

// ── Mock Data ──────────────────────────────────────────────
const MOCK_CLIENTES = [
  { id_cliente: 'C-001', nombre: 'Supermercado El Sol', direccion: 'Av. San Martín 450', telefono: '2664-421890' },
  { id_cliente: 'C-002', nombre: 'María González',      direccion: 'Rivadavia 1230, B°Centro', telefono: '2664-538721' },
  { id_cliente: 'C-003', nombre: 'Restaurante La Pampa',direccion: 'Illia 890',              telefono: '2664-712340' },
  { id_cliente: 'C-004', nombre: 'Carlos Herrera',      direccion: 'Los Andes 345, B°Norte', telefono: '2664-334512' },
  { id_cliente: 'C-005', nombre: 'Distribuidora Norte', direccion: 'Ruta 20 Km 4',           telefono: '2664-891230' },
  { id_cliente: 'C-006', nombre: 'Laura Pérez',         direccion: 'Chacabuco 78',            telefono: '2664-220984' },
];
// ──────────────────────────────────────────────────────────

export default function Clientes() {
  const [clientes, setClientes] = useState(MOCK_CLIENTES);
  const [formData, setFormData] = useState({ nombre: '', direccion: '', telefono: '' });
  const [showDemoMsg, setShowDemoMsg] = useState(false);

  // En demo: inserta visualmente pero NO persiste
  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevo = {
      id_cliente: `C-${String(clientes.length + 1).padStart(3, '0')}`,
      ...formData
    };
    setClientes([nuevo, ...clientes]);
    setFormData({ nombre: '', direccion: '', telefono: '' });
    setShowDemoMsg(true);
    setTimeout(() => setShowDemoMsg(false), 3500);
  };

  return (
    <div className="page-container">

      {/* ── Header ── */}
      <header className="page-header">
        <div>
          <h2>Gestión de Clientes</h2>
          <p>Visualizá y administrá la cartera de clientes asociados a tus ventas.</p>
        </div>
        <div className="header-badge">
          <Users size={14} />
          {clientes.length} clientes
        </div>
      </header>

      {/* ── Banner Demo ── */}
      <div className="demo-banner">
        <Lock size={14} />
        <span>Modo demo — los datos no se guardan en el sistema real.</span>
      </div>

      {/* ── Feedback temporal ── */}
      {showDemoMsg && (
        <div className="demo-toast">
          ✓ Cliente agregado visualmente. En el sistema real se guardaría en la base de datos.
        </div>
      )}

      {/* ── Formulario ── */}
      <div className="form-card">
        <h3 className="form-title">
          <PlusCircle size={18} />
          Registrar Nuevo Cliente
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo o Razón Social</label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez / Empresa S.A."
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Dirección de Entrega</label>
              <input
                type="text"
                placeholder="Ej: Calle Falsa 123"
                value={formData.direccion}
                onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Teléfono de Contacto</label>
              <input
                type="tel"
                placeholder="Ej: 2664123456"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>
          </div>

          <button className="btn-primary" type="submit">
            <PlusCircle size={16} />
            Registrar Cliente
          </button>
        </form>
      </div>

      {/* ── Tabla de clientes ── */}
      <div className="card table-card">
        <h3 className="table-title">Clientes Registrados</h3>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre / Razón Social</th>
                <th><MapPin size={13} /> Dirección</th>
                <th><Phone size={13} /> Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c.id_cliente}>
                  <td><span className="id-badge">{c.id_cliente}</span></td>
                  <td className="td-nombre">{c.nombre}</td>
                  <td className="td-muted">{c.direccion}</td>
                  <td className="td-muted">{c.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}