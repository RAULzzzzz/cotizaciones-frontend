// Datos estáticos para ir viendo el flujo del workspace de cotizaciones.
// Cuando modelemos la base de datos, esto se reemplaza por llamadas a la API
// (services/api.ts) manteniendo los mismos tipos.

export type EstadoCotizacion =
  | 'Borrador'
  | 'ListaParaEnviar'
  | 'Enviada'
  | 'Aceptada'
  | 'Rechazada'
  | 'Vencida'
  | 'Cancelada'

export type EstadoCompra = 'Agendada' | 'Comprada' | 'Cancelada' | null

export interface Partida {
  id: number
  numeroPartida: number
  descripcion: string
  especificacionesTecnicas: string
  sku: string
  cantidad: number
  unidad: string
  precioUnitarioVenta: number
  importe: number
  requiereCompra: boolean
  estadoCompra: EstadoCompra
}

export interface Cotizacion {
  id: number
  folio: string
  version: number
  estado: EstadoCotizacion
  tipoCliente: 'Empresa' | 'Particular'
  nombreComercial: string
  atencionA: string
  nombreAsesor: string
  moneda: string
  vigenciaHasta: string
  subtotal: number
  impuestos: number
  total: number
  utilidadEstimada: number
  partidas: Partida[]
}

// Estilos por estado — mismos tokens que el proyecto anterior.
export const ESTADOS: Record<EstadoCotizacion, { bg: string; color: string; label?: string }> = {
  Borrador: { bg: 'var(--bg-soft)', color: 'var(--text-soft)' },
  ListaParaEnviar: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Lista para enviar' },
  Enviada: { bg: 'var(--blue-light)', color: '#1D4ED8' },
  Aceptada: { bg: 'var(--success-bg)', color: 'var(--success)' },
  Rechazada: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
  Vencida: { bg: 'var(--orange-bg)', color: 'var(--orange)' },
  Cancelada: { bg: 'var(--danger-bg)', color: 'var(--danger)' },
}

// Qué estados se pueden alcanzar desde el estado actual.
export const TRANSICIONES: Partial<Record<EstadoCotizacion, EstadoCotizacion[]>> = {
  Borrador: ['ListaParaEnviar', 'Cancelada'],
  ListaParaEnviar: ['Borrador', 'Enviada', 'Cancelada'],
  Enviada: ['Aceptada', 'Rechazada', 'Vencida', 'Cancelada'],
}

export const CHIP_ESTADO_COMPRA: Record<string, { bg: string; color: string; label: string }> = {
  Agendada: { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Compra agendada' },
  Comprada: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Comprada' },
  Cancelada: { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Compra cancelada' },
}

export const dinero = (valor: number, moneda = 'MXN') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda || 'MXN',
    maximumFractionDigits: 2,
  }).format(Number(valor || 0))

export const fecha = (valor: string) =>
  valor
    ? new Date(`${String(valor).slice(0, 10)}T12:00:00`).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : 'Sin definir'

