/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Fingerprint, 
  CreditCard, 
  Camera, 
  UserCheck, 
  FileText, 
  ShieldCheck, 
  Lock, 
  HelpCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  XCircle,
  Activity,
  AlertCircle,
  Bell,
  Trash2
} from 'lucide-react';

import { Ciudadano, Pago, SolicitudRenovacion, HistorialSesion, NotificationAlert } from './types';
import { SEDES_RENIEC } from './data';
import { ToastContainer, ToastMessage } from './components/Toast';
import { StatusBanner } from './components/StatusBanner';
import { DNIeLogin } from './components/DNIeLogin';
import { DNIePayment } from './components/DNIePayment';
import { DNIeBiofacial } from './components/DNIeBiofacial';
import { DNIeForm } from './components/DNIeForm';
import { DNIePreview } from './components/DNIePreview';

export default function App() {
  // Screen State Router
  // 'LOGIN' | 'BIO_INSTRUCTIONS' | 'BIO_CAPTURE' | 'BIO_PROCESSING' | 'BIO_LOCKED' | 'DASHBOARD' | 'PAYMENT' | 'FORM' | 'PREVIEW' | 'STATUS_TRACK'
  const [currentScreen, setCurrentScreen] = useState<string>('LOGIN');
  const [dni, setDni] = useState<string>('');
  const [ciudadano, setCiudadano] = useState<Ciudadano | null>(null);
  const [pago, setPago] = useState<Pago | null>(null);
  const [solicitud, setSolicitud] = useState<SolicitudRenovacion | null>(null);
  const [tokenJWT, setTokenJWT] = useState<string>('');
  
  // Custom Toast System State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Restoration States
  const [hasRestored, setHasRestored] = useState<boolean>(false);
  const [restorableSession, setRestorableSession] = useState<HistorialSesion | null>(null);

  // Biometric validation simulation details
  const [biometricAttempts, setBiometricAttempts] = useState<number>(0);
  const [simulateSuccess, setSimulateSuccess] = useState<boolean>(true); // user chosen path
  const [evaluatingStep, setEvaluatingStep] = useState<number>(0); // processing steps
  const [isProcessingBiometrics, setIsProcessingBiometrics] = useState<boolean>(false);
  
  // Business logic rules state
  const [show60DaysError, setShow60DaysError] = useState<boolean>(false);
  const [lockedTimeLeft, setLockedTimeLeft] = useState<number>(86400); // 24 hours countdown for locked view

  // Notifications State & Dropdown
  const [notifications, setNotifications] = useState<NotificationAlert[]>(() => {
    const saved = localStorage.getItem('reniec_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing notifications", e);
      }
    }
    return [
      {
        id: 'notif-1',
        title: 'Actualización de Trámite',
        description: 'Tu trámite anterior de renovación N° SOL-58212 pasó a: EN PRODUCCIÓN.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        isRead: false,
        type: 'success'
      },
      {
        id: 'notif-2',
        title: 'Cotejo Facial OACI Activo',
        description: 'El motor de validación biométrica con Inteligencia Artificial está en línea y operando con normalidad.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        isRead: true,
        type: 'info'
      },
      {
        id: 'notif-3',
        title: 'Portal de Renovación v4.0',
        description: 'Bienvenido al nuevo sistema unificado del Estado Peruano para renovación no presencial.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        isRead: true,
        type: 'info'
      }
    ];
  });
  const [notifDropdownOpen, setNotifDropdownOpen] = useState<boolean>(false);

  // Sync notifications to localStorage
  useEffect(() => {
    localStorage.setItem('reniec_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (title: string, description: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const newNotif: NotificationAlert = {
      id: 'notif-' + Math.random().toString(36).substring(2, 9),
      title,
      description,
      timestamp: new Date().toISOString(),
      isRead: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    triggerToast('success', 'Notificaciones leídas', 'Se marcaron todas las notificaciones como leídas.');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    triggerToast('info', 'Notificaciones limpiadas', 'Se eliminaron todas las notificaciones.');
  };


  // Add toast helper
  const triggerToast = (type: 'success' | 'warning' | 'info', title: string, description: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
    
    // Auto remove after 6 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Generate simulated JWT Token
  const generateMockJWT = (citizenDni: string): string => {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const payload = btoa(JSON.stringify({
      iss: "reniec-ia-motor",
      sub: citizenDni,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
      liveness: true,
      roles: ["citizen_renewal"]
    }));
    const signature = "reniec_signature_hash_2026_xyz123";
    return `${header}.${payload}.${signature}`;
  };

  // 24 hours countdown effect
  useEffect(() => {
    let interval: any;
    if (currentScreen === 'BIO_LOCKED') {
      interval = setInterval(() => {
        setLockedTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentScreen]);

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Unified authentication handler (Fase 1 - Step 1: Login)
  const handleLogin = (enteredDni: string, loadedCiudadano: Ciudadano) => {
    setDni(enteredDni);
    setCiudadano(loadedCiudadano);
    
    addNotification(
      'Sesión Iniciada',
      `Autenticación correcta para ${loadedCiudadano.nombres} ${loadedCiudadano.primerApellido}. DNI: ${enteredDni}`,
      'info'
    );

    
    // Check if DNI is globally locked
    const isLocked = localStorage.getItem(`reniec_dni_locked_${enteredDni}`);
    if (isLocked) {
      setBiometricAttempts(3);
      setCurrentScreen('BIO_LOCKED');
      return;
    }

    // Check for saved sessions
    const savedSessionString = localStorage.getItem(`reniec_dnie_session_${enteredDni}`);
    if (savedSessionString) {
      try {
        const parsedSession: HistorialSesion = JSON.parse(savedSessionString);
        setRestorableSession(parsedSession);
        triggerToast(
          'info',
          'Trámite Guardado Detectado',
          `Se detectó un trámite guardado el ${new Date(parsedSession.fechaHora).toLocaleDateString()}. Puede restaurarlo en el menú principal.`
        );
      } catch (e) {
        console.error("Error parsing saved session", e);
      }
    }

    // Initialize observed state if citizen is Sara Elizabeth
    if (loadedCiudadano.estadoTramiteInicial === 'PENDIENTE_DE_SUBSANACION') {
      const generatedToken = generateMockJWT(enteredDni);
      setTokenJWT(generatedToken);
      const obsSolicitud: SolicitudRenovacion = {
        idSolicitud: 'SOL-OBS-' + Math.floor(100000 + Math.random() * 900000),
        dniCiudadano: enteredDni,
        estado: 'INICIADO', // starts as initiated but initially observed
        fechaInicio: new Date().toISOString(),
        codigoSedeRecojo: 'SED-001',
        tokenJWT: generatedToken,
        livenessAprobado: false,
        oaciAprobado: false,
        ultimoPasoCompletado: 0
      };
      setSolicitud(obsSolicitud);
    }

    // Move to instructions screen immediately (Fase 1 - Step 2)
    setCurrentScreen('BIO_INSTRUCTIONS');
  };

  // Save progress securely
  const saveSessionState = (
    currentDni: string,
    currentCiudadano: Ciudadano,
    currentPago: Pago | null,
    currentSolicitud: SolicitudRenovacion | null,
    jwt: string,
    step: number,
    screenName: string
  ) => {
    const sessionData: HistorialSesion = {
      dni: currentDni,
      fechaHora: new Date().toISOString(),
      tokenJWT: jwt,
      pasoRestaurado: step,
      datosGuardados: {
        ciudadano: currentCiudadano,
        pago: currentPago || undefined,
        solicitud: currentSolicitud || undefined,
      }
    };
    localStorage.setItem(`reniec_dnie_session_${currentDni}`, JSON.stringify(sessionData));
    localStorage.setItem(`reniec_dnie_screen_${currentDni}`, screenName);
  };

  const handleRestoreSession = () => {
    if (restorableSession) {
      const data = restorableSession.datosGuardados;
      setCiudadano(data.ciudadano);
      if (data.pago) setPago(data.pago);
      if (data.solicitud) setSolicitud(data.solicitud);
      setTokenJWT(restorableSession.tokenJWT);
      
      const savedScreen = localStorage.getItem(`reniec_dnie_screen_${dni}`) || 'DASHBOARD';
      setCurrentScreen(savedScreen);
      setHasRestored(true);
      setRestorableSession(null);

      triggerToast(
        'success',
        'Sesión Restaurada Correctamente',
        'Su trámite anterior ha sido cargado con éxito desde la nube de RENIEC.'
      );
    }
  };

  const handleDeclineRestore = () => {
    if (dni) {
      localStorage.removeItem(`reniec_dnie_session_${dni}`);
      localStorage.removeItem(`reniec_dnie_screen_${dni}`);
      setPago(null);
      setHasRestored(false);
      setRestorableSession(null);
      
      if (ciudadano?.estadoTramiteInicial === 'PENDIENTE_DE_SUBSANACION') {
        const generatedToken = generateMockJWT(dni);
        const obsSolicitud: SolicitudRenovacion = {
          idSolicitud: 'SOL-OBS-' + Math.floor(100000 + Math.random() * 900000),
          dniCiudadano: dni,
          estado: 'INICIADO',
          fechaInicio: new Date().toISOString(),
          codigoSedeRecojo: 'SED-001',
          tokenJWT: generatedToken,
          livenessAprobado: false,
          oaciAprobado: false,
          ultimoPasoCompletado: 0
        };
        setSolicitud(obsSolicitud);
      } else {
        setSolicitud(null);
      }

      triggerToast(
        'warning',
        'Sesión Descartada',
        'Se iniciará un proceso desde cero.'
      );
    }
  };

  // Biometrics simulation action
  const handleStartBiometricVerification = () => {
    setIsProcessingBiometrics(true);
    setCurrentScreen('BIO_PROCESSING');
    setEvaluatingStep(1);

    // Timeline steps evaluation
    setTimeout(() => {
      setEvaluatingStep(2);
    }, 1000);

    setTimeout(() => {
      setEvaluatingStep(3);
    }, 2000);

    setTimeout(() => {
      setIsProcessingBiometrics(false);
      if (simulateSuccess) {
        // Successful match >= 95 and liveness true
        const generatedToken = generateMockJWT(dni);
        setTokenJWT(generatedToken);
        
        const nuevaSolicitud: SolicitudRenovacion = solicitud || {
          idSolicitud: 'SOL-' + Math.floor(100000 + Math.random() * 900000),
          dniCiudadano: dni,
          estado: 'INICIADO',
          fechaInicio: new Date().toISOString(),
          codigoSedeRecojo: '',
          tokenJWT: generatedToken,
          livenessAprobado: true,
          oaciAprobado: true,
          ultimoPasoCompletado: 0,
          biometricMetadata: {
            livenessConfidence: 0.998,
            icaoNeutralExpressionScore: 0.992,
            icaoBackgroundUniformityScore: 0.975,
            icaoFaceResolutionScore: 0.981,
            icaoIlluminationScore: 0.966,
            icaoFacialSymmetryScore: 0.989,
            icaoOverallCompliance: 1.000
          }
        };
        
        // Ensure biometric approval is registered
        nuevaSolicitud.livenessAprobado = true;
        nuevaSolicitud.oaciAprobado = true;
        
        setSolicitud(nuevaSolicitud);
        
        addNotification(
          'Biometría Aprobada',
          'Prueba de vida facial y OACI exitosa. Score de coincidencia: 98.7% (Score >= 95% y Liveness OK)',
          'success'
        );

        triggerToast(
          'success',
          'Biometría Aprobada',
          'Score de coincidencia: 98.7% (Score >= 95% y Liveness OK)'
        );
        
        // Go to main Menu Dashboard (Fase 2)
        setCurrentScreen('DASHBOARD');
      } else {
        // Failed attempt
        const nextAttempts = biometricAttempts + 1;
        setBiometricAttempts(nextAttempts);
        
        if (nextAttempts >= 3) {
          localStorage.setItem(`reniec_dni_locked_${dni}`, 'true');
          
          addNotification(
            'Acceso Bloqueado',
            'Se ha bloqueado su cuenta temporalmente por superar los 3 intentos biométricos.',
            'error'
          );

          setCurrentScreen('BIO_LOCKED');
          triggerToast(
            'warning',
            'Acceso Bloqueado temporalmente',
            'Se ha superado el número de intentos biométricos (3).'
          );
        } else {
          
          addNotification(
            'Biometría no coincide',
            `Intento fallido ${nextAttempts} de 3. El rostro no coincide con los patrones biométricos del DNI.`,
            'warning'
          );

          setCurrentScreen('BIO_CAPTURE');
          triggerToast(
            'warning',
            'Biometría no coincide',
            `La validación falló (Intento ${nextAttempts}/3). Asegúrese de enfocar bien.`
          );
        }
      }
    }, 3200);
  };

  // Payment register action
  const handlePaymentSuccess = (nuevoPago: Pago) => {
    setPago(nuevoPago);
    const updatedSolicitud: SolicitudRenovacion = {
      ...solicitud!,
      estado: 'PAGADO',
      ultimoPasoCompletado: 1
    };
    setSolicitud(updatedSolicitud);

    addNotification(
      'Pago de Tasa Verificado',
      `Tasa por renovación (Concepto 02121) de S/. 41.00 validada con éxito. Código de Operación: ${nuevoPago.codigoTransaccion}.`,
      'success'
    );

    saveSessionState(dni, ciudadano!, nuevoPago, updatedSolicitud, tokenJWT, 1, 'FORM');
    
    triggerToast('success', 'Pago Aprobado', `Concepto: 02121 - S/. 41.00`);
    setCurrentScreen('FORM'); // Go to Data actualization (Fase 3, Pantalla 6)
  };

  // Form final registration
  const handleFormSuccess = (updatedCiudadano: Ciudadano, selectedSedeCode: string) => {
    setCiudadano(updatedCiudadano);
    
    const updatedSolicitud: SolicitudRenovacion = {
      ...solicitud!,
      estado: 'COMPLETADO',
      codigoSedeRecojo: selectedSedeCode,
      ultimoPasoCompletado: 3
    };
    setSolicitud(updatedSolicitud);

    addNotification(
      'Trámite Registrado',
      `Ficha Registral de Renovación N° SOL-${updatedSolicitud.idSolicitud} guardada de forma segura. Datos actualizados correctamente.`,
      'success'
    );

    // Simulate state transitions in real-time for evaluation
    setTimeout(() => {
      addNotification(
        'Actualización de Trámite',
        `Tu trámite N° SOL-${updatedSolicitud.idSolicitud} pasó a: EN EVALUACIÓN REGISTRAL.`,
        'info'
      );
    }, 4000);

    setTimeout(() => {
      addNotification(
        'Actualización de Trámite',
        `Tu trámite N° SOL-${updatedSolicitud.idSolicitud} pasó a: EN PRODUCCIÓN.`,
        'success'
      );
    }, 9000);

    saveSessionState(dni, updatedCiudadano, pago, updatedSolicitud, tokenJWT, 3, 'PREVIEW');

    triggerToast(
      'success',
      'Datos y Sede Registrados',
      'Su renovación de DNIe ha sido firmada electrónicamente por el motor biométrico de RENIEC.'
    );
    setCurrentScreen('PREVIEW'); // Go to Success receipt screen (Fase 3, Pantalla 8)
  };

  // Fully restart
  const handleResetAll = () => {
    if (dni) {
      localStorage.removeItem(`reniec_dnie_session_${dni}`);
      localStorage.removeItem(`reniec_dnie_screen_${dni}`);
    }
    setCurrentScreen('LOGIN');
    setDni('');
    setCiudadano(null);
    setPago(null);
    setSolicitud(null);
    setTokenJWT('');
    setHasRestored(false);
    setRestorableSession(null);
    setBiometricAttempts(0);
    setShow60DaysError(false);
    
    triggerToast(
      'info',
      'Formulario Reiniciado',
      'Se ha limpiado la sesión de forma segura.'
    );
  };

  const handleSimulatedUnlock = () => {
    localStorage.removeItem(`reniec_dni_locked_${dni}`);
    setBiometricAttempts(0);
    setLockedTimeLeft(86400);
    setCurrentScreen('LOGIN');
    triggerToast('success', 'DNI Desbloqueado', 'Se han restablecido los intentos biométricos.');
  };

  // Stepper representation based on current view in Fase 3
  const getRenewalActiveStep = () => {
    if (currentScreen === 'PAYMENT') return 0;
    if (currentScreen === 'FORM') return 1; // internally has formStep 0 and 1
    if (currentScreen === 'PREVIEW') return 2;
    return 0;
  };

  const stepsMeta = [
    { label: 'Pago de Tasa', icon: CreditCard, desc: 'Pasarela' },
    { label: 'Actualización y Oficina', icon: UserCheck, desc: 'Datos' },
    { label: 'Ficha Digital', icon: FileText, desc: 'Comprobante DNIe' },
  ];

  const inRenewalFlow = currentScreen === 'PAYMENT' || currentScreen === 'FORM' || currentScreen === 'PREVIEW';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 relative">
      
      {/* State/Restoration Telemetry Banner */}
      <StatusBanner
        ciudadano={ciudadano}
        solicitud={solicitud}
        pago={pago}
        tokenJWT={tokenJWT}
        hasRestored={hasRestored}
        onReset={handleResetAll}
      />

      {/* Main GOB.PE Institutional Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm relative z-10" id="main-header">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand Group */}
          <div className="flex items-center gap-3">
            {/* National Shield Graphic Simulation */}
            <div className="h-10 w-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold text-center border-2 border-white shadow-md">
              <span className="text-xs leading-none">PE</span>
            </div>
            
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[#003B7E] text-base tracking-tight uppercase">RENIEC</span>
                <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.2 rounded-full">DNIe v4.0</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                Plataforma de Renovación de DNI Electrónico Integrada
              </p>
            </div>
          </div>

          {/* Notification Bell and Secure SSL Lock Badge */}
          <div className="flex items-center gap-3">
            
            {/* Notification Bell Component */}
            <div className="relative" id="notification-bell-container">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className={`relative p-2 text-slate-500 hover:text-[#003B7E] hover:bg-slate-100 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[#003B7E]/20 ${notifDropdownOpen ? 'bg-slate-100 text-[#003B7E]' : ''}`}
                title="Bandeja de Notificaciones"
                id="notification-bell-btn"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white ring-2 ring-white">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {/* Dropdown Card */}
              {notifDropdownOpen && (
                <>
                  {/* Backdrop overlay to close when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setNotifDropdownOpen(false)} 
                  />
                  
                  <div 
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden transform origin-top-right transition-all"
                    id="notification-dropdown"
                  >
                    {/* Header */}
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-150 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 text-sm">Notificaciones</span>
                        <span className="bg-[#003B7E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {notifications.length}
                        </span>
                      </div>
                      
                      {notifications.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[#003B7E] hover:underline text-[11px] font-medium"
                          >
                            Leídas
                          </button>
                          <span className="text-slate-300">|</span>
                          <button
                            onClick={clearAllNotifications}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="Limpiar todas"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Content List */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                          <Bell className="h-8 w-8 text-slate-300 stroke-1" />
                          <p className="text-xs font-medium">Bandeja vacía</p>
                          <p className="text-[10px] text-slate-400">Te mantendremos al tanto de tus trámites en curso.</p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isUnread = !notif.isRead;
                          return (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markNotificationAsRead(notif.id);
                              }}
                              className={`p-4 flex gap-3 transition-colors text-left relative cursor-pointer ${
                                isUnread ? 'bg-blue-50/40 hover:bg-blue-50/80' : 'hover:bg-slate-50'
                              }`}
                            >
                              {/* Unread marker point */}
                              {isUnread && (
                                <span className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-blue-600" />
                              )}

                              {/* Alert Status Icon Column */}
                              <div className="shrink-0 pt-0.5">
                                {notif.type === 'success' && <CheckCircle className="h-4.5 w-4.5 text-emerald-600" />}
                                {notif.type === 'info' && <Activity className="h-4.5 w-4.5 text-[#003B7E]" />}
                                {notif.type === 'warning' && <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />}
                                {notif.type === 'error' && <XCircle className="h-4.5 w-4.5 text-red-600" />}
                              </div>

                              {/* Description details */}
                              <div className="min-w-0 flex-1 pr-2">
                                <p className={`text-xs font-bold leading-snug ${isUnread ? 'text-[#003B7E]' : 'text-slate-800'}`}>
                                  {notif.title}
                                </p>
                                <p className="text-[11px] text-slate-600 leading-normal mt-0.5">
                                  {notif.description}
                                </p>
                                <p className="text-[9px] text-slate-400 font-mono mt-1.5 uppercase">
                                  {new Date(notif.timestamp).toLocaleTimeString('es-PE', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })} - {new Date(notif.timestamp).toLocaleDateString('es-PE')}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Secure SSL Lock Badge */}
            <div className="flex items-center gap-3 bg-blue-50/80 border border-blue-150 rounded-xl px-4 py-2">
              <Lock className="h-4.5 w-4.5 text-[#003B7E] shrink-0" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-700 block leading-tight">Canal Seguro Certificado</span>
                <span className="text-[9px] text-slate-500 font-mono">RENIEC ID: PROT_RENOV_DNIE_2026</span>
              </div>
            </div>

          </div>

        </div>

        {/* Peruvian Flag Ribbon underneath header */}
        <div className="h-1 w-full bg-gradient-to-r from-red-600 via-white to-red-600" />
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* Dynamic Stepper Sidebar (Only shows during renewal steps) */}
        {inRenewalFlow && (
          <aside className="w-full lg:w-64 shrink-0" id="stepper-sidebar">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-6 space-y-6">
              
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">PASOS DE RENOVACIÓN</span>
                <h3 className="text-xs font-bold text-[#003B7E] uppercase">Mi Trámite TO-BE</h3>
              </div>

              {/* Steps vertical list */}
              <div className="space-y-4">
                {stepsMeta.map((meta, idx) => {
                  const StepIcon = meta.icon;
                  const activeIdx = getRenewalActiveStep();
                  const isCompleted = activeIdx > idx;
                  const isActive = activeIdx === idx;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex gap-3 text-xs transition-all ${
                        isCompleted ? 'text-emerald-700 font-medium' : isActive ? 'text-[#003B7E] font-bold' : 'text-slate-400'
                      }`}
                    >
                      {/* Line connector */}
                      <div className="flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                          isCompleted 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                            : isActive 
                            ? 'bg-blue-50 border-[#003B7E] text-[#003B7E] ring-2 ring-blue-500/20' 
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}>
                          <StepIcon className="h-3 w-3" />
                        </div>
                        {idx < stepsMeta.length - 1 && (
                          <div className={`w-[2px] h-6 my-1 ${isCompleted ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                        )}
                      </div>

                      <div className="pt-0.5 min-w-0">
                        <p className="leading-tight truncate">{meta.label}</p>
                        <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide truncate">{meta.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status metrics widget */}
              <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-500 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span>SSL encryption:</span>
                  <span className="text-emerald-600 font-bold">ACTIVO</span>
                </div>
                <div className="flex justify-between">
                  <span>Firma Biométrica:</span>
                  <span className="text-emerald-600 font-bold">CONCEDE</span>
                </div>
              </div>

            </div>
          </aside>
        )}

        {/* Dynamic Frame Layout */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          
          {/* Restoration Alert Dialog overlay */}
          <AnimatePresence>
            {restorableSession && currentScreen === 'DASHBOARD' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 w-full max-w-xl shadow-md flex flex-col md:flex-row gap-4 items-start relative overflow-hidden"
                id="restoration-dialog"
              >
                {/* Ribbon */}
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-600" />
                
                <div className="bg-blue-100 p-3 rounded-xl text-blue-800 shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                
                <div className="space-y-3 flex-1">
                  <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                    Trámite Registral Pendiente Guardado
                  </h3>
                  <p className="text-xs text-blue-700 leading-relaxed font-mono">
                    Hemos recuperado un avance de su trámite en la base de datos segura de RENIEC.<br />
                    ¿Desea restaurar el estado y reanudar el flujo?
                  </p>
                  
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleRestoreSession}
                      className="bg-[#003B7E] hover:bg-blue-800 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all shadow-sm flex items-center gap-1"
                      id="btn-confirm-restore"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Restaurar Progreso</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeclineRestore}
                      className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs py-2 px-4 rounded-lg cursor-pointer transition-all"
                      id="btn-decline-restore"
                    >
                      Descartar y empezar de cero
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Wizard step views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScreen}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center animate-fadeIn"
            >
              
              {/* Pantalla 1: Ingreso de DNI */}
              {currentScreen === 'LOGIN' && (
                <DNIeLogin onLogin={handleLogin} />
              )}

              {/* Pantalla 2: Instrucciones Biométricas */}
              {currentScreen === 'BIO_INSTRUCTIONS' && ciudadano && (
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6" id="instructions-container">
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-blue-50 text-[#003B7E] rounded-full">
                      <Fingerprint className="h-10 w-10 animate-pulse" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
                      Fase 1: Verificación de Identidad Biométrica
                    </h2>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Por políticas de seguridad nacional del Estado Peruano, debe realizar una prueba de vida facial antes de acceder al menú de trámites.
                    </p>
                  </div>

                  {/* Instructions Box card */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Recomendaciones obligatorias</span>
                    
                    <div className="space-y-2.5 text-xs text-slate-700">
                      <div className="flex gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">1</span>
                        <p className="leading-snug"><strong>Buena iluminación:</strong> Busque un lugar con luz natural frontal directa. Evite sombras duras.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">2</span>
                        <p className="leading-snug"><strong>Rostro descubierto:</strong> Quítese los anteojos, gorros, aretes llamativos o mechones de cabello que cubran la frente.</p>
                      </div>
                      <div className="flex gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-700 font-bold font-mono text-[10px] flex items-center justify-center shrink-0">3</span>
                        <p className="leading-snug"><strong>Expresión neutral:</strong> Mire directamente al centro de la cámara. Mantenga la boca cerrada sin sonreír exageradamente.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleResetAll}
                      className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 rounded-xl font-bold text-xs text-slate-700 transition-all cursor-pointer text-center"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('BIO_CAPTURE')}
                      className="flex-1 py-2.5 bg-[#003B7E] hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1"
                      id="btn-goto-capture"
                    >
                      <span>Iniciar Validación</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Pantalla 3: Captura en Vivo (Liveness) */}
              {currentScreen === 'BIO_CAPTURE' && ciudadano && (
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden" id="capture-container">
                  <div className="p-6 border-b border-slate-100 text-center">
                    <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                      Pantalla 3: Simulación de Cámara Frontal
                    </h2>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enfoque su rostro en el óvalo e inicie la verificación biométrica de coincidencia.
                    </p>
                  </div>

                  {/* Simulator Area */}
                  <div className="p-6 flex flex-col items-center bg-slate-50">
                    <div className="relative w-72 h-80 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex flex-col items-center justify-center shadow-lg">
                      
                      {/* Virtual Scanner Grid */}
                      <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center text-slate-400 p-8">
                        <svg className="h-40 w-40 text-slate-700 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>

                        <div className="text-center mt-3 z-10">
                          <span className="text-[9px] font-mono tracking-widest text-[#003B7E] bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
                            CÁMARA DISPOSITIVO
                          </span>
                        </div>
                      </div>

                      {/* Technical biometric overlay frame */}
                      <div className="absolute inset-x-8 top-10 bottom-14 border-2 border-dashed border-blue-500 rounded-[50%/40%] pointer-events-none flex items-center justify-center opacity-80">
                        <div className="w-[90%] h-[90%] border border-blue-400/30 rounded-[50%/40%] animate-pulse" />
                      </div>

                      {/* Tech HUD Labels */}
                      <div className="absolute top-3 left-3 right-3 flex justify-between text-[8px] font-mono text-slate-400">
                        <span className="text-emerald-500 font-bold animate-pulse">● CAMARA ACTIVA</span>
                        <span>LUX: 420 OK</span>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2 text-center text-[10px] text-white font-mono z-10">
                        Mirar fijo a la cámara | Enfoque facial
                      </div>
                    </div>

                    {/* Path Simulator Switcher (CRUCIAL FOR EVALUATORS) */}
                    <div className="mt-4 w-full bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs">
                      <span className="font-bold text-blue-900 uppercase text-[9px] tracking-wider block mb-2">
                        🔧 Panel de Evaluación (Simulación IA)
                      </span>
                      <p className="text-slate-600 mb-2 leading-snug text-[11px]">
                        Seleccione el resultado para probar la bifurcación (Aprobado &gt;= 95% o Fallo para el bloqueo de 24h).
                      </p>
                      
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setSimulateSuccess(true)}
                          className={`flex-1 py-1.5 px-3 rounded-lg border font-bold text-[10px] text-center transition-all cursor-pointer ${
                            simulateSuccess 
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm' 
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Simular Éxito (Score 98.7%)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulateSuccess(false)}
                          className={`flex-1 py-1.5 px-3 rounded-lg border font-bold text-[10px] text-center transition-all cursor-pointer ${
                            !simulateSuccess 
                              ? 'bg-amber-600 border-amber-500 text-white shadow-sm' 
                              : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          Simular Fallo (Score &lt; 95%)
                        </button>
                      </div>

                      {biometricAttempts > 0 && (
                        <div className="mt-2 text-[10px] text-amber-700 font-mono font-bold flex justify-between">
                          <span>Intentos fallidos previos:</span>
                          <span>{biometricAttempts} de 3 máx.</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 w-full flex gap-3">
                      <button
                        type="button"
                        onClick={() => setCurrentScreen('BIO_INSTRUCTIONS')}
                        className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 bg-white rounded-xl font-bold text-xs text-slate-700 transition-all cursor-pointer"
                      >
                        Atrás: Guía
                      </button>
                      <button
                        type="button"
                        onClick={handleStartBiometricVerification}
                        className="flex-1 py-2.5 bg-[#003B7E] hover:bg-blue-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        id="btn-trigger-ai"
                      >
                        <Camera className="h-4 w-4" />
                        <span>Capturar Rostro</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Pantalla 4: Procesamiento y Validación */}
              {currentScreen === 'BIO_PROCESSING' && (
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6" id="processing-container">
                  <div className="text-center space-y-3 py-6">
                    <RefreshCw className="h-12 w-12 text-[#003B7E] animate-spin mx-auto" />
                    
                    <h2 className="text-base font-bold text-slate-800 uppercase tracking-tight">
                      Pantalla 4: Procesamiento y Validación IA
                    </h2>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Evaluando firma espectral facial y parámetros ISO 19794-5 en tiempo real...
                    </p>
                  </div>

                  {/* Processing steps visually highlighted */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Paso 1: Validación de Humano</span>
                      <span className={evaluatingStep >= 1 ? "text-emerald-600 font-bold" : "text-slate-400 animate-pulse"}>
                        {evaluatingStep >= 1 ? "✓ COMPLETADO" : "EVALUANDO..."}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-150 pt-2">
                      <span className="text-slate-500">Paso 2: Simetría OACI e Iluminación</span>
                      <span className={evaluatingStep >= 2 ? "text-emerald-600 font-bold" : evaluatingStep === 1 ? "text-blue-500 font-bold animate-pulse" : "text-slate-400"}>
                        {evaluatingStep >= 2 ? "✓ 100% CUMPLE" : evaluatingStep === 1 ? "ANALIZANDO..." : "PENDIENTE"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-150 pt-2">
                      <span className="text-slate-500">Paso 3: Score de Coincidencia</span>
                      <span className={evaluatingStep >= 3 ? "text-emerald-600 font-bold" : evaluatingStep === 2 ? "text-blue-500 font-bold animate-pulse" : "text-slate-400"}>
                        {evaluatingStep >= 3 ? "✓ EVALUADO" : evaluatingStep === 2 ? "CALCULANDO..." : "PENDIENTE"}
                      </span>
                    </div>
                  </div>

                  {/* Aesthetic loading bar progress */}
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-[#003B7E] h-full transition-all duration-1000"
                      style={{ width: `${(evaluatingStep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Pantalla de Excepción: Bloqueo de 24 Horas */}
              {currentScreen === 'BIO_LOCKED' && (
                <div className="max-w-md w-full bg-slate-950 text-white rounded-2xl border-2 border-red-500/50 shadow-2xl p-6 space-y-6 relative overflow-hidden" id="locked-container">
                  {/* Subtle red neon glow */}
                  <div className="absolute inset-0 bg-red-950/10 pointer-events-none" />
                  
                  <div className="text-center space-y-3 z-10 relative">
                    <XCircle className="h-14 w-14 text-red-500 mx-auto animate-bounce" />
                    
                    <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold tracking-widest px-2.5 py-0.5 rounded-full uppercase">
                      Seguridad Nacional Bloqueada
                    </span>
                    
                    <h2 className="text-lg font-black tracking-tight uppercase text-red-500">
                      Acceso Suspendido Temporalmente
                    </h2>
                    
                    <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                      Ha superado el límite de <strong>3 intentos biométricos fallidos</strong> en la prueba de vida. Su cuenta y DNI han sido congelados por protección de identidad.
                    </p>
                  </div>

                  {/* Countdown display */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center z-10 relative">
                    <span className="text-[10px] text-slate-400 font-mono block uppercase">Su cuenta se desbloqueará en:</span>
                    <span className="text-3xl font-mono font-bold text-red-500 tracking-wider">
                      {formatCountdown(lockedTimeLeft)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed space-y-2 z-10 relative">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <p><strong>Detalle:</strong> Si cree que es un error, comuníquese con el Centro de Atención RENIEC o acérquese de forma presencial.</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4 flex flex-col gap-3 z-10 relative">
                    <a
                      href="mailto:consultas@reniec.gob.pe"
                      className="py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-center text-xs font-semibold text-slate-300 transition-all"
                    >
                      Soporte: consultas@reniec.gob.pe
                    </a>
                    
                    {/* Simulator Unlock override button */}
                    <button
                      type="button"
                      onClick={handleSimulatedUnlock}
                      className="py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow"
                    >
                      Simular Desbloqueo (Para Evaluación)
                    </button>
                  </div>
                </div>
              )}

              {/* Fase 2: El Dashboard Principal (Bifurcación) */}
              {currentScreen === 'DASHBOARD' && ciudadano && (
                <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6" id="dashboard-container">
                  
                  {/* Greeting segment */}
                  <div className="flex justify-between items-start border-b border-slate-100 pb-5">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">PORTAL REGISTRAL DEL ESTADO</span>
                      <h2 className="text-lg font-black text-[#003B7E] tracking-tight">
                        Bienvenido, {ciudadano.nombres} {ciudadano.primerApellido}
                      </h2>
                      <div className="flex gap-4 text-[10px] text-slate-500 mt-1 font-mono">
                        <span>DNI: {ciudadano.dni}</span>
                        <span>Sede de Origen: {ciudadano.departamento}</span>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg p-2 text-right">
                      <span className="text-[9px] font-mono block font-bold leading-none">ESTADO DNI</span>
                      <span className="text-xs font-bold font-mono">
                        {ciudadano.diasParaCaducar && ciudadano.diasParaCaducar < 0 
                          ? "CADUCADO" 
                          : `${ciudadano.diasParaCaducar} días vigentes`
                        }
                      </span>
                    </div>
                  </div>

                  {/* Validation Rule Alert: If they tried to renew but were rejected */}
                  <AnimatePresence>
                    {show60DaysError && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4 text-xs text-amber-800 space-y-2 relative"
                        id="60days-rule-block"
                      >
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="font-bold uppercase tracking-wider text-amber-900 text-[10px]">
                              Trámite Restringido por Normativa
                            </h4>
                            <p className="leading-relaxed">
                              <strong>Regla de los 60 días:</strong> Su DNI aún se encuentra vigente. Solo puede iniciar el proceso de renovación digital dentro de los <strong>60 días anteriores</strong> a la fecha de su caducidad o vencimiento.
                            </p>
                            <p className="font-mono text-[10px] font-bold text-amber-950 mt-1">
                              (Días para caducar en su perfil: {ciudadano.diasParaCaducar} días restantes)
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <button
                            type="button"
                            onClick={() => setShow60DaysError(false)}
                            className="bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] py-1 px-3 rounded-lg cursor-pointer transition-all"
                          >
                            Entendido, Regresar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Two Main Branching Options (Bifurcación) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Opción A: Consultar Estado del Trámite */}
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('STATUS_TRACK')}
                      className="text-left bg-white border-2 border-slate-200 hover:border-[#003B7E]/50 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
                      id="opt-query-status"
                    >
                      <div className="space-y-2">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#003B7E] flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <Activity className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                          Opción A: Consultar Estado del Trámite
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Verifique el avance en la línea de tiempo registral, subsane observaciones pendientes o descargue su constancia final.
                        </p>
                      </div>
                      
                      <div className="text-xs text-[#003B7E] font-bold flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform self-end">
                        <span>Ingresar Consulta</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>

                    {/* Opción B: Iniciar Nuevo Trámite */}
                    <button
                      type="button"
                      onClick={() => {
                        // Check 60 days validity exception rule
                        if (ciudadano.diasParaCaducar && ciudadano.diasParaCaducar > 60) {
                          setShow60DaysError(true);
                        } else {
                          // Eligible to start renewal
                          setShow60DaysError(false);
                          setCurrentScreen('PAYMENT');
                        }
                      }}
                      className="text-left bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200 hover:border-[#003B7E]/50 rounded-2xl p-5 hover:shadow-lg transition-all cursor-pointer group space-y-3 flex flex-col justify-between"
                      id="opt-start-renewal"
                    >
                      <div className="space-y-2">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                          <UserCheck className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">
                          Opción B: Iniciar Nuevo Trámite
                        </h3>
                        <p className="text-[11px] text-slate-500 leading-snug">
                          Inicie la secuencia de autogestión virtual para renovar su DNIe. (Se requiere pago de tasa).
                        </p>
                      </div>

                      <div className="text-xs text-indigo-700 font-bold flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform self-end">
                        <span>Iniciar Renovación</span>
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </button>

                  </div>

                  {/* Reset/Back button */}
                  <div className="border-t border-slate-150 pt-4 flex justify-between text-xs text-slate-500">
                    <span>RENIEC Portal Seguro</span>
                    <button
                      type="button"
                      onClick={handleResetAll}
                      className="hover:text-red-600 font-bold font-mono transition-colors cursor-pointer"
                    >
                      [ Cerrar Sesión Ciudadana ]
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 1: Pasarela de Pagos (Fase 3, Pantalla 5) */}
              {currentScreen === 'PAYMENT' && ciudadano && (
                <DNIePayment 
                  dni={dni} 
                  onPaymentSuccess={handlePaymentSuccess} 
                  onPrev={() => setCurrentScreen('DASHBOARD')} 
                />
              )}

              {/* Paso 2 y 3: Actualización de Datos y Selección Sede (Fase 3, Pantalla 6 & 7) */}
              {currentScreen === 'FORM' && ciudadano && (
                <DNIeForm 
                  ciudadano={ciudadano} 
                  onSuccess={handleFormSuccess} 
                  onPrev={() => setCurrentScreen('PAYMENT')} 
                />
              )}

              {/* Paso 4: Ficha del Trámite / Resumen (Fase 3, Pantalla 8) */}
              {currentScreen === 'PREVIEW' && ciudadano && pago && (
                <DNIePreview 
                  ciudadano={ciudadano} 
                  pago={pago} 
                  sede={SEDES_RENIEC.find(s => s.codigo === solicitud?.codigoSedeRecojo) || SEDES_RENIEC[0]} 
                  tokenJWT={tokenJWT}
                  solicitud={solicitud!}
                  onRestart={() => setCurrentScreen('DASHBOARD')} 
                />
              )}

              {/* Fase 4: Flujo "Consultar Trámite" (Pantallas 9 & 10 & Excepción Sin Trámite) */}
              {currentScreen === 'STATUS_TRACK' && ciudadano && (
                <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6" id="status-track-container">
                  
                  {/* Status track header */}
                  <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">FISCALIZACIÓN DE TRÁMITES</span>
                      <h2 className="text-base font-black text-[#003B7E] uppercase">
                        Consulta de Estado de Trámite
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentScreen('DASHBOARD')}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
                    >
                      Cerrar Consulta
                    </button>
                  </div>

                  {/* Exception Screen: NO active procedure */}
                  {!solicitud ? (
                    <div className="text-center py-10 space-y-4" id="empty-state">
                      <div className="inline-flex p-4 bg-amber-50 text-amber-600 rounded-full border border-amber-200">
                        <AlertCircle className="h-8 w-8" />
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-800 uppercase">Sin Trámites Activos</h3>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                          Usted no tiene un trámite de renovación de DNI activo en la plataforma en este momento.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setCurrentScreen('DASHBOARD')}
                        className="bg-[#003B7E] hover:bg-blue-800 text-white font-bold text-xs py-2 px-6 rounded-lg cursor-pointer transition-all shadow-sm inline-flex items-center gap-1"
                      >
                        <ArrowRight className="h-4 w-4" />
                        <span>Ir al Menú Principal</span>
                      </button>
                    </div>
                  ) : ciudadano.estadoTramiteInicial === 'PENDIENTE_DE_SUBSANACION' ? (
                    
                    /* Pantalla 10: Vista de "Pendiente de Subsanación" (Crucial) */
                    <div className="space-y-5" id="subsanacion-state">
                      
                      {/* Critical orange observed alert box */}
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 space-y-2 relative overflow-hidden">
                        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-amber-500" />
                        
                        <div className="flex gap-3">
                          <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider">
                              Trámite Registral Observado
                            </h4>
                            <p className="text-xs text-amber-800 font-semibold leading-relaxed">
                              Su trámite ha sido observado. Motivo: La fotografía no cumple con la iluminación requerida.
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-amber-200/50 flex justify-between items-center text-[11px] text-amber-900">
                          <span>Fecha de Observación: 02/07/2026</span>
                          <span>Código Trámite: {solicitud.idSolicitud}</span>
                        </div>
                      </div>

                      {/* Timeline mapping showing observation state */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Línea de Tiempo Registral (Observada)</h4>
                        
                        <div className="relative flex flex-col gap-6 pl-6 border-l border-slate-200 py-2">
                          {/* Node 1 */}
                          <div className="relative">
                            <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center">
                              <span className="text-[10px] font-bold">✓</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase block">1. Solicitud Iniciada</span>
                            <span className="text-[10px] text-slate-500 font-mono">Presentada el 02/07/2026</span>
                          </div>

                          {/* Node 2 */}
                          <div className="relative">
                            <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center">
                              <span className="text-[10px] font-bold">✓</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 uppercase block">2. Pago de Tasa Verificado</span>
                            <span className="text-[10px] text-slate-500 font-mono">Aprobado - S/. 41.00</span>
                          </div>

                          {/* Node 3 - Observed */}
                          <div className="relative">
                            <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-amber-100 border-2 border-amber-500 text-amber-600 flex items-center justify-center animate-pulse">
                              <span className="text-[10px] font-bold">!</span>
                            </div>
                            <span className="text-xs font-extrabold text-amber-700 uppercase block">3. Evaluación Biofacial (Observado)</span>
                            <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">La iluminación facial es insuficiente para biometría OACI.</span>
                          </div>

                          {/* Node 4 - Blocked */}
                          <div className="relative opacity-40">
                            <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-slate-50 border border-slate-300 text-slate-400 flex items-center justify-center">
                              <span className="text-[10px] font-mono">4</span>
                            </div>
                            <span className="text-xs font-bold text-slate-600 uppercase block">4. En Producción</span>
                            <span className="text-[10px] text-slate-500 block">Espera corrección de imagen.</span>
                          </div>
                        </div>
                      </div>

                      {/* Corregir ahora Action Button */}
                      <div className="border-t border-slate-150 pt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('DASHBOARD')}
                          className="flex-1 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Volver al Menú
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            // Reset attempts for a fresh correction try
                            setBiometricAttempts(0);
                            setCurrentScreen('BIO_CAPTURE');
                            triggerToast('info', 'Corregir Observación', 'Regresando a la captura biométrica para subsanación.');
                          }}
                          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1"
                          id="btn-correct-now"
                        >
                          <Camera className="h-4 w-4" />
                          <span>Corregir Ahora</span>
                        </button>
                      </div>

                    </div>
                  ) : (
                    
                    /* Pantalla 9: Línea de Tiempo Registral (Barra de Progreso Normal) */
                    <div className="space-y-6" id="progress-timeline-container">
                      
                      <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase">Código de Solicitud:</span>
                          <span className="text-xs font-bold font-mono text-slate-800">{solicitud.idSolicitud}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase">Porcentaje de Avance:</span>
                          <span className="text-xs font-extrabold text-[#003B7E] font-mono">
                            {solicitud.estado === 'COMPLETADO' ? "100%" : solicitud.estado === 'PAGADO' ? "40%" : "20%"}
                          </span>
                        </div>
                      </div>

                      {/* Timeline Steps layout */}
                      <div className="space-y-5">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Estado del Trámite en Producción</h4>

                        <div className="space-y-4">
                          
                          {/* Step 1: Iniciado */}
                          <div className="flex gap-4 items-start">
                            <div className="h-6 w-6 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-600 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-bold">✓</span>
                            </div>
                            <div className="pt-0.5">
                              <span className="text-xs font-bold text-slate-800 block">Iniciado (Solicitud Registrada)</span>
                              <p className="text-[10px] text-slate-500 leading-snug">El ciudadano completó la biometría satisfactoria en vivo.</p>
                            </div>
                          </div>

                          {/* Step 2: Pagado */}
                          <div className="flex gap-4 items-start">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                              solicitud.estado === 'PAGADO' || solicitud.estado === 'COMPLETADO'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-slate-50 border-slate-300 text-slate-400'
                            }`}>
                              {solicitud.estado === 'PAGADO' || solicitud.estado === 'COMPLETADO' ? (
                                <span className="text-[10px] font-bold">✓</span>
                              ) : (
                                <span className="text-[9px] font-mono">2</span>
                              )}
                            </div>
                            <div className="pt-0.5">
                              <span className={`text-xs font-bold block ${solicitud.estado === 'PAGADO' || solicitud.estado === 'COMPLETADO' ? 'text-slate-800' : 'text-slate-400'}`}>
                                Pagado (Tasa de Derecho)
                              </span>
                              <p className="text-[10px] text-slate-500 leading-snug">Simulación del abono de tasa mediante Yape, Plin o Págalo.pe.</p>
                            </div>
                          </div>

                          {/* Step 3: Fiscalizado */}
                          <div className="flex gap-4 items-start">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                              solicitud.estado === 'COMPLETADO'
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                                : 'bg-slate-50 border-slate-300 text-slate-400'
                            }`}>
                              {solicitud.estado === 'COMPLETADO' ? (
                                <span className="text-[10px] font-bold">✓</span>
                              ) : (
                                <span className="text-[9px] font-mono">3</span>
                              )}
                            </div>
                            <div className="pt-0.5">
                              <span className={`text-xs font-bold block ${solicitud.estado === 'COMPLETADO' ? 'text-slate-800' : 'text-slate-400'}`}>
                                Fiscalizado (Análisis de Datos y Sede)
                              </span>
                              <p className="text-[10px] text-slate-500 leading-snug">Evaluación final de los datos y asignación de la oficina registral de recojo.</p>
                            </div>
                          </div>

                          {/* Step 4: En Producción */}
                          <div className="flex gap-4 items-start">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                              solicitud.estado === 'COMPLETADO'
                                ? 'bg-blue-50 border-blue-600 text-blue-600 ring-2 ring-blue-500/10'
                                : 'bg-slate-50 border-slate-300 text-slate-400'
                            }`}>
                              <span className="text-[9px] font-mono">4</span>
                            </div>
                            <div className="pt-0.5">
                              <span className={`text-xs font-bold block ${solicitud.estado === 'COMPLETADO' ? 'text-slate-800' : 'text-slate-400'}`}>
                                En Producción (Fábrica Nacional)
                              </span>
                              <p className="text-[10px] text-slate-500 leading-snug">
                                {solicitud.estado === 'COMPLETADO' 
                                  ? "Imprimiendo chip y holograma físico del nuevo DNI electrónico."
                                  : "Pendiente de finalizar autogestión de datos."
                                }
                              </p>
                            </div>
                          </div>

                          {/* Step 5: Listo en Agencia */}
                          <div className="flex gap-4 items-start opacity-50">
                            <div className="h-6 w-6 rounded-full bg-slate-50 border border-slate-300 text-slate-400 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-mono">5</span>
                            </div>
                            <div className="pt-0.5">
                              <span className="text-xs font-bold text-slate-600 block">Listo para Recoger</span>
                              <p className="text-[10px] text-slate-500 leading-snug">Se notificará vía SMS para su entrega física en oficina.</p>
                            </div>
                          </div>

                        </div>
                      </div>

                      <div className="border-t border-slate-150 pt-4">
                        <button
                          type="button"
                          onClick={() => setCurrentScreen('DASHBOARD')}
                          className="w-full py-2.5 bg-[#003B7E] hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                        >
                          Regresar al Menú Principal
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>
      </main>

      {/* Institutional GOB.PE footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-slate-500 text-xs mt-12 relative z-10" id="main-footer">
        <div className="max-w-7xl mx-auto px-4 space-y-4">
          <div className="flex justify-center items-center gap-2">
            <div className="bg-red-600 text-white font-black px-2 py-0.5 text-[10px] rounded tracking-widest">
              PERÚ
            </div>
            <span className="font-bold text-slate-700">Ministerio de Justicia y Derechos Humanos</span>
          </div>
          
          <p className="max-w-2xl mx-auto leading-relaxed text-slate-400">
            © {new Date().getFullYear()} RENIEC - Registro Nacional de Identificación y Estado Civil. Todos los derechos reservados.<br />
            Este prototipo cumple estrictamente con las normativas peruanas de protección de datos personales (Ley N° 29733) y estándares biométricos internacionales de aviación civil (ICAO / OACI Doc 9303).
          </p>

          <div className="flex justify-center gap-6 font-mono text-[10px] text-slate-400 pt-2 border-t border-slate-100">
            <span>Materia: Renovación de Firma y DNIe</span>
            <span>Estándar: ISO 19794-5</span>
            <span>Seguridad: Algoritmo HS256 JWT</span>
          </div>
        </div>
      </footer>

      {/* Floating State Toasts Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

    </div>
  );
}
