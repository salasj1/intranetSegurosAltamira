import React from 'react';
import { Row, Col, Form, FloatingLabel, Card, Collapse } from 'react-bootstrap';
import { LocalizationProvider, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Checkbox, FormControlLabel } from '@mui/material';
import Select from 'react-select';
import { FaCar, FaMotorcycle, FaTaxi, FaWalking, FaSubway, FaBus, FaBusAlt, FaQuestion, FaQuestionCircle } from 'react-icons/fa';
import CheckboxTileGroup from '../components/CheckboxTileGroup';
import RutaHabitualSection from './RutaHabitualSection';
import style from '../styles/ExpedienteEmpleado.module.css';
import { TravelSegmentProps } from '@/types/rutograma.types'; // Importar el tipo refactorizado
import dayjs from 'dayjs';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
// Utilidad para asegurar que el valor sea dayjs o null para el TimePicker
function toDayjsOrNull(val: string | null): dayjs.Dayjs | null {
  if (!val) return null;
  const d = dayjs(val, 'HH:mm');
  return d.isValid() ? d : null;
}

const TravelSegment: React.FC<TravelSegmentProps> = ({
  config,
  globalState,
  setGlobalState,
  formState,
  setFormState,
  global,
  disabled = false
}) => {
  const {
    mainTitle,
    transportTitle,
    transportHint,
    transportNote,
    departureTimeLabel,
    travelSubtitle,
    actividadPreguntaLabel,
    rutaTitulo,
    rutaPlaceholder,
    includeSchedule,
    includeContact
  } = config;
  return (
    <div
      id='travel-segment'
      style={{
      background: '#fff',
      borderRadius: '18px',
      boxShadow: '0 6px 24px rgba(0,0,0,0.10)',
      padding: '2rem 1.75rem',
      marginBottom: '2rem',
      minWidth: 200,
      width: '100%',
      maxWidth: 1000,
      margin: '0 auto',
      overflow: 'hidden',
      }}
    >
      <h4 style={{ color: '#003f9e', fontWeight: 600, marginBottom: 24, textAlign: 'center', letterSpacing: '.5px' }}>{mainTitle}</h4>
      <Row>
        {includeSchedule && (
          <Col md={12} className={style.mb24}>
            <div className={style.scheduleBox}>
              <h5 className={style.scheduleTitle}>Horario de trabajo <span style={{color:'#dc3545'}}>*</span></h5>
              <hr className={style.scheduleDivider} />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <div className={style.scheduleTimeRow}>
                  <TimePicker 
                    label="Desde" 
                    value={toDayjsOrNull(globalState.horarioTrabajoDesde)} 
                    onChange={(v) => setGlobalState(prev => ({ ...prev, horarioTrabajoDesde: v ? v.format('HH:mm') : null }))
                    }
                    ampm 
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} 
                    disabled={disabled}
                  />
                  <span style={{ fontWeight: 500, color: '#003f9e' }}>-</span>
                  <TimePicker 
                    label="Hasta" 
                    value={toDayjsOrNull(globalState.horarioTrabajoHasta)} 
                    onChange={(v) => setGlobalState(prev => ({ ...prev, horarioTrabajoHasta: v ? v.format('HH:mm') : null }))
                    }
                    ampm 
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} 
                    disabled={disabled}
                  />
                </div>
              </LocalizationProvider>
            </div>
          </Col>
        )}

        {/* Transporte */}
        <Col md={12} className={style.mb24}>
          <div className={style.transportBox}>
            <h5 className={style.transportTitle}>{transportTitle} <span style={{color:'#dc3545'}}>*</span></h5>
            <span className={style.transportHint}>{transportHint}</span>
            <span className={style.transportNote}>{transportNote}</span>
            <div className={style.transportOptionsRow}>
              <CheckboxTileGroup
                options={global.tiposTransporte.map((tipo) => {
                  let icon = null; 
                  let labelmodificado = null;
                  switch (tipo.IdTipo) {
                    case 1: icon = <FaCar />; break;
                    case 2: icon = <FaMotorcycle />; break;
                    case 3: icon = <FaTaxi />; break;
                    case 4: icon = <FaWalking />; break;
                    case 5: icon = <FaSubway />; break;
                    case 6: icon = <FaBus />; break;
                    case 7: icon = <FaBusAlt />; labelmodificado = 'Transporte Público'; break;
                    case 8: icon = <FaQuestion />; break;
                    default: icon = <FaQuestion />;
                  }
                  return { id: tipo.IdTipo, label: labelmodificado || tipo.nombre, icon };
                })}
                selected={formState.tipoTransporteSeleccionado}
                onChange={(ids) => setFormState(prev => ({ ...prev, tipoTransporteSeleccionado: ids.map(Number) }))
                }
                disabled={disabled}
              />
              <div
                className={style.transportOther}
                style={{
                  width: '50%',
                  maxHeight: formState.tipoTransporteSeleccionado.includes(8) ? 120 : 0,
                  opacity: formState.tipoTransporteSeleccionado.includes(8) ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease-out, opacity 0.25s ease-out',
                  marginTop: formState.tipoTransporteSeleccionado.includes(8) ? 0 : -20,
                  pointerEvents: formState.tipoTransporteSeleccionado.includes(8) ? 'auto' : 'none',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Form.Label style={{ fontWeight: 500, color: '#495057' }}>¿Cuál medio de transporte?</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Especifique el medio de transporte"
                  value={formState.medioTransporteOtro}
                  onChange={(e) => setFormState(prev => ({ ...prev, medioTransporteOtro: e.target.value }))}
                  disabled={disabled}
                />
              </div>
            </div>
          </div>
        </Col>

        {/* Hora salida */}
        {departureTimeLabel && (
          <Col md={12} className={style.mb24}>
            <div className={`${style.departureBox} ${style.departureagg}`}>
              <div style={{alignContent: 'center'}}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <div className={style.departureTimeRow}>
                    <TimePicker 
                      label={departureTimeLabel + (includeContact ? ' *' : '')} 
                      value={toDayjsOrNull(globalState.horaSalida)} 
                      onChange={(v) => setGlobalState(prev => ({ ...prev, horaSalida: v ? v.format('HH:mm') : null }))
                      }
                      ampm 
                      viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} 
                      disabled={disabled}
                    />
                  </div>
                </LocalizationProvider>
              </div>
              {includeContact && (
                <div style={{flexDirection:'column', color:'#495057'}}>
                  <h5>Información de contacto de Referencia</h5>
                  <FloatingLabel label="Nombre de contacto" >
                    <Form.Control 
                      type="text" 
                      placeholder="Nombre de contacto" 
                      value={globalState.nombreReferencia} 
                      onChange={(e)=> setGlobalState(prev => ({ ...prev, nombreReferencia: e.target.value }))} 
                      disabled={disabled}
                    />
                  </FloatingLabel>
                  <br/>
                  <FloatingLabel label="Teléfono de contacto" >
                    <Form.Control 
                      type="text" 
                      placeholder="Teléfono de contacto" 
                      value={globalState.telefonoReferencia} 
                      onChange={(e)=> setGlobalState(prev => ({ ...prev, telefonoReferencia: e.target.value }))} 
                      disabled={disabled}
                    />
                  </FloatingLabel>
                </div>
              )}
            </div>
          </Col>
        )}

        {/* Durante el viaje */}
        <Col md={12} className={style.mb24}>
          <div className={style.travelBox}>
            <h5 className={style.travelSubtitle}>{travelSubtitle}</h5>
            <div className={style.travelQuestionsRow}>
              <div className={style.travelQuestionItem}>
                <label className={style.travelLabel}>Tiempo de viaje <span style={{color:'#dc3545'}}>*</span></label>
                <Select
                  options={[
                    { value: '0-30', label: 'De 0 a 30 min' },
                    { value: '30-60', label: 'De 30 a 60 min' },
                    { value: '60-90', label: 'De 60 a 90 min' },
                    { value: '90-120', label: 'De 90 a 120 min' },
                    { value: 'mas-120', label: 'Más de 120 min' }
                  ]}
                  value={[
                    { value: '0-30', label: 'De 0 a 30 min' },
                    { value: '30-60', label: 'De 30 a 60 min' },
                    { value: '60-90', label: 'De 60 a 90 min' },
                    { value: '90-120', label: 'De 90 a 120 min' },
                    { value: 'mas-120', label: 'Más de 120 min' }
                  ].find(opt => opt.value === formState.tiempoViaje) || null}
                  onChange={opt => setFormState(prev => ({ ...prev, tiempoViaje: opt ? opt.value : null }))}
                  placeholder="Seleccione el tiempo de viaje"
                  isClearable
                  styles={{ container: base => ({ ...base, minWidth: 220, maxWidth: 300 , color:'black'}) }}
                  isDisabled={disabled}
                />
              </div>
              <div className={style.travelQuestionItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <label style={{ color: '#6c757d' }}>¿Hace escalas en el trayecto?</label>
                  <span style={{ color: '#dc3545' }}>*</span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id="escalas-tooltip">
                        Este campo se refiere al número de paradas (escalas) que realizas en tu ruta principal antes de llegar a tu destino final.
                      </Tooltip>
                    }
                  >
                    {({ ref, ...triggerHandler }) => (
                      <span {...triggerHandler} ref={ref} style={{ display: 'flex', alignItems: 'center' }}>
                        <FaQuestionCircle style={{ color: '#007bff', cursor: 'pointer' }} />
                      </span>
                    )}
                  </OverlayTrigger>
                </div>
                <div style={{ marginTop: 8 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formState.haceEscalas === true}
                        onChange={() => setFormState(prev => ({ ...prev, haceEscalas: true }))}
                        color='primary'
                        disabled={disabled}
                      />
                    }
                    label='Sí'
                    className={style.travelCheckLabel}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formState.haceEscalas === false}
                        onChange={() => setFormState(prev => ({ ...prev, haceEscalas: false, numEscalas: null }))}
                        color='primary'
                        disabled={disabled}
                      />
                    }
                    label='No'
                    className={style.travelCheckLabel}
                  />
                </div>
              </div>
              {formState.haceEscalas === true && (
                <div className={style.travelQuestionItem}>
                <label className={style.travelLabel}>Número de escalas <span style={{color:'#dc3545'}}>*</span></label>
                {[1, 2, 3].map(num => (
                  <FormControlLabel 
                  key={num} 
                  control={<Checkbox checked={formState.numEscalas === num} onChange={() => setFormState(prev => ({ ...prev, numEscalas: num }))} color='primary' disabled={disabled} />} 
                  label={num.toString()} 
                  className={style.travelCheckLabel} 
                  />
                ))}
              </div>
              )}
            </div>
            </div>
        </Col>

        {/* Rutas */}
        <Col md={12} className={style.mb24}>
          <RutaHabitualSection
            titulo={rutaTitulo}
            rutas={formState.rutas}
            setRutas={(value) => {
              if (typeof value === 'function') {
                setFormState(prev => ({ ...prev, rutas: value(prev.rutas) }));
              } else {
                setFormState(prev => ({ ...prev, rutas: value }));
              }
            }}
            placeholder={rutaPlaceholder}
            styleModule={style}
            disabled={disabled}
          />
        </Col>

        {/* Actividades */}
        <Col md={12} className={style.mb24}>
          <div className={style.routeBox}>
            <label className={style.travelLabel}>{actividadPreguntaLabel} <span style={{color:'#dc3545'}}>*</span></label>
            <FormControlLabel 
              control={<Checkbox checked={formState.haceActividadAntes === true} onChange={() => setFormState(prev => ({ ...prev, haceActividadAntes: true }))} color='primary' disabled={disabled} />} 
              label='Sí' 
              className={style.travelCheckLabel} 
            />
            <FormControlLabel 
              control={<Checkbox checked={formState.haceActividadAntes === false} onChange={() => setFormState(prev => ({ ...prev, haceActividadAntes: false }))} color='primary' disabled={disabled} />} 
              label='No' 
              className={style.travelCheckLabel} 
            />
            <Collapse in={formState.haceActividadAntes === true}>
              <div style={{ marginTop: 16, color:'#495057', borderRadius: 10, padding: 20 }}>
                <h5>¿Qué tipo de actividades?</h5>
                <CheckboxTileGroup 
                  options={global.tiposActividad.map(a => ({ ...a, label: a.nombre }))} 
                  selected={formState.actividadesSeleccionadas} 
                  onChange={(ids)=> setFormState(prev => ({ ...prev, actividadesSeleccionadas: ids.map(Number) }))} 
                  disabled={disabled}
                />
                {formState.actividadesSeleccionadas.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    {formState.actividadesSeleccionadas.map(id => {
                      const act = global.tiposActividad.find(a => a.id === id);
                      if (!act) return null;
                      return (
                        <Card key={id} style={{ marginBottom: 18 }}>
                          <Card.Body>
                            <h6 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {act.icon} {act.nombre}
                            </h6>
                            <Row>
                              {act.nombre === 'Otro' && (
                                <Col md={12}>
                                  <Form.Group>
                                    
                                    <Form.Control 
                                      type="text" 
                                      placeholder="Describa la otra actividad" 
                                      value={formState.detallesActividades[id]?.otro || ''} 
                                      onChange={e => setFormState(prev => ({ 
                                        ...prev, 
                                        detallesActividades: {
                                          ...prev.detallesActividades,
                                          [id]: { 
                                            ...(prev.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                            otro: e.target.value 
                                          }
                                        }
                                      }))} 
                                    />
                                  </Form.Group>
                                </Col>
                              )}
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label>Ubicación (general)</Form.Label>
                                  <Form.Control 
                                    type="text" 
                                    placeholder="Parroquia o referencia" 
                                    value={formState.detallesActividades[id]?.ubicacion || ''} 
                                    onChange={e => setFormState(prev => ({ 
                                      ...prev, 
                                      detallesActividades: {
                                        ...prev.detallesActividades,
                                        [id]: { 
                                          ...(prev.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                          ubicacion: e.target.value 
                                        }
                                      }
                                    }))} 
                                    disabled={disabled}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Tiempo aproximado</Form.Label>
                                  <Form.Control 
                                    type="text" 
                                    placeholder="Ej: 30 minutos" 
                                    value={formState.detallesActividades[id]?.tiempo || ''} 
                                    onChange={e => setFormState(prev => ({ 
                                      ...prev, 
                                      detallesActividades: {
                                        ...prev.detallesActividades,
                                        [id]: { 
                                          ...(prev.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                          tiempo: e.target.value 
                                        }
                                      }
                                    }))} 
                                    disabled={disabled}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Descripción de la actividad</Form.Label>
                                  <Form.Control 
                                    as="textarea" 
                                    placeholder="Descripción de la actividad" 
                                    value={formState.detallesActividades[id]?.descripcion || ''} 
                                    onChange={e => setFormState(prev => ({ 
                                      ...prev, 
                                      detallesActividades: {
                                        ...prev.detallesActividades,
                                        [id]: { 
                                          ...(prev.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                          descripcion: e.target.value 
                                        }
                                      }
                                    }))} 
                                    disabled={disabled}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Frecuencia</Form.Label>
                                  <Form.Select
                                    value={formState.detallesActividades[id]?.frecuencia || ''}
                                    onChange={e => setFormState(prev => ({
                                      ...prev,
                                      detallesActividades: {
                                        ...prev.detallesActividades,
                                        [id]: {
                                          ...(prev.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }),
                                          frecuencia: e.target.value
                                        }
                                      }
                                    }))}
                                    disabled={disabled}
                                  >
                                    <option value="">Seleccione...</option>
                                    <option value="Diaria">Diaria</option>
                                    <option value="Ocasional">Ocasional</option>
                                  </Form.Select>
                                </Form.Group>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>
            </Collapse>
          </div>
        </Col>
      </Row>
    </div>
  );
};


export default TravelSegment;
