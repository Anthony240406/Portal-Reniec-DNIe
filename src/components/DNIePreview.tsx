/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Download, CheckCircle, Mail, MapPin, Calendar, Heart, Share2, Award, Printer, QrCode, Smartphone, ShieldCheck, ChevronDown, ChevronUp, Cpu, MessageSquare, Phone, Send, Loader2 } from 'lucide-react';
import { Ciudadano, Pago, SedeReniec, SolicitudRenovacion } from '../types';
import QRCode from 'qrcode';

interface DNIePreviewProps {
  ciudadano: Ciudadano;
  pago: Pago;
  sede: SedeReniec;
  tokenJWT: string;
  solicitud: SolicitudRenovacion;
  onRestart: () => void;
}

export const DNIePreview: React.FC<DNIePreviewProps> = ({
  ciudadano,
  pago,
  sede,
  tokenJWT,
  solicitud,
  onRestart,
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [showTechnicalDetails, setShowTechnicalDetails] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>(ciudadano.celular || '');
  const [smsStatus, setSmsStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [sendSmsReminder, setSendSmsReminder] = useState<boolean>(true);
  const [smsError, setSmsError] = useState<string>('');

  // Generate mock dates for the card
  const emisionDate = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const caducidadDate = new Date(new Date().setFullYear(new Date().getFullYear() + 8)).toLocaleDateString('es-PE', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // Generate QR Code containing digital credential data
  useEffect(() => {
    const generateQR = async () => {
      try {
        // A highly realistic URL that matches official RENIEC digital credential validation portals
        const formattedDate = emisionDate.replace(/\//g, '-');
        const signatureHash = tokenJWT.split('.').pop() || 'sig';
        const verificationUrl = `https://validador.reniec.gob.pe/consultas/dnie/verificar?dni=${ciudadano.dni}&solicitud=${solicitud.idSolicitud}&f_emision=${formattedDate}&s_key=${signatureHash.substring(0, 16).toUpperCase()}`;

        const url = await QRCode.toDataURL(verificationUrl, {
          width: 300,
          margin: 2,
          color: {
            dark: '#003B7E', // Institutional RENIEC blue
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'Q' // Higher error correction level for high accuracy & complexity
        });
        setQrCodeUrl(url);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
  }, [ciudadano, tokenJWT, emisionDate, caducidadDate, solicitud.idSolicitud]);

  // Handle downloading QR code image
  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `DNIE_DIGITAL_QR_${ciudadano.dni}.png`;
    link.click();
  };

  // Handle mock PDF certificate download
  const handleDownload = () => {
    const textContent = `
============================================================
           CONSTANCIA DE TRAMITE DE RENOVACION DNIE
                         RENIEC
============================================================
ID SOLICITUD: ${pago.idPago}
DOCUMENTO DE IDENTIDAD: ${ciudadano.dni}
CIUDADANO: ${ciudadano.nombres} ${ciudadano.primerApellido} ${ciudadano.segundoApellido}
FECHA TRAMITE: ${new Date().toLocaleString('es-PE')}
TASA DE PAGO: S/. ${pago.monto.toFixed(2)} (${pago.metodoPago})
CODIGO DE TRANSACCION: ${pago.codigoTransaccion}

DATOS ACTUALIZADOS EN FICHA REGISTRAL:
------------------------------------------------------------
DOMICILIO: ${ciudadano.direccionActual}
UBIGEO: ${ciudadano.departamento} - ${ciudadano.provincia} - ${ciudadano.distrito}
DONACION DE ORGANOS: ${ciudadano.donacionOrganos ? 'SI' : 'NO'}
CONTACTO: ${ciudadano.correo} / ${ciudadano.celular}

SEDE ELEGIDA PARA RECOJO:
------------------------------------------------------------
AGENCIA: ${sede.nombre}
DIRECCION RECOJO: ${sede.direccion}
HORARIO DE ATENCION: ${sede.horarioAtencion}

VERIFICACION DE SEGURIDAD FIRMADA Y CERTIFICADA POR RENIEC
CODIGO UNICO DE VALIDACION DIGITAL: ${tokenJWT}
CUMPLIMIENTO BIOMETRICO CONFORME (OACI / PRUEBA DE VIDA)

Este documento sirve como constancia oficial de renovación de DNIe.
Se le enviará un correo electrónico cuando el documento físico esté listo para recojo (aproximadamente en 5 a 7 días hábiles).
============================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CONSTAR_DNIE_${ciudadano.dni}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handle simulated SMS confirmation via RENIEC messaging gateway API
  const handleSendSms = (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');

    // Peruvian cellular number validation: starts with 9, exactly 9 digits
    const cleanedPhone = phone.replace(/\D/g, '');
    if (!cleanedPhone.startsWith('9') || cleanedPhone.length !== 9) {
      setSmsError('El número de celular debe comenzar con 9 y tener exactamente 9 dígitos para el formato de Perú.');
      return;
    }

    setSmsStatus('sending');

    // Simulate RENIEC API call latency
    setTimeout(() => {
      setSmsStatus('sent');
    }, 1500);
  };

  return (
    <div className="max-w-3xl w-full mx-auto space-y-8" id="preview-container">
      
      {/* Success Jumbotron Banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Award className="h-40 w-40 text-emerald-800" />
        </div>
        
        <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-800 rounded-full mb-4">
          <CheckCircle className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-black text-emerald-900 tracking-tight">
          ¡Trámite de Renovación Registrado Exitosamente!
        </h2>
        <p className="text-xs text-emerald-700 font-medium max-w-lg mx-auto mt-1.5 leading-relaxed">
          Su solicitud ha sido firmada por el Motor IA de RENIEC, las tasas fueron validadas y se ha generado la nueva ficha registral para su impresión física.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-900 text-white font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-700 font-bold shadow-sm">
          <span>Constancia Generada</span>
          <span className="bg-emerald-700 text-emerald-200 px-1.5 py-0.2 rounded">{ciudadano.dni}</span>
        </div>
      </div>

      {/* Dynamic 3D-styled DNIe Card Visualizer */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
          Vista Previa del nuevo DNI Electrónico (DNIe) generado en PDF
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* FRONT (ANVERSO) */}
          <div className="bg-gradient-to-tr from-sky-50 to-sky-100 border border-sky-300 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1] text-slate-800" id="dnie-front">
            {/* National Banner watermark */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-white to-red-600" />
            
            {/* Top header */}
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-[10px] font-black tracking-tight text-[#003B7E]">REPUBLICA DEL PERU</h4>
                <p className="text-[6px] font-bold text-slate-500 uppercase">Registro Nacional de Identificación y Estado Civil</p>
                <p className="text-[7px] font-extrabold text-[#003B7E] tracking-wider mt-0.5">DOCUMENTO NACIONAL DE IDENTIDAD ELECTRONICO</p>
              </div>
              <div className="text-right">
                <span className="text-[6px] text-slate-400 font-mono">DNIe</span>
                <p className="text-xs font-black text-red-600 font-mono tracking-widest mt-0.5">{ciudadano.dni}</p>
              </div>
            </div>

            {/* Middle details */}
            <div className="flex gap-3 items-center my-1.5 flex-1">
              {/* Photo */}
              <div className="w-18 h-22 bg-slate-200 rounded-md border border-slate-300 overflow-hidden shrink-0 flex items-center justify-center relative shadow">
                <svg className="h-16 w-16 text-slate-400 absolute" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {/* Secondary security ghost image overlay */}
                <div className="absolute right-0 bottom-0 opacity-20 w-8 h-10 bg-slate-300 border-l border-t border-slate-400" />
                <span className="absolute bottom-0 inset-x-0 bg-blue-900/40 text-[5px] text-center text-white py-0.2 font-mono">RENIEC 2026</span>
              </div>

              {/* Data fields */}
              <div className="text-[7px] space-y-0.5 flex-1 leading-tight">
                <div>
                  <span className="text-slate-400 font-bold block">1er Apellido (Surnames)</span>
                  <span className="font-extrabold text-slate-800 uppercase">{ciudadano.primerApellido}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">2do Apellido</span>
                  <span className="font-extrabold text-slate-800 uppercase">{ciudadano.segundoApellido}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">Pre-Nombres (Given Names)</span>
                  <span className="font-extrabold text-slate-800 uppercase">{ciudadano.nombres}</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <span className="text-slate-400 font-bold block">Nacimiento</span>
                    <span className="font-bold text-slate-800 font-mono">{ciudadano.fechaNacimiento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">Sexo</span>
                    <span className="font-bold text-slate-800 font-mono">{ciudadano.genero}</span>
                  </div>
                </div>
              </div>

              {/* Security chip rendering */}
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-200 rounded-lg border border-amber-500 shrink-0 shadow-inner flex flex-col justify-between p-0.5 opacity-90">
                <div className="border border-amber-600/30 h-full w-full rounded flex items-center justify-center">
                  <span className="text-[5px] font-bold text-amber-800 font-mono">CHIP</span>
                </div>
              </div>
            </div>

            {/* Bottom fields */}
            <div className="flex justify-between items-end border-t border-sky-200 pt-1 text-[6px]">
              <div>
                <span className="text-slate-400 font-bold block">Fecha Emisión</span>
                <span className="font-bold text-slate-700 font-mono">{emisionDate}</span>
              </div>
              <div>
                <span className="text-slate-400 font-bold block">Fecha Caducidad</span>
                <span className="font-bold text-slate-700 font-mono">{caducidadDate}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 font-bold block">Firma del Titular</span>
                <div className="border-b border-dashed border-slate-400 w-16 h-3 flex items-end justify-center">
                  <span className="text-[6px] italic font-mono text-blue-800 tracking-tighter uppercase font-bold">
                    {ciudadano.nombres.split(' ')[0]} {ciudadano.primerApellido}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* BACK (REVERSO) */}
          <div className="bg-gradient-to-tr from-sky-50 to-sky-100 border border-sky-300 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col justify-between aspect-[1.58/1] text-slate-800" id="dnie-back">
            {/* National Ribbon watermark */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-red-600 via-white to-red-600" />

            <div className="text-[7px] space-y-1.5 flex-1 leading-snug">
              {/* Address details */}
              <div className="bg-white/55 border border-sky-200/50 rounded-lg p-2 space-y-1">
                <div>
                  <span className="text-slate-400 font-bold block uppercase text-[5.5px]">Domicilio Actual / Dirección</span>
                  <span className="font-bold text-slate-800 block uppercase leading-tight">{ciudadano.direccionActual}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[5px]">Dpto</span>
                    <span className="font-bold text-slate-800 block uppercase">{ciudadano.departamento}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[5px]">Prov</span>
                    <span className="font-bold text-slate-800 block uppercase">{ciudadano.provincia}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[5px]">Dist</span>
                    <span className="font-bold text-slate-800 block uppercase">{ciudadano.distrito}</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Organ Donation Status */}
              <div className="flex justify-between items-center bg-white/55 border border-sky-200/50 rounded-lg p-2">
                <div className="flex items-center gap-1.5">
                  <Heart className={`h-4.5 w-4.5 ${ciudadano.donacionOrganos ? 'text-red-600 fill-red-100' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-[5.5px] text-slate-500 font-bold uppercase block">Donación de Órganos</span>
                    <span className="text-[6px] text-slate-400 leading-none">Voluntad de donar tejidos al fallecer</span>
                  </div>
                </div>
                <span className={`text-[11px] font-black font-mono px-3 py-0.5 rounded ${ciudadano.donacionOrganos ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                  {ciudadano.donacionOrganos ? 'SÍ' : 'NO'}
                </span>
              </div>
            </div>

            {/* Bottom PDF/Machine readable text & barcodes */}
            <div className="border-t border-sky-200 pt-1.5 flex justify-between items-end gap-2 text-[5px] font-mono leading-none text-slate-400">
              <div className="flex-1 tracking-wider bg-white/40 p-1 border border-sky-200/20 rounded">
                <p>I&lt;PER{ciudadano.dni}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                <p>8810158M3405245PER&lt;&lt;{ciudadano.primerApellido}&lt;&lt;&lt;&lt;&lt;</p>
                <p>{ciudadano.nombres}&lt;&lt;{ciudadano.segundoApellido}&lt;&lt;&lt;&lt;&lt;&lt;</p>
              </div>
              <div className="flex flex-col items-center gap-0.5 shrink-0 bg-white p-1 rounded border border-slate-200">
                {/* Barcode representation using CSS bars */}
                <div className="flex gap-0.5 items-end h-6 w-12">
                  <div className="w-0.5 bg-slate-800 h-5" />
                  <div className="w-1 bg-slate-800 h-6" />
                  <div className="w-0.5 bg-slate-800 h-4" />
                  <div className="w-0.5 bg-slate-800 h-5" />
                  <div className="w-1 bg-slate-800 h-6" />
                  <div className="w-0.5 bg-slate-800 h-5" />
                  <div className="w-0.5 bg-slate-800 h-3" />
                  <div className="w-1 bg-slate-800 h-5" />
                </div>
                <span className="text-[4px] font-bold text-slate-600 tracking-widest">{ciudadano.dni}</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Recojo / Pick-up Steps and Sede details */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-[#003B7E] text-white p-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          <h3 className="font-bold text-sm uppercase tracking-wider">Detalles de Entrega y Recojo</h3>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Award className="h-4 w-4 text-[#003B7E]" />
              Agencia Elegida para Recojo
            </h4>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <span className="font-bold text-[#003B7E] text-xs block">{sede.nombre}</span>
              <p className="text-xs text-slate-600 font-semibold">{sede.direccion}</p>
              <p className="text-[11px] text-slate-500 font-mono">
                Horario de Atención: <span className="text-slate-700 block mt-0.5">{sede.horarioAtencion}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
              <Calendar className="h-4 w-4 text-[#003B7E]" />
              Cronograma de Recojo Estimado
            </h4>
            
            <div className="space-y-2">
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 font-mono font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">1</span>
                <p className="text-slate-600 font-medium">Su documento físico se imprimirá en un plazo de 5 a 7 días hábiles.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 font-mono font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">2</span>
                <p className="text-slate-600 font-medium">Se enviará un aviso de confirmación de "Listo para Recojo" a <span className="font-bold text-[#003B7E]">{ciudadano.correo}</span>.</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-blue-100 text-blue-800 font-mono font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0">3</span>
                <p className="text-slate-600 font-medium">Acuda a la agencia elegida con su constancia digital o impresa para validar su huella dactilar física.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Servicio de Alertas y Mensajería SMS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden" id="sms-alerts-section">
        <div className="bg-[#003B7E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-sky-300" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Alertas SMS & Mensajería Integrada</h3>
          </div>
          <span className="bg-sky-500 text-[10px] text-white font-extrabold uppercase px-2.5 py-0.5 rounded-full font-sans">
            API Activa
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Phone className="h-4.5 w-4.5 text-[#003B7E]" />
              Suscripción al Recordatorio por Mensaje de Texto (SMS)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Registre su número telefónico peruano para activar el envío de recordatorios automáticos por SMS. Nuestro sistema integrado con el <strong>Gateway de Mensajería de RENIEC</strong> le notificará en tiempo real el estado de su documento.
            </p>
          </div>

          <form onSubmit={handleSendSms} className="bg-slate-50 border border-slate-150 rounded-xl p-4 md:p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
              <div>
                <label htmlFor="sms-phone-input" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  Número de Celular (Perú)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    +51
                  </span>
                  <input
                    type="tel"
                    id="sms-phone-input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').substring(0, 9))}
                    placeholder="9XXXXXXXX"
                    disabled={smsStatus === 'sending'}
                    className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003B7E] transition-all disabled:opacity-60"
                    required
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={smsStatus === 'sending'}
                  className="w-full bg-[#003B7E] hover:bg-blue-900 disabled:bg-slate-300 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all text-xs cursor-pointer disabled:cursor-not-allowed shadow-sm"
                  id="btn-submit-sms"
                >
                  {smsStatus === 'sending' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Conectando con API SMS...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Confirmar y Enviar SMS de Prueba</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {smsError && (
              <p className="text-[11px] text-red-600 font-bold bg-red-50 border border-red-150 rounded-lg p-2.5" id="sms-error-message">
                {smsError}
              </p>
            )}

            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="checkbox-sms-reminder"
                checked={sendSmsReminder}
                onChange={(e) => setSendSmsReminder(e.target.checked)}
                disabled={smsStatus === 'sending'}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#003B7E] focus:ring-[#003B7E]"
              />
              <label htmlFor="checkbox-sms-reminder" className="text-[11px] text-slate-500 font-bold leading-normal select-none cursor-pointer">
                Autorizo a RENIEC a enviar notificaciones sobre el estado del trámite <span className="text-slate-700 font-mono">#{solicitud.idSolicitud}</span> a este número telefónico.
              </label>
            </div>
          </form>

          {/* Simulated SMS Screen Preview on Success */}
          {smsStatus === 'sent' && (
            <div className="space-y-3 animate-fadeIn" id="sms-simulation-preview">
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-extrabold uppercase tracking-wider font-sans bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
                <span>API de Mensajería: STATUS 200 OK — SMS Enviado Correctamente</span>
              </div>

              {/* Realistic Mobile SMS UI Mock */}
              <div className="max-w-md mx-auto bg-slate-900 text-slate-100 rounded-3xl p-4 shadow-xl border border-slate-800 font-sans relative overflow-hidden">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                </div>
                
                {/* Mobile top bar */}
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono px-2 pt-2 pb-4">
                  <span>RENIEC_NET</span>
                  <div className="flex gap-1">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* SMS Thread Header */}
                <div className="text-center pb-2 border-b border-slate-800 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 block">RENIEC Alertas</span>
                  <span className="text-[8px] text-slate-500 font-mono">Hoy, {new Date().toLocaleTimeString('es-PE', {hour: '2-digit', minute:'2-digit'})}</span>
                </div>

                {/* SMS Message Bubble */}
                <div className="space-y-1 max-w-[85%]">
                  <div className="bg-slate-800 text-slate-200 rounded-2xl rounded-tl-sm p-3 text-[11px] leading-relaxed shadow-md border border-slate-700">
                    <p className="font-semibold text-[#38bdf8] mb-0.5">RENIEC NOTIFICACIONES</p>
                    <p className="font-medium text-slate-100">
                      Estimado(a) {ciudadano.nombres.split(' ')[0]}, su solicitud de renovación <strong className="font-mono text-amber-400">{solicitud.idSolicitud}</strong> ha sido registrada con éxito. Le enviaremos un SMS cuando esté listo para su entrega en la sede {sede.nombre}.
                    </p>
                  </div>
                  <span className="text-[8px] text-slate-500 font-mono pl-1">Entregado</span>
                </div>

                {/* Phone bottom visual bar */}
                <div className="mt-6 pt-1 flex justify-center">
                  <div className="w-20 h-1 bg-slate-700 rounded-full" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Credenciales Digitales Temporales & QR Code Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden" id="digital-credentials-section">
        <div className="bg-[#003B7E] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            <h3 className="font-bold text-sm uppercase tracking-wider">Credenciales Digitales Temporales (DNIe Móvil)</h3>
          </div>
          <span className="bg-emerald-500 text-[10px] text-white font-extrabold uppercase px-2.5 py-0.5 rounded-full animate-pulse font-sans">
            Disponible ya
          </span>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* QR Code Column */}
          <div className="md:col-span-5 flex flex-col items-center justify-center text-center space-y-3 bg-slate-50 border border-slate-100 rounded-xl p-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Escanear para descargar en Móvil</span>
            
            <div className="relative bg-white p-4 rounded-xl shadow-md border border-slate-200 group overflow-hidden">
              {/* Scan effect lines */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#003B7E]" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#003B7E]" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#003B7E]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#003B7E]" />
              
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt="QR Credenciales Digitales" 
                  className="w-48 h-48 select-none"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-bold text-xs">
                  Generando QR...
                </div>
              )}
              
              {/* Pulsing overlay scanning line */}
              <div className="absolute left-0 right-0 h-0.5 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)] top-0 animate-[bounce_3s_infinite]" />
            </div>

            <button
              type="button"
              onClick={handleDownloadQR}
              disabled={!qrCodeUrl}
              className="w-full bg-[#003B7E] hover:bg-blue-900 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs disabled:opacity-50 font-sans"
              id="btn-download-qr"
            >
              <Download className="h-4 w-4" />
              <span>Descargar Imagen QR</span>
            </button>
          </div>

          {/* Instructions and Details Column */}
          <div className="md:col-span-7 space-y-4">
            <div className="space-y-1.5">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4.5 w-4.5 text-emerald-600" />
                DNIe Provisional en su Dispositivo Móvil
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                RENIEC ha habilitado la descarga inmediata de sus credenciales digitales provisionales. Al escanear este código QR seguro con su smartphone, podrá importar su DNIe temporal a la aplicación oficial <strong className="text-[#003B7E]">RENIEC Móvil ID</strong>.
              </p>
            </div>

            <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 space-y-2.5">
              <span className="text-[10px] font-extrabold text-[#003B7E] uppercase tracking-wider block border-b border-sky-200/60 pb-1">
                Datos Encriptados de la Credencial
              </span>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <div>
                  <span className="text-slate-500 font-semibold block">Titular:</span>
                  <span className="font-bold text-slate-800 truncate block uppercase">
                    {ciudadano.nombres.split(' ')[0]} {ciudadano.primerApellido}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">DNI Asociado:</span>
                  <span className="font-bold text-slate-800 font-mono">{ciudadano.dni}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Estado Credencial:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    ACTIVO (PROVISIONAL)
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Vence el:</span>
                  <span className="font-bold text-slate-700 font-mono">{caducidadDate}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 items-start text-[11px] text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <QrCode className="h-4 w-4 text-[#003B7E] shrink-0 mt-0.5" />
              <p className="leading-normal font-semibold">
                Esta credencial digital está firmada criptográficamente con una <strong>Firma Electrónica Segura</strong> de su sesión y cuenta con plena validez legal para identificarse ante las autoridades competentes hasta el recojo de su documento físico.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detalle Técnico Biométrico Toggle */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <button
          type="button"
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-left"
          id="btn-toggle-technical-details"
        >
          <div className="flex items-center gap-2.5">
            <Cpu className="h-5 w-5 text-[#003B7E]" />
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">Verificación de Metadatos Biométricos (ICAO / Liveness)</h3>
              <p className="text-[10px] text-slate-500 font-semibold uppercase font-sans mt-0.5">Transparencia técnica y conformidad del cotejo facial</p>
            </div>
          </div>
          <div className="bg-slate-200 hover:bg-slate-300 transition-all p-1.5 rounded-lg shrink-0 ml-2">
            {showTechnicalDetails ? (
              <ChevronUp className="h-4 w-4 text-slate-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-600" />
            )}
          </div>
        </button>

        {showTechnicalDetails && (
          <div className="p-6 bg-white border-t border-slate-100 space-y-6" id="technical-details-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Liveness confidence card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-100 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider font-mono">Detección de Liveness</span>
                    <span className="bg-emerald-500 text-[9px] text-white font-extrabold uppercase px-2 py-0.5 rounded-full font-sans">Sujeto Humano</span>
                  </div>
                  <h4 className="text-3xl font-black text-emerald-900 font-mono">
                    {((solicitud?.biometricMetadata?.livenessConfidence ?? 0.998) * 100).toFixed(1)}%
                  </h4>
                  <p className="text-xs text-emerald-700 font-semibold mt-2.5 leading-relaxed font-sans">
                    Índice de confianza de prueba de vida (Antispoofing). Confirma que la captura se realizó de un sujeto vivo y no de una fotografía, pantalla o máscara tridimensional.
                  </p>
                </div>
                <div className="border-t border-emerald-200/50 pt-3 mt-4 flex items-center justify-between text-[10px] text-emerald-600 font-mono">
                  <span>Algoritmo: Liveness-Net v3.4</span>
                  <span>Mínimo requerido: 95.0%</span>
                </div>
              </div>

              {/* ICAO Standard Checklist with progress bars */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-5 space-y-4">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block font-mono border-b border-slate-200 pb-2">
                  Métricas OACI (ICAO DOC 9303)
                </span>
                
                <div className="space-y-3.5 font-mono text-[11px]">
                  {/* Expresión Neutra */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-bold mb-1">
                      <span>Expresión Facial Neutra</span>
                      <span className="text-emerald-600">{((solicitud?.biometricMetadata?.icaoNeutralExpressionScore ?? 0.992) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(solicitud?.biometricMetadata?.icaoNeutralExpressionScore ?? 0.992) * 100}%` }} />
                    </div>
                  </div>

                  {/* Uniformidad de Fondo */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-bold mb-1">
                      <span>Fondo Uniforme (Blanco)</span>
                      <span className="text-emerald-600">{((solicitud?.biometricMetadata?.icaoBackgroundUniformityScore ?? 0.954) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(solicitud?.biometricMetadata?.icaoBackgroundUniformityScore ?? 0.954) * 100}%` }} />
                    </div>
                  </div>

                  {/* Resolución de Rostro */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-bold mb-1">
                      <span>Resolución de Rostro</span>
                      <span className="text-emerald-600">{((solicitud?.biometricMetadata?.icaoFaceResolutionScore ?? 0.978) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(solicitud?.biometricMetadata?.icaoFaceResolutionScore ?? 0.978) * 100}%` }} />
                    </div>
                  </div>

                  {/* Iluminación */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-bold mb-1">
                      <span>Iluminación e ISO 19794-5</span>
                      <span className="text-emerald-600">{((solicitud?.biometricMetadata?.icaoIlluminationScore ?? 0.965) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(solicitud?.biometricMetadata?.icaoIlluminationScore ?? 0.965) * 100}%` }} />
                    </div>
                  </div>

                  {/* Simetría Facial */}
                  <div>
                    <div className="flex justify-between text-slate-700 font-bold mb-1">
                      <span>Simetría Facial</span>
                      <span className="text-emerald-600">{((solicitud?.biometricMetadata?.icaoFacialSymmetryScore ?? 0.984) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(solicitud?.biometricMetadata?.icaoFacialSymmetryScore ?? 0.984) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Audit Logs block */}
            <div className="bg-slate-900 text-slate-300 rounded-xl p-4 font-mono text-[10px] border border-slate-800 space-y-1.5">
              <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1 uppercase tracking-wider flex items-center justify-between font-sans">
                <span>RENIEC_BIOMETRIC_AUDIT_LOG_2026</span>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">VERIFICADO</span>
              </div>
              <p className="text-slate-500">[2026-07-02T16:22:19Z] INITIALIZING ISO-19794-5 ENGINE...</p>
              <p className="text-slate-500">[2026-07-02T16:22:20Z] EXTRACTING FACIAL LANDMARKS (68 POINTS)...</p>
              <p className="text-slate-400">[2026-07-02T16:22:21Z] LIVENESS DETECTED: TRUE | CONFIDENCE: {(solicitud?.biometricMetadata?.livenessConfidence ?? 0.998).toFixed(4)}</p>
              <p className="text-slate-400">[2026-07-02T16:22:21Z] INTER-PUPILLARY DISTANCE (IPD): 120 PX (OK)</p>
              <p className="text-slate-400">[2026-07-02T16:22:22Z] ICAO DOC 9303 STANDARD EVALUATION: PASS | COMPLIANCE: {((solicitud?.biometricMetadata?.icaoOverallCompliance ?? 1.000) * 100).toFixed(1)}%</p>
              <p className="text-emerald-400">[2026-07-02T16:22:22Z] DIGITAL SIGNATURE GENERATION SUCCESSFUL - STATUS_PROVISIONAL_ACTIVO</p>
            </div>
          </div>
        )}
      </div>

      {/* Printable Constancia & Export panel */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-xl space-y-4 font-mono text-xs">
        <h3 className="text-sm font-bold text-emerald-400 border-b border-slate-800 pb-2 uppercase tracking-wider flex items-center gap-1.5">
          <Printer className="h-4.5 w-4.5" />
          Ficha Registral & Validación de Trámite Digital
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 leading-relaxed">
          <div className="space-y-2">
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Firma Electrónica Autorizada:</span>
              <p className="bg-slate-950 border border-slate-800 rounded p-2 text-emerald-400 break-all select-all font-semibold font-mono text-[10px]">
                {tokenJWT}
              </p>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Tasa Pago Validada:</span>
              <p className="text-white font-bold text-[11px]">
                {pago.idPago} — S/. {pago.monto.toFixed(2)} ({pago.metodoPago})
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Código Transacción:</span>
              <p className="text-white font-bold text-[11px]">
                {pago.codigoTransaccion}
              </p>
            </div>
            <div>
              <span className="text-slate-500 block uppercase text-[10px]">Cotejo Biométrico OACI:</span>
              <p className="text-emerald-400 font-bold text-[11px] uppercase">
                Aprobado (Liveness 99.8% Confianza)
              </p>
            </div>
          </div>
        </div>

        {/* Constancia Download Action Button */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md font-sans"
            id="btn-download-constancia"
          >
            <Download className="h-4.5 w-4.5" />
            <span>Descargar Constancia Oficial (.TXT)</span>
          </button>
          
          <button
            type="button"
            onClick={onRestart}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-bold py-3 px-6 rounded-xl cursor-pointer transition-all font-sans"
            id="btn-restart-flow"
          >
            Realizar otro trámite
          </button>
        </div>
      </div>

    </div>
  );
};
