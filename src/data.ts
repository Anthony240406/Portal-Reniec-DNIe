/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Ciudadano, SedeReniec } from './types';

// Mock database of Peruvian citizens for the platform
export const MOCK_CIUDADANOS: Record<string, Ciudadano> = {
  '12345678': {
    dni: '12345678',
    nombres: 'JUAN ALBERTO',
    primerApellido: 'PEREZ',
    segundoApellido: 'QUISPE',
    fechaNacimiento: '1988-10-15',
    genero: 'M',
    direccionActual: 'AV. PETIT THOUARS 1235, DEPA 402',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'MIRAFLORES',
    donacionOrganos: true,
    correo: 'juan.perez@email.com',
    celular: '987654321',
    diasParaCaducar: 15,
  },
  '87654321': {
    dni: '87654321',
    nombres: 'MARIA ESPERANZA',
    primerApellido: 'FLORES',
    segundoApellido: 'CONDORI',
    fechaNacimiento: '1992-05-24',
    genero: 'F',
    direccionActual: 'CALLE MELGAR 456',
    departamento: 'AREQUIPA',
    provincia: 'AREQUIPA',
    distrito: 'YANAHUARA',
    donacionOrganos: false,
    correo: 'maria.flores@email.com',
    celular: '954123789',
    diasParaCaducar: 120,
  },
  '74561230': {
    dni: '74561230',
    nombres: 'CARLOS AUGUSTO',
    primerApellido: 'RODRIGUEZ',
    segundoApellido: 'MENDOZA',
    fechaNacimiento: '1995-12-03',
    genero: 'M',
    direccionActual: 'JR. SAN MARTIN 789',
    departamento: 'LA LIBERTAD',
    provincia: 'TRUJILLO',
    distrito: 'TRUJILLO',
    donacionOrganos: true,
    correo: 'carlos.rod@email.com',
    celular: '912345678',
    diasParaCaducar: -5,
  },
  '45678912': {
    dni: '45678912',
    nombres: 'SARA ELIZABETH',
    primerApellido: 'HUAMAN',
    segundoApellido: 'VILLANUEVA',
    fechaNacimiento: '1990-08-11',
    genero: 'F',
    direccionActual: 'AV. EL SOL 890',
    departamento: 'CUSCO',
    provincia: 'CUSCO',
    distrito: 'SANTIAGO',
    donacionOrganos: false,
    correo: 'sara.huaman@email.com',
    celular: '999888777',
    diasParaCaducar: 10,
    estadoTramiteInicial: 'PENDIENTE_DE_SUBSANACION',
  }
};

// RENIEC Agencies/Offices (Sedes de Recojo)
export const SEDES_RENIEC: SedeReniec[] = [
  // LIMA
  {
    codigo: 'SED-001',
    nombre: 'Sede Principal Jesús María',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'JESUS MARIA',
    direccion: 'Jr. Talara 130, Jesús María',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm | Sábados 08:45 am - 12:45 pm',
  },
  {
    codigo: 'SED-002',
    nombre: 'OR Miraflores',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'MIRAFLORES',
    direccion: 'Calle Diez Canseco 230, Miraflores',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm',
  },
  {
    codigo: 'SED-003',
    nombre: 'OR Independencia',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'INDEPENDENCIA',
    direccion: 'Av. Alfredo Mendiola 179 - CC. Plaza Norte',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm | Sábados 08:45 am - 12:45 pm',
  },
  {
    codigo: 'SED-004',
    nombre: 'OR San Borja',
    departamento: 'LIMA',
    provincia: 'LIMA',
    distrito: 'SAN BORJA',
    direccion: 'Av. Aviación 2450, San Borja',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm',
  },
  // AREQUIPA
  {
    codigo: 'SED-005',
    nombre: 'OR Arequipa - Centro',
    departamento: 'AREQUIPA',
    provincia: 'AREQUIPA',
    distrito: 'AREQUIPA',
    direccion: 'Calle Santo Domingo 101, Arequipa',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm | Sábados 08:45 am - 12:45 pm',
  },
  {
    codigo: 'SED-006',
    nombre: 'OR Cayma',
    departamento: 'AREQUIPA',
    provincia: 'AREQUIPA',
    distrito: 'CAYMA',
    direccion: 'Av. Cayma 602, Cayma',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm',
  },
  // CUSCO
  {
    codigo: 'SED-007',
    nombre: 'OR Cusco - Wanchaq',
    departamento: 'CUSCO',
    provincia: 'CUSCO',
    distrito: 'WANCHAQ',
    direccion: 'Av. Garcilaso de la Vega 206, Wanchaq',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm | Sábados 08:45 am - 12:45 pm',
  },
  // LA LIBERTAD
  {
    codigo: 'SED-008',
    nombre: 'OR Trujillo - Centro',
    departamento: 'LA LIBERTAD',
    provincia: 'TRUJILLO',
    distrito: 'TRUJILLO',
    direccion: 'Av. Larco 1212, Trujillo',
    horarioAtencion: 'Lunes a Viernes 08:45 am - 04:45 pm | Sábados 08:45 am - 12:45 pm',
  }
];

// Fee details for DNIe Renewal (Code 02121)
export const TASA_RENOVACION_DNIE = {
  codigoConcepto: '02121',
  descripcion: 'Renovación de DNI Electrónico (DNIe) - Ciudadano',
  montoSoles: 41.00,
};

// Peruvian departments, provinces and districts for dropdown lists
export const UBIGEO_DATA: Record<string, Record<string, string[]>> = {
  'LIMA': {
    'LIMA': ['MIRAFLORES', 'JESUS MARIA', 'SAN BORJA', 'INDEPENDENCIA', 'SAN ISIDRO', 'SANTIAGO DE SURCO', 'CHORRILLOS', 'LA VICTORIA'],
    'CALLAO': ['CALLAO', 'BELLAVISTA', 'LA PERLA', 'LA PUNTA']
  },
  'AREQUIPA': {
    'AREQUIPA': ['AREQUIPA', 'CAYMA', 'YANAHUARA', 'BUSTAMANTE Y RIVERO', 'CERRO COLORADO'],
    'CAMANA': ['CAMANA', 'JOSE MARIA QUIMPER', 'MARISCAL CACERES']
  },
  'CUSCO': {
    'CUSCO': ['CUSCO', 'WANCHAQ', 'SANTIAGO', 'SAN SEBASTIAN', 'SAN JERONIMO'],
    'URUBAMBA': ['URUBAMBA', 'OLLANTAYTAMBO', 'CHINCHERO']
  },
  'LA LIBERTAD': {
    'TRUJILLO': ['TRUJILLO', 'VICTOR LARCO HERRERA', 'HUANCHACO', 'EL PORVENIR', 'LA ESPERANZA'],
    'PACASMAYO': ['PACASMAYO', 'SAN PEDRO DE LLOC']
  }
};
