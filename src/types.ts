/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Ciudadano {
  dni: string;
  nombres: string;
  primerApellido: string;
  segundoApellido: string;
  fechaNacimiento: string;
  genero: string;
  direccionActual: string;
  departamento: string;
  provincia: string;
  distrito: string;
  donacionOrganos: boolean;
  correo: string;
  celular: string;
  diasParaCaducar?: number;
  estadoTramiteInicial?: 'PENDIENTE_DE_SUBSANACION' | 'COMPLETADO' | 'PAGADO' | null;
}

export type MetodoPago = 'YAPE' | 'PLIN' | 'PAGALO_PE';

export interface Pago {
  idPago: string;
  monto: number;
  metodoPago: MetodoPago;
  codigoTransaccion: string;
  fechaPago: string;
  estadoPago: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
}

export interface SolicitudRenovacion {
  idSolicitud: string;
  dniCiudadano: string;
  estado: 'INICIADO' | 'PAGADO' | 'BIOFACIAL_APROBADO' | 'DATOS_ACTUALIZADOS' | 'COMPLETADO';
  fechaInicio: string;
  codigoSedeRecojo: string;
  tokenJWT: string;
  livenessAprobado: boolean;
  oaciAprobado: boolean;
  ultimoPasoCompletado: number;
  biometricMetadata?: {
    livenessConfidence: number; // e.g. 0.998 for 99.8%
    icaoNeutralExpressionScore: number; // e.g. 0.992
    icaoBackgroundUniformityScore: number; // e.g. 0.95
    icaoFaceResolutionScore: number; // e.g. 0.97
    icaoIlluminationScore: number; // e.g. 0.96
    icaoFacialSymmetryScore: number; // e.g. 0.984
    icaoOverallCompliance: number; // e.g. 1.00
  };
}

export interface SedeReniec {
  codigo: string;
  nombre: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccion: string;
  horarioAtencion: string;
}

export interface HistorialSesion {
  dni: string;
  fechaHora: string;
  tokenJWT: string;
  pasoRestaurado: number;
  datosGuardados: {
    ciudadano: Ciudadano;
    pago?: Pago;
    solicitud?: SolicitudRenovacion;
  };
}

export interface NotificationAlert {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

