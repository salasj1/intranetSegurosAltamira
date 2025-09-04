import React from 'react';
import { Button, Form} from 'react-bootstrap';
import {FaRegTrashAlt } from 'react-icons/fa';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

// Sub-componente reutilizable para bloques de rutas
type RutaHabitualSectionProps = {
  titulo: string;
  rutas: string[];
  setRutas: React.Dispatch<React.SetStateAction<string[]>>;
  placeholder: string;
  maxRutas?: number;
  addLabel?: string;
  clearLabel?: string;
  styleModule: any;
};

const RutaHabitualSection: React.FC<RutaHabitualSectionProps> = ({
  titulo,
  rutas,
  setRutas,
  placeholder,
  maxRutas = 2,
  addLabel = 'Agregar ruta alternativa',
  clearLabel = 'Borrar todas las rutas',
  styleModule,
}) => {
  const handleChange = (index: number, value: string) => {
    setRutas(prev => {
      const clone = [...prev];
      clone[index] = value;
      return clone;
    });
  };
  const handleAdd = () => {
    setRutas(prev => (prev.length < maxRutas ? [...prev, ''] : prev));
  };
  const handleClear = () => {
    setRutas(['']);
  };
  const handleRemove = (index: number) => {
    setRutas(prev => prev.filter((_, i) => i !== index));
  };
  return (
    <div className={styleModule.routeBox} >
      <h5 className={styleModule.routeTitle}>{titulo}<span style={{ color: '#dc3545' }}>*</span></h5>
      <TransitionGroup>
        {(rutas || []).map((item, index) => {
          const rowRef = React.createRef<HTMLDivElement>();
          return (
            <CSSTransition
              key={index}
              nodeRef={rowRef}
              timeout={350}
              classNames={{
                enter: styleModule['textarea-anim-enter'],
                enterActive: styleModule['textarea-anim-enter-active'],
                exit: styleModule['textarea-anim-exit'],
                exitActive: styleModule['textarea-anim-exit-active'],
              }}
            >
              <div ref={rowRef} className={styleModule.routeInputRow}>
                <Form.Control
                  as="textarea"
                  className={styleModule['animated-textarea']}
                  placeholder={placeholder}
                  value={item}
                  onChange={(e) => handleChange(index, e.target.value)}
                  rows={3}
                />
                {rutas.length > 1 && (
                  <Button variant="danger" onClick={() => handleRemove(index)}>
                    <FaRegTrashAlt />
                  </Button>
                )}
              </div>
            </CSSTransition>
          );
        })}
      </TransitionGroup>
      <div className={styleModule.routeActionsRow}>
        <Button variant="secondary" onClick={handleAdd} disabled={rutas.length >= maxRutas}>
          {addLabel}
        </Button>
        <Button variant="danger" onClick={handleClear} style={{ marginLeft: '10px' }}>
          {clearLabel}
        </Button>
      </div>
    </div>
  );
};

export default RutaHabitualSection;