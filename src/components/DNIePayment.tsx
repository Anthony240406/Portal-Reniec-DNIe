/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CreditCard, CheckCircle, Smartphone, AlertCircle, Sparkles, Building2, QrCode } from 'lucide-react';
import { TASA_RENOVACION_DNIE } from '../data';
import { Pago, MetodoPago } from '../types';

interface DNIePaymentProps {
  dni: string;
  onPaymentSuccess: (pago: Pago) => void;
  onPrev: () => void;
}

export const DNIePayment: React.FC<DNIePaymentProps> = ({ dni, onPaymentSuccess, onPrev }) => {
  const [selectedMethod, setSelectedMethod] = useState<MetodoPago | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Yape / Plin form state
  const [celularPago, setCelularPago] = useState('');
  const [codigoAprobacion, setCodigoAprobacion] = useState('');
  
  // Pagalo.pe form state
  const [ccNumber, setCcNumber] = useState('');
  const [ccExpiry, setCcExpiry] = useState('');
  const [ccCvv, setCcCvv] = useState('');
  const [ccEmail, setCcEmail] = useState('');

  const [error, setError] = useState('');

  // Handle Yape / Plin submission
  const handleWalletSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^9\d{8}$/.test(celularPago)) {
      setError('Ingrese un número de celular válido de 9 dígitos.');
      return;
    }
    if (!/^\d{6}$/.test(codigoAprobacion)) {
      setError('El código de aprobación de Yape/Plin debe tener exactamente 6 dígitos.');
      return;
    }

    processMockPayment();
  };

  // Handle Pagalo.pe credit card submission
  const handlePagaloSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const plainCard = ccNumber.replace(/\s+/g, '');
    if (plainCard.length < 16) {
      setError('Número de tarjeta de crédito/débito incompleto.');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(ccExpiry)) {
      setError('Fecha de vencimiento debe tener formato MM/AA.');
      return;
    }
    if (ccCvv.length < 3) {
      setError('Código CVV inválido.');
      return;
    }

    processMockPayment();
  };

  const processMockPayment = () => {
    setIsProcessing(true);
    setError('');

    // Simulate high-performance gateway response
    setTimeout(() => {
      const generatedCode = 'TX-' + Math.floor(100000 + Math.random() * 900000);
      const nuevoPago: Pago = {
        idPago: 'PAG-' + Math.floor(100000 + Math.random() * 900000),
        monto: TASA_RENOVACION_DNIE.montoSoles,
        metodoPago: selectedMethod!,
        codigoTransaccion: generatedCode,
        fechaPago: new Date().toISOString(),
        estadoPago: 'APROBADO',
      };
      
      onPaymentSuccess(nuevoPago);
      setIsProcessing(false);
    }, 1500);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    if (formatted.length <= 19) {
      setCcNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCcExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCcExpiry(value);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto" id="payment-container">
      {/* Step Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Paso 1: Pasarela de Pagos In-App
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Complete el pago de la tasa oficial para poder emitir el nuevo DNIe.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Tasa details banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold bg-[#003B7E] text-white uppercase tracking-wider font-mono">
              CÓDIGO TASA: {TASA_RENOVACION_DNIE.codigoConcepto}
            </span>
            <h3 className="text-xs font-bold text-slate-700 mt-1.5 uppercase">
              {TASA_RENOVACION_DNIE.descripcion}
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Entidad Recaudadora: RENIEC (Código Tributario Nacional)
            </p>
          </div>
          <div className="text-right flex sm:flex-col items-baseline sm:items-end justify-between w-full sm:w-auto mt-2 sm:mt-0">
            <span className="text-xs text-slate-500 font-medium sm:block">Monto a pagar:</span>
            <span className="text-2xl font-black text-[#003B7E] font-mono ml-2 sm:ml-0">
              S/. {TASA_RENOVACION_DNIE.montoSoles.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Methods Selection */}
        <div className="p-6">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Seleccione el Medio de Pago
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            {/* YAPE */}
            <button
              type="button"
              onClick={() => { setSelectedMethod('YAPE'); setError(''); }}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center relative cursor-pointer ${
                selectedMethod === 'YAPE'
                  ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
              id="payment-method-yape"
            >
              <Smartphone className={`h-6 w-6 ${selectedMethod === 'YAPE' ? 'text-purple-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">Yape</span>
              <span className="text-[9px] text-purple-600 bg-purple-100 font-bold px-1.5 py-0.2 rounded mt-0.5">Instantáneo</span>
            </button>

            {/* PLIN */}
            <button
              type="button"
              onClick={() => { setSelectedMethod('PLIN'); setError(''); }}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center relative cursor-pointer ${
                selectedMethod === 'PLIN'
                  ? 'border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
              id="payment-method-plin"
            >
              <Smartphone className={`h-6 w-6 ${selectedMethod === 'PLIN' ? 'text-teal-600' : 'text-slate-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">Plin</span>
              <span className="text-[9px] text-teal-600 bg-teal-100 font-bold px-1.5 py-0.2 rounded mt-0.5">Instantáneo</span>
            </button>

            {/* PAGALO.PE */}
            <button
              type="button"
              onClick={() => { setSelectedMethod('PAGALO_PE'); setError(''); }}
              className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-center relative cursor-pointer ${
                selectedMethod === 'PAGALO_PE'
                  ? 'border-blue-700 bg-blue-50 text-blue-900 ring-2 ring-blue-600/30'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600'
              }`}
              id="payment-method-pagalo"
            >
              <CreditCard className={`h-6 w-6 ${selectedMethod === 'PAGALO_PE' ? 'text-blue-700' : 'text-slate-400'}`} />
              <span className="text-xs font-bold uppercase tracking-wider">Págalo.pe</span>
              <span className="text-[9px] text-blue-700 bg-blue-100 font-bold px-1.5 py-0.2 rounded mt-0.5">Tarjetas / BN</span>
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-xs flex gap-2" id="payment-error">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dynamic Forms based on selection */}
          <div className="mt-6 border-t border-slate-100 pt-6">
            
            {/* YAPE / PLIN SIMULATION */}
            {(selectedMethod === 'YAPE' || selectedMethod === 'PLIN') && (
              <form onSubmit={handleWalletSubmit} className="space-y-4">
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-4 md:pb-0 md:pr-4">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-inner mb-2">
                      <QrCode className={`h-36 w-36 ${selectedMethod === 'YAPE' ? 'text-purple-900' : 'text-teal-900'}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium text-center leading-tight">
                      Escanee este código QR con la app de su banco para transferir S/. {TASA_RENOVACION_DNIE.montoSoles.toFixed(2)}
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label htmlFor="celular-pago" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Número de Celular Asociado
                      </label>
                      <input
                        type="tel"
                        id="celular-pago"
                        value={celularPago}
                        onChange={(e) => setCelularPago(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="Ej: 987654321"
                        maxLength={9}
                        className="w-full text-sm font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003B7E] focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="codigo-pago" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Código de Aprobación (SMS)
                      </label>
                      <input
                        type="text"
                        id="codigo-pago"
                        value={codigoAprobacion}
                        onChange={(e) => setCodigoAprobacion(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Código de 6 dígitos"
                        maxLength={6}
                        className="w-full text-center text-sm font-mono tracking-[0.25em] font-bold bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003B7E] focus:outline-none"
                        required
                      />
                      <p className="text-[9px] text-slate-500 mt-1 leading-snug">
                        Simule ingresando cualquier código de 6 dígitos (ej. 123456).
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all ${
                    selectedMethod === 'YAPE' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                  id="btn-submit-wallet"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Validando Transferencia...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4.5 w-4.5" />
                      <span>Confirmar Pago de S/. {TASA_RENOVACION_DNIE.montoSoles.toFixed(2)} con {selectedMethod}</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* PAGALO.PE SIMULATION */}
            {selectedMethod === 'PAGALO_PE' && (
              <form onSubmit={handlePagaloSubmit} className="space-y-4">
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-1">
                    <div className="flex items-center gap-1.5 text-blue-800">
                      <Building2 className="h-4.5 w-4.5" />
                      <span className="text-[11px] font-bold tracking-wider font-mono">PAGALO.PE (BANCO DE LA NACIÓN)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold font-mono">TRANSACCIÓN SEGURA</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label htmlFor="card-number" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Número de Tarjeta
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="card-number"
                          value={ccNumber}
                          onChange={handleCardNumberChange}
                          placeholder="4000 1234 5678 9010"
                          className="w-full text-sm font-mono bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
                          required
                        />
                        <div className="absolute right-3 top-2.5">
                          <CreditCard className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="card-expiry" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Expiración (MM/AA)
                      </label>
                      <input
                        type="text"
                        id="card-expiry"
                        value={ccExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className="w-full text-sm font-mono text-center bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="card-cvv" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Código CVV
                      </label>
                      <input
                        type="password"
                        id="card-cvv"
                        value={ccCvv}
                        onChange={(e) => setCcCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="***"
                        maxLength={4}
                        className="w-full text-sm font-mono text-center bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="card-email" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Correo Electrónico para Voucher
                      </label>
                      <input
                        type="email"
                        id="card-email"
                        value={ccEmail}
                        onChange={(e) => setCcEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="w-full text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-[#003B7E] hover:bg-blue-800 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
                  id="btn-submit-pagalo"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Procesando pago en Pasarela BN...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4.5 w-4.5" />
                      <span>Pagar Tasa S/. {TASA_RENOVACION_DNIE.montoSoles.toFixed(2)} por Págalo.pe</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {!selectedMethod && (
              <div className="text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Sparkles className="h-5 w-5 text-slate-300" />
                <span>Por favor, elija uno de los tres medios de pago disponibles arriba.</span>
              </div>
            )}

          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            id="btn-payment-back"
          >
            Atrás: Consultar DNI
          </button>
        </div>
      </div>
    </div>
  );
};
