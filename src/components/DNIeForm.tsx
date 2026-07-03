/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, MapPin, Heart, Mail, Phone, Calendar, ArrowRight, Compass, HelpCircle } from 'lucide-react';
import { UBIGEO_DATA, SEDES_RENIEC } from '../data';
import { Ciudadano, SedeReniec } from '../types';

interface DNIeFormProps {
  ciudadano: Ciudadano;
  onSuccess: (updatedCiudadano: Ciudadano, selectedSede: string) => void;
  onPrev: () => void;
}

export const DNIeForm: React.FC<DNIeFormProps> = ({ ciudadano, onSuccess, onPrev }) => {
  // Region / Cascade states
  const [selectedDept, setSelectedDept] = useState(ciudadano.departamento || 'LIMA');
  const [selectedProv, setSelectedProv] = useState(ciudadano.provincia || 'LIMA');
  const [selectedDist, setSelectedDist] = useState(ciudadano.distrito || 'MIRAFLORES');

  // Cascade list helpers
  const [provincesList, setProvincesList] = useState<string[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);

  // Other form inputs
  const [direccion, setDireccion] = useState(ciudadano.direccionActual || '');
  const [correo, setCorreo] = useState(ciudadano.correo || '');
  const [celular, setCelular] = useState(ciudadano.celular || '');
  const [donacion, setDonacion] = useState(ciudadano.donacionOrganos ?? true);

  // Sede Recojo Selection
  const [selectedSedeCode, setSelectedSedeCode] = useState('');
  
  // Wizard flow step (0: Datos, 1: Sede)
  const [formStep, setFormStep] = useState(0);

  // Update cascade data when Department changes
  useEffect(() => {
    const provs = UBIGEO_DATA[selectedDept] ? Object.keys(UBIGEO_DATA[selectedDept]) : [];
    setProvincesList(provs);
    
    // Auto select first province if not matching previous state
    if (!provs.includes(selectedProv)) {
      setSelectedProv(provs[0] || '');
    }
  }, [selectedDept]);

  // Update cascade data when Province changes
  useEffect(() => {
    if (selectedDept && selectedProv && UBIGEO_DATA[selectedDept]?.[selectedProv]) {
      const dists = UBIGEO_DATA[selectedDept][selectedProv];
      setDistrictsList(dists);
      
      if (!dists.includes(selectedDist)) {
        setSelectedDist(dists[0] || '');
      }
    } else {
      setDistrictsList([]);
    }
  }, [selectedProv, selectedDept]);

  // Auto-fill pickup agency filter
  // We recommend agencies that are in the selected department to make it comfortable!
  const filteredSedes = SEDES_RENIEC.filter(s => s.departamento === selectedDept);
  const otherSedes = SEDES_RENIEC.filter(s => s.departamento !== selectedDept);

  // Default select first recommended agency
  useEffect(() => {
    if (filteredSedes.length > 0) {
      setSelectedSedeCode(filteredSedes[0].codigo);
    } else if (SEDES_RENIEC.length > 0) {
      setSelectedSedeCode(SEDES_RENIEC[0].codigo);
    }
  }, [selectedDept]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formStep === 0) {
      setFormStep(1);
      return;
    }

    const updated: Ciudadano = {
      ...ciudadano,
      departamento: selectedDept,
      provincia: selectedProv,
      distrito: selectedDist,
      direccionActual: direccion,
      correo,
      celular,
      donacionOrganos: donacion,
    };

    onSuccess(updated, selectedSedeCode);
  };

  const selectedSedeDetails = SEDES_RENIEC.find(s => s.codigo === selectedSedeCode);

  return (
    <div className="max-w-xl w-full mx-auto" id="form-container">
      {/* Step Header */}
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          {formStep === 0 
            ? "Paso 2: Actualización de Datos de Autogestión" 
            : "Paso 3: Selección de Sede de Recojo"
          }
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {formStep === 0
            ? "Actualice su domicilio legal y su decisión sobre la donación de órganos."
            : "Seleccione la oficina registral donde desea recoger su nuevo documento de identidad físico."
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-5">
          
          {formStep === 0 ? (
            <>
              {/* Section 1: Address Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#003B7E] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Home className="h-4 w-4" />
                  Actualización de Domicilio Legal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Department */}
                  <div>
                    <label htmlFor="select-dept" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Departamento / Región
                    </label>
                    <select
                      id="select-dept"
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 font-medium"
                    >
                      {Object.keys(UBIGEO_DATA).map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  {/* Province */}
                  <div>
                    <label htmlFor="select-prov" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Provincia
                    </label>
                    <select
                      id="select-prov"
                      value={selectedProv}
                      onChange={(e) => setSelectedProv(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 font-medium"
                    >
                      {provincesList.map(prov => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label htmlFor="select-dist" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Distrito
                    </label>
                    <select
                      id="select-dist"
                      value={selectedDist}
                      onChange={(e) => setSelectedDist(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 font-medium"
                    >
                      {districtsList.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Street Address */}
                <div>
                  <label htmlFor="input-direccion" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Avenida, Calle, Jirón o Pasaje y Número
                  </label>
                  <input
                    type="text"
                    id="input-direccion"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value.toUpperCase())}
                    placeholder="EJ. AV. JAVIER PRADO ESTE 1040, DPTO 501"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 uppercase font-medium"
                    required
                  />
                </div>
              </div>

              {/* Section 2: Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="text-xs font-bold text-[#003B7E] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Mail className="h-4 w-4" />
                    Datos de Contacto Ciudadano
                  </h3>
                </div>
                
                {/* Correo */}
                <div>
                  <label htmlFor="input-correo" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    id="input-correo"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="ciudadano@correo.com"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 font-medium"
                    required
                  />
                </div>

                {/* Celular */}
                <div>
                  <label htmlFor="input-celular" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Teléfono Celular
                  </label>
                  <input
                    type="tel"
                    id="input-celular"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))}
                    placeholder="Ej. 987654321"
                    maxLength={9}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 font-mono"
                    required
                  />
                </div>
              </div>

              {/* Section 3: Organ Donation */}
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-2.5">
                  <Heart className={`h-6 w-6 shrink-0 mt-0.5 ${donacion ? 'text-red-600 fill-red-100' : 'text-slate-400'}`} />
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase block">Donación de Órganos y Tejidos</span>
                    <span className="text-[11px] text-slate-500 leading-snug">
                      Su decisión se imprimirá textualmente en la parte posterior de su DNIe físico.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-xs font-bold font-mono ${!donacion ? 'text-red-600' : 'text-slate-400'}`}>
                    NO
                  </span>
                  <button
                    type="button"
                    onClick={() => setDonacion(!donacion)}
                    className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                      donacion ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    id="toggle-donacion"
                    aria-label="Toggle donación de órganos"
                  >
                    <div
                      className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ${
                        donacion ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold font-mono ${donacion ? 'text-emerald-600' : 'text-slate-400'}`}>
                    SÍ
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Section 4: Selection of Pickup Office */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-[#003B7E] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <MapPin className="h-4 w-4" />
                  Selección de Agencia de Entrega (Sede RENIEC)
                </h3>

                <div>
                  <label htmlFor="select-sede" className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Sede / Oficina Autorizada para Recojo
                  </label>
                  <select
                    id="select-sede"
                    value={selectedSedeCode}
                    onChange={(e) => setSelectedSedeCode(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#003B7E] focus:bg-white focus:outline-none text-slate-800 font-bold"
                    required
                  >
                    <optgroup label={`RECOMENDADAS (EN ${selectedDept})`}>
                      {filteredSedes.map(sede => (
                        <option key={sede.codigo} value={sede.codigo}>
                          {sede.nombre} — {sede.direccion}
                        </option>
                      ))}
                      {filteredSedes.length === 0 && (
                        <option disabled>No hay sedes cercanas listadas. Seleccione una de abajo.</option>
                      )}
                    </optgroup>
                    <optgroup label="OTRAS SEDES REGIONALES">
                      {otherSedes.map(sede => (
                        <option key={sede.codigo} value={sede.codigo}>
                          {sede.nombre} ({sede.departamento}) — {sede.direccion}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Selected Sede Information card */}
                {selectedSedeDetails && (
                  <div className="bg-blue-50/50 border border-blue-150 rounded-xl p-4 flex gap-3 text-xs" id="sede-details-card">
                    <Compass className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-[#003B7E] block">{selectedSedeDetails.nombre}</span>
                      <p className="text-slate-600 font-medium">Dirección: {selectedSedeDetails.direccion}</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Horario: {selectedSedeDetails.horarioAtencion}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* Footer actions */}
        <div className="bg-white border border-slate-200 rounded-2xl px-6 py-4 flex justify-between shadow-md">
          {formStep === 0 ? (
            <button
              type="button"
              onClick={onPrev}
              className="text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              id="btn-form-back"
            >
              Atrás: Menú Principal
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setFormStep(0)}
              className="text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg px-4 py-2 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
              id="btn-form-back-datos"
            >
              Atrás: Datos Personales
            </button>
          )}
          
          <button
            type="submit"
            className="bg-[#003B7E] hover:bg-blue-800 text-white py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-1 shadow-md hover:shadow-lg transition-all cursor-pointer"
            id="btn-form-submit"
          >
            {formStep === 0 ? (
              <>
                <span>Continuar a Selección de Sede</span>
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                <span>Generar Ficha Registral y DNIe</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
