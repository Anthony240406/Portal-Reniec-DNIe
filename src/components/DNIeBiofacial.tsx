/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, RefreshCw, Sparkles, UserCheck, ShieldAlert, Eye, Settings, Video } from 'lucide-react';

interface DNIeBiofacialProps {
  onSuccess: (photoUrl: string) => void;
  onPrev: () => void;
}

export const DNIeBiofacial: React.FC<DNIeBiofacialProps> = ({ onSuccess, onPrev }) => {
  const [useRealWebcam, setUseRealWebcam] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Stop media streams on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Handle webcam activation
  const activateWebcam = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      });
      setStream(mediaStream);
      setUseRealWebcam(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError("No se pudo acceder a la cámara. Por favor use la Simulación IA.");
      setUseRealWebcam(false);
    }
  };

  const deactivateWebcam = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUseRealWebcam(false);
  };

  const handleCapture = () => {
    setIsAnalyzing(true);
    setAnalysisStep(1);
    setIsApproved(false);

    // Step-by-step 3 second analysis (Liveness & ICAO check)
    // Second 1: Liveness detection
    setTimeout(() => {
      setAnalysisStep(2);
    }, 1000);

    // Second 2: OACI (ICAO) standardization
    setTimeout(() => {
      setAnalysisStep(3);
    }, 2000);

    // Second 3: Final Approval
    setTimeout(() => {
      setIsAnalyzing(false);
      setIsApproved(true);
      setAnalysisStep(4);
      
      // If we are using real webcam, capture a frame
      if (useRealWebcam && videoRef.current) {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 320;
          canvas.height = 240;
          const ctx = canvas.getContext('2d');
          if (ctx && videoRef.current) {
            ctx.drawImage(videoRef.current, 0, 0, 320, 240);
            setCapturedPhoto(canvas.toDataURL('image/jpeg'));
          }
        } catch (e) {
          // fallback to avatar
          setCapturedPhoto(null);
        }
      } else {
        setCapturedPhoto(null);
      }
    }, 3000);
  };

  const handleConfirmPhoto = () => {
    const photo = capturedPhoto || "SIMULATED_PHOTO_OK";
    onSuccess(photo);
  };

  const resetCapture = () => {
    setIsApproved(false);
    setAnalysisStep(0);
    setCapturedPhoto(null);
  };

  return (
    <div className="max-w-xl w-full mx-auto" id="biofacial-container">
      {/* Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Paso 2: Captura Biofacial y Motor IA
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Validación biométrica en tiempo real alineada con estándares internacionales OACI/ICAO.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Cam Switcher Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={deactivateWebcam}
            className={`flex-1 py-3 px-4 text-xs font-bold text-center border-r border-slate-200 cursor-pointer transition-colors ${
              !useRealWebcam ? 'bg-slate-50 text-[#003B7E] border-b-2 border-b-[#003B7E]' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-sim-cam"
          >
            Simulación IA Integrada (Recomendado)
          </button>
          <button
            type="button"
            onClick={activateWebcam}
            className={`flex-1 py-3 px-4 text-xs font-bold text-center cursor-pointer transition-colors ${
              useRealWebcam ? 'bg-slate-50 text-[#003B7E] border-b-2 border-b-[#003B7E]' : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-real-cam"
          >
            Usar Cámara Web Real
          </button>
        </div>

        {/* Camera View Box */}
        <div className="p-6 flex flex-col items-center">
          
          <div className="relative w-80 h-96 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex flex-col items-center justify-center shadow-2xl">
            
            {/* Real Webcam Stream */}
            {useRealWebcam && !isApproved && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {/* Sim Cam Stream Backdrop (Stylized vector) */}
            {!useRealWebcam && !isApproved && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-8">
                {/* Simulated Grid / Nodes */}
                <div className="absolute inset-0 bg-reniec-pattern opacity-10" />
                
                {/* Simulated Citizen Vector Outline */}
                <svg className="h-44 w-44 text-slate-700 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>

                <div className="text-center mt-4 z-10">
                  <span className="text-[10px] font-mono tracking-widest text-[#003B7E] bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                    CÁMARA VIRTUAL DE PRUEBA
                  </span>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono">
                    Resolución: 1080p FHD
                  </p>
                </div>
              </div>
            )}

            {/* Approved Captured Photo Screen */}
            {isApproved && (
              <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="absolute inset-0 bg-emerald-50/20" />
                
                {capturedPhoto ? (
                  <img src={capturedPhoto} alt="Captured" className="w-44 h-56 object-cover rounded-xl border border-slate-300 shadow-lg mb-3 z-10" />
                ) : (
                  <div className="w-36 h-48 bg-slate-200 rounded-xl border border-slate-300 shadow-md mb-3 flex flex-col items-center justify-center text-slate-400 z-10 relative">
                    <svg className="h-28 w-28 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-[9px] font-mono text-slate-500 absolute bottom-2">FOTO SIMULADA ICAO</span>
                  </div>
                )}
                
                <div className="z-10 mt-1">
                  <div className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-300 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold shadow-sm mb-1.5 animate-bounce">
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>Liveness y OACI aprobados</span>
                  </div>
                  <p className="text-[10px] text-slate-500 max-w-[240px] leading-snug">
                    Su imagen ha sido validada contra el Padrón de RENIEC y cumple con las especificaciones técnicas requeridas.
                  </p>
                </div>
              </div>
            )}

            {/* Overlays / Scanline during capture simulation */}
            {!isApproved && (
              <>
                {/* Facial Oval Frame Overlay */}
                <div className="absolute inset-x-8 top-16 bottom-20 border-2 border-dashed border-blue-500 rounded-[50%/40%] pointer-events-none flex items-center justify-center opacity-80">
                  <div className="w-[90%] h-[90%] border border-blue-400/30 rounded-[50%/40%] animate-pulse" />
                </div>

                {/* Corner Tech Brackets */}
                <div className="absolute top-4 left-4 h-4 w-4 border-t-2 border-l-2 border-slate-500" />
                <div className="absolute top-4 right-4 h-4 w-4 border-t-2 border-r-2 border-slate-500" />
                <div className="absolute bottom-4 left-4 h-4 w-4 border-b-2 border-l-2 border-slate-500" />
                <div className="absolute bottom-4 right-4 h-4 w-4 border-b-2 border-r-2 border-slate-500" />

                {/* Top Telemetry */}
                <div className="absolute top-4 left-10 right-10 flex justify-between text-[9px] font-mono text-slate-400 tracking-wider">
                  <span>ISO / IEC 19794-5</span>
                  <span className="text-red-500 animate-pulse">● REC LIVE</span>
                </div>

                {/* Scanline Effect when Analyzing */}
                {isAnalyzing && <div className="animate-scanline" />}
              </>
            )}

            {/* Bottom State HUD (Heads-up display) */}
            {!isApproved && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 text-center font-mono z-10 text-white">
                {isAnalyzing ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-blue-400">
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      <span>PROCESANDO MOTOR DE IA...</span>
                    </div>
                    <p className="text-[9px] text-slate-300 leading-snug">
                      {analysisStep === 1 && "Verificando Liveness (Prueba de vida)..."}
                      {analysisStep === 2 && "Evaluando simetría e iluminación OACI..."}
                      {analysisStep === 3 && "Ejecutando firma biométrica de rostro..."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-300 block">ENFOQUE BIOMÉTRICO</span>
                    <p className="text-[9px] text-amber-400 font-bold leading-none">
                      Asegúrese de mirar de frente y no tener lentes ni gorros.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {cameraError && (
            <p className="mt-3 text-xs text-red-500 font-medium flex items-center gap-1">
              <ShieldAlert className="h-4 w-4" />
              {cameraError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-6 w-full flex justify-center gap-3">
            {!isApproved && !isAnalyzing && (
              <button
                type="button"
                onClick={handleCapture}
                className="bg-[#003B7E] hover:bg-blue-800 text-white py-3 px-8 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                id="btn-capture-photo"
              >
                <Camera className="h-5 w-5" />
                <span>Capturar Foto e Iniciar IA</span>
              </button>
            )}

            {isAnalyzing && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-6 py-3 rounded-xl text-blue-800 text-xs font-bold">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span>Analizando criterios de validación OACI...</span>
              </div>
            )}

            {isApproved && (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={resetCapture}
                  className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  id="btn-retake-photo"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Volver a Capturar</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPhoto}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-8 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all cursor-pointer"
                  id="btn-confirm-photo"
                >
                  <UserCheck className="h-4.5 w-4.5" />
                  <span>Aceptar y Continuar</span>
                </button>
              </div>
            )}
          </div>

          {/* Biometric Scores / Telemetry */}
          {isApproved && (
            <div className="w-full mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs font-mono text-slate-700">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block mb-1">
                REPORTE DE CONFORMIDAD BIOMÉTRICA
              </span>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="flex justify-between border-b border-slate-150 pb-1">
                  <span className="text-slate-500">Detección Liveness:</span>
                  <span className="text-emerald-600 font-bold">HUMANO (99.8%)</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 pb-1">
                  <span className="text-slate-500">Expresión Neutra:</span>
                  <span className="text-emerald-600 font-bold">99.2% CUMPLE</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 pb-1">
                  <span className="text-slate-500">Fondo Uniforme (Blanco):</span>
                  <span className="text-emerald-600 font-bold">APROBADO</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 pb-1">
                  <span className="text-slate-500">Iluminación de Rostro:</span>
                  <span className="text-emerald-600 font-bold">APROBADO</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 pb-1">
                  <span className="text-slate-500">Simetría Facial:</span>
                  <span className="text-emerald-600 font-bold">98.4% CUMPLE</span>
                </div>
                <div className="flex justify-between border-b border-slate-150 pb-1">
                  <span className="text-slate-500">Cumplimiento OACI:</span>
                  <span className="text-emerald-600 font-bold">100% CUMPLE</span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            id="btn-biofacial-back"
          >
            Atrás: Pasarela de Pagos
          </button>
        </div>

      </div>
    </div>
  );
};
