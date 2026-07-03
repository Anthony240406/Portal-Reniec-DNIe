/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, HelpCircle, Fingerprint, Lock, Info, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { MOCK_CIUDADANOS } from '../data';
import { Ciudadano } from '../types';

interface DNIeLoginProps {
  onLogin: (dni: string, ciudadano: Ciudadano) => void;
  error?: string;
}

export const DNIeLogin: React.FC<DNIeLoginProps> = ({ onLogin, error: externalError }) => {
  const [dni, setDni] = useState('');
  const [error, setError] = useState(externalError || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from test accounts helper
  const handleSelectMock = (testDni: string) => {
    setDni(testDni);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{8}$/.test(dni)) {
      setError('El número de DNI debe contener exactamente 8 caracteres numéricos.');
      return;
    }

    setIsSubmitting(true);

    // Simulate database lookup in RENIEC registers
    setTimeout(() => {
      const registrado = MOCK_CIUDADANOS[dni];
      if (registrado) {
        onLogin(dni, registrado);
      } else {
        // If not found, dynamically initialize a new mock citizen so the app stays functional for any DNI entered by the user
        const nuevoCiudadano: Ciudadano = {
          dni,
          nombres: 'USUARIO',
          primerApellido: 'PRUEBA',
          segundoApellido: 'RENIEC',
          fechaNacimiento: '1995-01-01',
          genero: 'M',
          direccionActual: 'AV. JAVIER PRADO ESTE 450',
          departamento: 'LIMA',
          provincia: 'LIMA',
          distrito: 'SAN ISIDRO',
          donacionOrganos: true,
          correo: 'usuario.prueba@email.com',
          celular: '999999999',
        };
        onLogin(dni, nuevoCiudadano);
      }
      setIsSubmitting(false);
    }, 800);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // only digits
    if (value.length <= 8) {
      setDni(value);
      if (error) setError('');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto" id="login-container">
      {/* GOB.PE Institutional Badge */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 text-white font-bold px-1.5 py-0.5 text-[10px] rounded tracking-wider">
            GOB.PE
          </div>
          <span className="text-[11px] font-medium text-slate-500">
            Plataforma del Estado Peruano
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Lock className="h-3 w-3" />
          <span className="text-[10px] font-mono tracking-wider">SECURE SSL</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
        {/* National Ribbon decoration */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-white to-red-600" />

        <div className="p-8">
          {/* RENIEC Brand and Logo Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3.5 bg-blue-50 text-[#003B7E] rounded-2xl mb-4 border border-blue-100">
              <Fingerprint className="h-10 w-10 text-[#003B7E]" />
            </div>
            <h1 className="text-2xl font-bold text-[#003B7E] tracking-tight">
              RENIEC
            </h1>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1">
              Registro Nacional de Identificación y Estado Civil
            </p>
            <div className="h-[2px] w-12 bg-red-600 mx-auto mt-4" />
            <h2 className="text-sm font-semibold text-slate-700 mt-3">
              Renovación de DNI Electrónico (DNIe)
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="dni-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Número de DNI del Ciudadano
              </label>
              
              {/* Visual validation input wrapper */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  id="dni-input"
                  name="dni"
                  value={dni}
                  onChange={handleInputChange}
                  placeholder="Ingrese los 8 dígitos"
                  className={`w-full text-center tracking-[0.2em] font-mono text-lg sm:text-xl font-bold rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 transition-all text-slate-800 placeholder:text-xs placeholder:tracking-normal placeholder:font-sans placeholder:text-slate-400 placeholder:font-normal ${
                    dni.length === 0
                      ? 'bg-slate-50 border border-slate-300 focus:ring-[#003B7E] focus:bg-white'
                      : dni.length === 8
                      ? 'bg-emerald-50/10 border-emerald-500 focus:ring-emerald-500 focus:bg-white text-emerald-800'
                      : 'bg-amber-50/10 border-amber-400 focus:ring-amber-500 focus:bg-white text-amber-800'
                  }`}
                  required
                  autoFocus
                  maxLength={8}
                />
                
                {/* Right-side dynamic status indicator */}
                <div className="absolute right-3.5 flex items-center pointer-events-none">
                  {dni.length === 0 ? (
                    <span className="text-[10px] font-bold text-slate-400 font-mono tracking-normal">
                      0/8
                    </span>
                  ) : dni.length === 8 ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 animate-pulse" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                
                {/* Left-side biometric key decoration */}
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Fingerprint className={`h-4.5 w-4.5 transition-colors duration-200 ${
                    dni.length === 8 
                      ? 'text-emerald-500' 
                      : dni.length > 0 
                      ? 'text-amber-500' 
                      : 'text-slate-400'
                  }`} />
                </div>
              </div>

              {/* Warning/Guidance Text when input is partially filled */}
              {dni.length > 0 && dni.length < 8 && (
                <div className="mt-2 text-xs text-amber-600 flex items-start gap-1.5 font-semibold bg-amber-50 border border-amber-100 rounded-lg p-2 animate-fadeIn" id="login-dni-warning">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                  <span>El DNI debe tener exactamente 8 dígitos numéricos (actualmente ingresados: {dni.length}/8).</span>
                </div>
              )}

              {error && (
                <div className="mt-2 text-xs text-red-600 flex items-start gap-1.5 font-medium" id="login-error">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || dni.length !== 8}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
                dni.length === 8 && !isSubmitting
                  ? 'bg-[#003B7E] hover:bg-[#002D62] text-white hover:shadow-lg cursor-pointer'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }`}
              id="btn-login-submit"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Consultando Padrón...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  <span>Iniciar Trámite Seguro</span>
                  <ArrowRight className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* Tips / Security Notice */}
          <div className="mt-8 bg-slate-50 border border-slate-150 rounded-xl p-4 flex gap-3">
            <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <span className="font-bold block text-slate-700 mb-0.5">Trámite 100% Digitalizado</span>
              Asegúrese de contar con su pago de tasas correspondiente, su dirección actualizada y una cámara web activa para la validación biofacial con IA.
            </div>
          </div>
        </div>
      </div>

      {/* Preset Mock Citizen Selector Panel for Evaluators */}
      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm" id="test-accounts-panel">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <HelpCircle className="h-4 w-4 text-blue-600" />
          DNI de Prueba para Evaluación (RENIEC Mock DB)
        </h3>
        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Haga clic en cualquiera de estos perfiles precargados para simular una consulta inmediata en el Padrón Nacional:
        </p>
        <div className="grid grid-cols-1 gap-2">
          {Object.values(MOCK_CIUDADANOS).map((c) => (
            <button
              key={c.dni}
              type="button"
              onClick={() => handleSelectMock(c.dni)}
              className="text-left bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-lg p-2.5 transition-all flex justify-between items-center group cursor-pointer"
            >
              <div>
                <p className="text-xs font-bold text-[#003B7E] group-hover:text-[#002D62]">
                  {c.nombres} {c.primerApellido}
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  DNI: {c.dni} • Región: {c.departamento}
                </p>
              </div>
              <span className="text-[10px] font-semibold bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 px-2 py-0.5 rounded transition-colors font-mono">
                {c.dni}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
