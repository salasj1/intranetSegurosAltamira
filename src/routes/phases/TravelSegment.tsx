import React from 'react';
import { Row, Col, Form, FloatingLabel, Card, Collapse } from 'react-bootstrap';
import { LocalizationProvider, TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Checkbox, FormControlLabel } from '@mui/material';
import Select from 'react-select';
import { FaCar, FaMotorcycle, FaTaxi, FaWalking, FaSubway, FaBus, FaBusAlt, FaQuestion } from 'react-icons/fa';
import CheckboxTileGroup from '../../components/CheckboxTileGroup';
import RutaHabitualSection from './RutaHabitualSection';
import style from '../../css/ExpedienteEmpleado.module.css';
import { TravelSegmentProps } from '../../types/rutograma.types'; // Importar el tipo refactorizado

const TravelSegment: React.FC<TravelSegmentProps> = ({
  config,
  horario,
  contacto,
  transporte,
  viaje,
  actividad,
  ruta,
  global
}) => {
  const {
    mainTitle,
    transportTitle,
    transportHint,
    departureTimeLabel,
    travelSubtitle,
    actividadPreguntaLabel,
    rutaTitulo,
    rutaPlaceholder,
    includeSchedule,
    includeContact
  } = config;

  return (
    <div id='travel-segment' style={{ background: '#fff', borderRadius: '18px', boxShadow: '0 6px 24px rgba(0,0,0,0.10)', padding: '2rem 1.75rem', marginBottom: '2rem', maxWidth: 1000, margin: '0 auto', overflow: 'hidden' }}>
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
                    value={horario?.horarioTrabajoDesde} 
                    onChange={horario?.setHorarioTrabajoDesde} 
                    ampm 
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} 
                  />
                  <span style={{ fontWeight: 500, color: '#003f9e' }}>-</span>
                  <TimePicker 
                    label="Hasta" 
                    value={horario?.horarioTrabajoHasta} 
                    onChange={horario?.setHorarioTrabajoHasta} 
                    ampm 
                    viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} 
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
                selected={transporte.tipoTransporteSeleccionado}
                onChange={(ids) => transporte.setTipoTransporteSeleccionado(ids.map(Number))}
              />
              <div
                className={style.transportOther}
                style={{
                  width: '50%',
                  maxHeight: transporte.tipoTransporteSeleccionado.includes(8) ? 120 : 0,
                  opacity: transporte.tipoTransporteSeleccionado.includes(8) ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.35s ease-out, opacity 0.25s ease-out',
                  marginTop: transporte.tipoTransporteSeleccionado.includes(8) ? 0 : -20,
                  pointerEvents: transporte.tipoTransporteSeleccionado.includes(8) ? 'auto' : 'none',
                  position: 'relative',
                  zIndex: 2,
                }}
              >
                <Form.Label style={{ fontWeight: 500, color: '#495057' }}>¿Cuál medio de transporte?</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Especifique el medio de transporte"
                  value={transporte.medioTransporteOtro}
                  onChange={(e) => transporte.setMedioTransporteOtro(e.target.value)}
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
                      value={horario?.horaSalida} 
                      onChange={horario?.setHoraSalida} 
                      ampm 
                      viewRenderers={{ hours: renderTimeViewClock, minutes: renderTimeViewClock }} 
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
                      value={contacto.nombreReferencia} 
                      onChange={(e)=> contacto.setNombreReferencia(e.target.value)} 
                    />
                  </FloatingLabel>
                  <br/>
                  <FloatingLabel label="Teléfono de contacto" >
                    <Form.Control 
                      type="text" 
                      placeholder="Teléfono de contacto" 
                      value={contacto.telefonoReferencia} 
                      onChange={(e)=> contacto.setTelefonoReferencia(e.target.value)} 
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
                  ].find(opt => opt.value === viaje.tiempoViaje) || null}
                  onChange={opt => viaje.setTiempoViaje(opt ? opt.value : null)}
                  placeholder="Seleccione el tiempo de viaje"
                  isClearable
                  styles={{ container: base => ({ ...base, minWidth: 220, maxWidth: 300 , color:'black'}) }}
                />
              </div>
              <div className={style.travelQuestionItem}>
                <label className={style.travelLabel}>¿Hace escalas? <span style={{color:'#dc3545'}}>*</span></label>
                <FormControlLabel 
                  control={<Checkbox checked={viaje.haceEscalas === true} onChange={() => viaje.setHaceEscalas(true)} color='primary' />} 
                  label='Sí' 
                  className={style.travelCheckLabel} 
                />
                <FormControlLabel 
                  control={<Checkbox checked={viaje.haceEscalas === false} onChange={() => viaje.setHaceEscalas(false)} color='primary' />} 
                  label='No' 
                  className={style.travelCheckLabel} 
                />
              </div>
              {viaje.haceEscalas === true && (
                <div className={style.travelQuestionItem}>
                <label className={style.travelLabel}>Número de escalas <span style={{color:'#dc3545'}}>*</span></label>
                {[1, 2, 3].map(num => (
                  <FormControlLabel 
                  key={num} 
                  control={<Checkbox checked={viaje.numEscalas === num} onChange={() => viaje.setNumEscalas(num)} color='primary' />} 
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
            rutas={ruta.rutas}
            setRutas={ruta.setRutas}
            placeholder={rutaPlaceholder}
            styleModule={style}
          />
        </Col>

        {/* Actividades */}
        <Col md={12} className={style.mb24}>
          <div className={style.routeBox}>
            <label className={style.travelLabel}>{actividadPreguntaLabel} <span style={{color:'#dc3545'}}>*</span></label>
            <FormControlLabel 
              control={<Checkbox checked={actividad.haceActividadAntes === true} onChange={() => actividad.setHaceActividadAntes(true)} color='primary' />} 
              label='Sí' 
              className={style.travelCheckLabel} 
            />
            <FormControlLabel 
              control={<Checkbox checked={actividad.haceActividadAntes === false} onChange={() => actividad.setHaceActividadAntes(false)} color='primary' />} 
              label='No' 
              className={style.travelCheckLabel} 
            />
            <Collapse in={actividad.haceActividadAntes === true}>
              <div style={{ marginTop: 16, color:'#495057', borderRadius: 10, padding: 20 }}>
                <h5>¿Qué tipo de actividades?</h5>
                <CheckboxTileGroup 
                  options={global.tiposActividad.map(a => ({ ...a, label: a.nombre }))} 
                  selected={actividad.actividadesSeleccionadas} 
                  onChange={(ids)=> actividad.setActividadesSeleccionadas(ids.map(Number))} 
                />
                {actividad.actividadesSeleccionadas.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    {actividad.actividadesSeleccionadas.map(id => {
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
                                      value={actividad.detallesActividades[id]?.otro || ''} 
                                      onChange={e => actividad.setDetallesActividades({ 
                                        ...actividad.detallesActividades, 
                                        [id]: { 
                                          ...(actividad.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                          otro: e.target.value 
                                        } 
      
                                      },)} 
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
                                    value={actividad.detallesActividades[id]?.ubicacion || ''} 
                                    onChange={e => actividad.setDetallesActividades({ 
                                      ...actividad.detallesActividades, 
                                      [id]: { 
                                        ...(actividad.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                        ubicacion: e.target.value 
                                      } 
                                    })} 
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Tiempo aproximado</Form.Label>
                                  <Form.Control 
                                    type="text" 
                                    placeholder="Ej: 30 minutos" 
                                    value={actividad.detallesActividades[id]?.tiempo || ''} 
                                    onChange={e => actividad.setDetallesActividades({ 
                                      ...actividad.detallesActividades, 
                                      [id]: { 
                                        ...(actividad.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                        tiempo: e.target.value 
                                      } 
                                    })} 
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Descripción de la actividad</Form.Label>
                                  <Form.Control 
                                    as="textarea" 
                                    placeholder="Descripción de la actividad" 
                                    value={actividad.detallesActividades[id]?.descripcion || ''} 
                                    onChange={e => actividad.setDetallesActividades({ 
                                      ...actividad.detallesActividades, 
                                      [id]: { 
                                        ...(actividad.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }), 
                                        descripcion: e.target.value 
                                      } 
                                    })} 
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={6}>
                                <Form.Group>
                                  <Form.Label>Frecuencia</Form.Label>
                                  <Form.Select
                                    value={actividad.detallesActividades[id]?.frecuencia || ''}
                                    onChange={e => actividad.setDetallesActividades({
                                      ...actividad.detallesActividades,
                                      [id]: {
                                        ...(actividad.detallesActividades[id] || { ubicacion: '', tiempo: '', frecuencia: '', descripcion: '' }),
                                        frecuencia: e.target.value
                                      }
                                    })}
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
