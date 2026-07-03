/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, Database, RefreshCw, Key, AlertCircle } from 'lucide-react';
import { Ciudadano, SolicitudRenovacion, Pago } from '../types';

interface StatusBannerProps {
  ciudadano: Ciudadano | null;
  solicitud: SolicitudRenovacion | null;
  pago: Pago | null;
  tokenJWT: string;
  hasRestored: boolean;
  onReset: () => void;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({
  ciudadano,
  solicitud,
  pago,
  tokenJWT,
  hasRestored,
  onReset,
}) => {
  if (!ciudadano) return null;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-3 px-4 shadow-inner" id="status-banner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono">
        {/* Core Info */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-blue-400">
            <Database className="h-4 w-4 shrink-0" />
            <span className="font-semibold uppercase text-[10px] tracking-wider bg-blue-950/80 border border-blue-800 px-1.5 py-0.5 rounded text-blue-300">
              ESTADO DEL SISTEMA
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Ciudadano:</span>
            <span className="text-white font-semibold">
              {ciudadano.nombres} {ciudadano.primerApellido} ({ciudadano.dni})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Firma Digital:</span>
            <div className="flex items-center gap-1 bg-slate-800 text-emerald-400 border border-slate-700 px-1.5 py-0.5 rounded max-w-[180px] truncate" title={tokenJWT}>
              <Key className="h-3 w-3 text-emerald-500 shrink-0" />
              <span className="truncate">{tokenJWT || 'No generado'}</span>
            </div>
          </div>

          {solicitud && (
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Liveness & OACI:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${solicitud.livenessAprobado ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                {solicitud.livenessAprobado ? 'Aprobado' : 'Pendiente'}
              </span>
              
              <span className="text-slate-400">Pago:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${pago?.estadoPago === 'APROBADO' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                {pago?.estadoPago === 'APROBADO' ? `S/. ${pago.monto.toFixed(2)} (${pago.metodoPago})` : 'Pendiente'}
              </span>
            </div>
          )}
        </div>

        {/* Restore Action */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {hasRestored && (
            <div className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded animate-pulse">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Sesión Restaurada</span>
            </div>
          )}
          
          <button
            onClick={onReset}
            className="flex items-center gap-1 bg-red-950/50 hover:bg-red-950 border border-red-900 hover:border-red-700 text-red-400 px-2.5 py-1 rounded transition-all cursor-pointer"
            id="btn-reset-session"
            title="Borra la sesión local y reinicia desde la pantalla de DNI"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Reiniciar Proceso</span>
          </button>
        </div>
      </div>
    </div>
  );
};