export const COTIZACIONES: Cotizacion[] = [
  {
    id: 1,
    folio: 'COT-2026-0041',
    version: 1,
    estado: 'Enviada',
    tipoCliente: 'Empresa',
    nombreComercial: 'Distribuidora El Roble S.A. de C.V.',
    atencionA: 'Ing. Marcela Ruiz',
    nombreAsesor: 'Raúl Cruz',
    moneda: 'MXN',
    vigenciaHasta: '2026-09-30',
    subtotal: 84500,
    impuestos: 13520,
    total: 98020,
    utilidadEstimada: 18600,
    partidas: [
      {
        id: 11,
        numeroPartida: 1,
        descripcion: 'Laptop Dell Latitude 5450',
        especificacionesTecnicas: 'Core i7-1355U, 16 GB RAM, 512 GB SSD, 14"',
        sku: 'DL-5450-I7',
        cantidad: 5,
        unidad: 'PZA',
        precioUnitarioVenta: 13500,
        importe: 67500,
        requiereCompra: true,
        estadoCompra: 'Agendada',
      },
      {
        id: 12,
        numeroPartida: 2,
        descripcion: 'Monitor LG 24" IPS Full HD',
        especificacionesTecnicas: '24MP400, 75 Hz, HDMI + VGA',
        sku: 'LG-24MP400',
        cantidad: 5,
        unidad: 'PZA',
        precioUnitarioVenta: 2800,
        importe: 14000,
        requiereCompra: true,
        estadoCompra: 'Comprada',
      },
      {
        id: 13,
        numeroPartida: 3,
        descripcion: 'Instalación y configuración de equipos',
        especificacionesTecnicas: 'Incluye migración de perfiles y alta en dominio',
        sku: '',
        cantidad: 1,
        unidad: 'SERV',
        precioUnitarioVenta: 3000,
        importe: 3000,
        requiereCompra: false,
        estadoCompra: null,
      },
    ],
  },
  {
    id: 2,
    folio: 'COT-2026-0040',
    version: 2,
    estado: 'Aceptada',
    tipoCliente: 'Empresa',
    nombreComercial: 'Constructora Vega y Asociados',
    atencionA: 'Lic. Hugo Vega',
    nombreAsesor: 'Raúl Cruz',
    moneda: 'MXN',
    vigenciaHasta: '2026-09-15',
    subtotal: 41200,
    impuestos: 6592,
    total: 47792,
    utilidadEstimada: 9400,
    partidas: [
      {
        id: 21,
        numeroPartida: 1,
        descripcion: 'Impresora multifuncional HP LaserJet M428fdw',
        especificacionesTecnicas: 'Dúplex automático, red y WiFi',
        sku: 'HP-M428FDW',
        cantidad: 2,
        unidad: 'PZA',
        precioUnitarioVenta: 11600,
        importe: 23200,
        requiereCompra: true,
        estadoCompra: 'Comprada',
      },
      {
        id: 22,
        numeroPartida: 2,
        descripcion: 'Tóner HP 59A original',
        especificacionesTecnicas: 'Rendimiento 3,000 páginas',
        sku: 'HP-CF259A',
        cantidad: 6,
        unidad: 'PZA',
        precioUnitarioVenta: 3000,
        importe: 18000,
        requiereCompra: true,
        estadoCompra: 'Comprada',
      },
    ],
  },
  {
    id: 3,
    folio: 'COT-2026-0039',
    version: 1,
    estado: 'ListaParaEnviar',
    tipoCliente: 'Particular',
    nombreComercial: 'Ana Sofía Miranda',
    atencionA: '',
    nombreAsesor: 'Raúl Cruz',
    moneda: 'MXN',
    vigenciaHasta: '2026-09-22',
    subtotal: 18900,
    impuestos: 3024,
    total: 21924,
    utilidadEstimada: 4100,
    partidas: [
      {
        id: 31,
        numeroPartida: 1,
        descripcion: 'PC de escritorio armada gamer',
        especificacionesTecnicas: 'Ryzen 5 5600, RTX 4060, 16 GB, 1 TB NVMe',
        sku: 'PC-R5-4060',
        cantidad: 1,
        unidad: 'PZA',
        precioUnitarioVenta: 18900,
        importe: 18900,
        requiereCompra: true,
        estadoCompra: null,
      },
    ],
  },
  {
    id: 4,
    folio: 'COT-2026-0038',
    version: 1,
    estado: 'Borrador',
    tipoCliente: 'Empresa',
    nombreComercial: 'Clínica Santa Elena',
    atencionA: 'Dra. Paulina Ortiz',
    nombreAsesor: 'Raúl Cruz',
    moneda: 'MXN',
    vigenciaHasta: '',
    subtotal: 7350,
    impuestos: 1176,
    total: 8526,
    utilidadEstimada: 1550,
    partidas: [
      {
        id: 41,
        numeroPartida: 1,
        descripcion: 'No-break APC 1500VA',
        especificacionesTecnicas: 'BX1500M, 10 contactos, LCD',
        sku: 'APC-BX1500M',
        cantidad: 3,
        unidad: 'PZA',
        precioUnitarioVenta: 2450,
        importe: 7350,
        requiereCompra: true,
        estadoCompra: null,
      },
    ],
  },
  {
    id: 5,
    folio: 'COT-2026-0037',
    version: 3,
    estado: 'Rechazada',
    tipoCliente: 'Empresa',
    nombreComercial: 'Transportes del Bajío',
    atencionA: 'C.P. Julio Navarro',
    nombreAsesor: 'Raúl Cruz',
    moneda: 'MXN',
    vigenciaHasta: '2026-08-28',
    subtotal: 132000,
    impuestos: 21120,
    total: 153120,
    utilidadEstimada: 27300,
    partidas: [
      {
        id: 51,
        numeroPartida: 1,
        descripcion: 'Servidor Dell PowerEdge T350',
        especificacionesTecnicas: 'Xeon E-2314, 32 GB ECC, 2×2 TB SAS',
        sku: 'DL-T350',
        cantidad: 1,
        unidad: 'PZA',
        precioUnitarioVenta: 96000,
        importe: 96000,
        requiereCompra: true,
        estadoCompra: 'Cancelada',
      },
      {
        id: 52,
        numeroPartida: 2,
        descripcion: 'Switch administrable Cisco CBS350-24T',
        especificacionesTecnicas: '24 puertos Gigabit, capa 3',
        sku: 'CS-CBS350-24T',
        cantidad: 2,
        unidad: 'PZA',
        precioUnitarioVenta: 18000,
        importe: 36000,
        requiereCompra: true,
        estadoCompra: 'Cancelada',
      },
    ],
  },
  {
    id: 6,
    folio: 'COT-2026-0036',
    version: 1,
    estado: 'Vencida',
    tipoCliente: 'Particular',
    nombreComercial: 'Roberto Cárdenas',
    atencionA: '',
    nombreAsesor: 'Raúl Cruz',
    moneda: 'MXN',
    vigenciaHasta: '2026-08-10',
    subtotal: 5600,
    impuestos: 896,
    total: 6496,
    utilidadEstimada: 980,
    partidas: [
      {
        id: 61,
        numeroPartida: 1,
        descripcion: 'Cambio de pantalla laptop HP 15"',
        especificacionesTecnicas: 'Panel LED 15.6" FHD + mano de obra',
        sku: '',
        cantidad: 1,
        unidad: 'SERV',
        precioUnitarioVenta: 5600,
        importe: 5600,
        requiereCompra: true,
        estadoCompra: null,
      },
    ],
  },
]
