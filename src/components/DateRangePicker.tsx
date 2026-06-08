import React, { useRef, useState, useEffect } from 'react';
import { format, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DateRange } from 'react-day-picker';
import { Calendar } from './ui/calendar';
import { CalendarIcon, X } from 'lucide-react';

interface DateRangePickerProps {
  label: string;
  fromDate: Date | null;
  toDate:   Date | null;
  onRangeChange: (from: Date | null, to: Date | null) => void;
}

/* Auto-formatea dígitos como dd/MM/yyyy mientras el usuario escribe */
function autoFormat(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function parseDate(str: string): Date | null {
  if (str.length !== 10) return null;
  const parsed = parse(str, 'dd/MM/yyyy', new Date());
  return isValid(parsed) ? parsed : null;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  label, fromDate, toDate, onRangeChange,
}) => {
  const [isOpen, setIsOpen]     = useState(false);
  const [inputFrom, setInputFrom] = useState('');
  const [inputTo,   setInputTo]   = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  /* Sincroniza los inputs cuando cambian las fechas externamente (Limpiar filtros) */
  useEffect(() => {
    setInputFrom(fromDate ? format(fromDate, 'dd/MM/yyyy') : '');
    setInputTo  (toDate   ? format(toDate,   'dd/MM/yyyy') : '');
  }, [fromDate, toDate]);

  /* Cierra el popup al hacer clic fuera */
  useEffect(() => {
    const onOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', onOutside);
    return ()  => document.removeEventListener('mousedown', onOutside);
  }, [isOpen]);

  const handleFromChange = (raw: string) => {
    const v = autoFormat(raw);
    setInputFrom(v);
    const d = parseDate(v);
    if (d) onRangeChange(d, toDate);
    else if (v === '') onRangeChange(null, toDate);
  };

  const handleToChange = (raw: string) => {
    const v = autoFormat(raw);
    setInputTo(v);
    const d = parseDate(v);
    if (d) onRangeChange(fromDate, d);
    else if (v === '') onRangeChange(fromDate, null);
  };

  const handleCalendarSelect = (range: DateRange | undefined) => {
    onRangeChange(range?.from ?? null, range?.to ?? null);
  };

  const handleClear = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    onRangeChange(null, null);
  };

  const hasValue   = !!(fromDate || toDate);
  const isFromBad  = inputFrom.length > 0 && inputFrom.length < 10;
  const isToBad    = inputTo.length   > 0 && inputTo.length   < 10;

  return (
    <div ref={containerRef} className="drp-wrapper">
      {/* ── Etiqueta ── */}
      <span className="drp-label">{label}</span>

      {/* ── Input row ── */}
      <div
        className={`drp-input-row${hasValue ? ' drp-input-row--active' : ''}${isOpen ? ' drp-input-row--open' : ''}`}
      >
        <div className="drp-input-wrapper">
          <span className="drp-ghost" aria-hidden="true">
            <span style={{ color: 'transparent' }}>{inputFrom}</span>
            {'dd/MM/yyyy'.slice(inputFrom.length)}
          </span>
          <input
            type="text"
            value={inputFrom}
            maxLength={10}
            onChange={e => handleFromChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={`drp-date-input${isFromBad ? ' drp-date-input--error' : ''}`}
            aria-label={`${label} desde`}
          />
        </div>
        <span className="drp-separator">—</span>
        <div className="drp-input-wrapper">
          <span className="drp-ghost" aria-hidden="true">
            <span style={{ color: 'transparent' }}>{inputTo}</span>
            {'dd/MM/yyyy'.slice(inputTo.length)}
          </span>
          <input
            type="text"
            value={inputTo}
            maxLength={10}
            onChange={e => handleToChange(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={`drp-date-input${isToBad ? ' drp-date-input--error' : ''}`}
            aria-label={`${label} hasta`}
          />
        </div>

        <div className="drp-actions">
          {hasValue && (
            <button
              type="button"
              className="drp-btn-clear"
              onClick={handleClear}
              title="Limpiar"
            >
              <X size={13} />
            </button>
          )}
          <button
            type="button"
            className={`drp-btn-cal${isOpen ? ' drp-btn-cal--open' : ''}`}
            onClick={() => setIsOpen(p => !p)}
            title="Abrir calendario"
          >
            <CalendarIcon size={15} />
          </button>
        </div>
      </div>

      {/* ── Popup calendario ── */}
      {isOpen && (
        <div className="drp-popup">
          <Calendar
            mode="range"
            selected={
              fromDate || toDate
                ? { from: fromDate ?? undefined, to: toDate ?? undefined }
                : undefined
            }
            onSelect={handleCalendarSelect}
            locale={es}
            numberOfMonths={1}
            captionLayout="dropdown"
            startMonth={new Date(2015, 0)}
            endMonth={new Date(2035, 11)}
          />
          <div className="drp-popup-footer">
            <button
              type="button"
              className="drp-popup-btn drp-popup-btn--ghost"
              onClick={handleClear}
            >
              Limpiar
            </button>
            <button
              type="button"
              className="drp-popup-btn drp-popup-btn--primary"
              onClick={() => setIsOpen(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {/* ── Estilos encapsulados ── */}
      <style>{`
        .drp-wrapper {
          position: relative;
          display: inline-flex;
          flex-direction: column;
          gap: 3px;
        }

        .drp-label {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        /* ── Fila de inputs ── */
        .drp-input-row {
          display: flex;
          align-items: center;
          border: 1.5px solid #cbd5e1;
          border-radius: 8px;
          background: #fff;
          transition: border-color 0.15s, box-shadow 0.15s;
          overflow: hidden;
        }
        .drp-input-row:focus-within,
        .drp-input-row--open {
          border-color: #003391;
          box-shadow: 0 0 0 3px rgba(0, 51, 145, 0.12);
        }
        .drp-input-row--active {
          border-color: #003391;
        }

        .drp-input-wrapper {
          position: relative;
          display: inline-flex;
          align-items: stretch;
        }

        .drp-ghost {
          position: absolute;
          top: 0; left: 0;
          padding: 6px 6px 6px 10px;
          width: 98px;
          font-family: 'Courier New', monospace;
          font-size: 0.82rem;
          letter-spacing: 0.04em;
          pointer-events: none;
          user-select: none;
          white-space: pre;
          color: #94a3b8;
          display: flex;
          align-items: center;
          box-sizing: border-box;
          height: 100%;
        }

        .drp-date-input {
          border: none;
          outline: none;
          padding: 6px 6px 6px 10px;
          width: 98px;
          font-size: 0.82rem;
          color: #1e293b;
          background: transparent;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.04em;
          position: relative;
          z-index: 1;
        }
        .drp-date-input--error { color: #ef4444; }

        .drp-separator {
          color: #94a3b8;
          font-size: 0.9rem;
          flex-shrink: 0;
          user-select: none;
        }

        .drp-actions {
          display: flex;
          align-items: center;
          padding: 0 4px 0 2px;
          gap: 1px;
        }

        .drp-btn-clear {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          border-radius: 5px;
          transition: background 0.1s, color 0.1s;
        }
        .drp-btn-clear:hover { background: #f1f5f9; color: #ef4444; }

        .drp-btn-cal {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          border-radius: 5px;
          transition: background 0.12s, color 0.12s;
        }
        .drp-btn-cal:hover       { background: #f1f5f9; color: #003391; }
        .drp-btn-cal--open       { background: #003391; color: #fff; }
        .drp-btn-cal--open:hover { background: #002278; }

        /* ── Popup ── */
        .drp-popup {
          position: absolute;
          top: calc(100% + 6px);
          left: 0;
          z-index: 1060;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06);
          padding: 14px 14px 10px;
          min-width: 272px;
          animation: drp-fade-in 0.12s ease-out;
        }

        @keyframes drp-fade-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .drp-popup-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #f1f5f9;
        }

        .drp-popup-btn {
          border: none;
          border-radius: 7px;
          padding: 6px 16px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
          font-family: inherit;
        }
        .drp-popup-btn--ghost {
          background: transparent;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }
        .drp-popup-btn--ghost:hover  { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
        .drp-popup-btn--primary      { background: #003391; color: #fff; }
        .drp-popup-btn--primary:hover{ background: #002278; }
      `}</style>
    </div>
  );
};

export default DateRangePicker;
