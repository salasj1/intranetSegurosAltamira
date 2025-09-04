import React from 'react';
import styled from 'styled-components';

interface CheckboxOption {
  id: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface CheckboxTileGroupProps {
  options: CheckboxOption[];
  selected: Array<string | number>;
  onChange: (selected: Array<string | number>) => void;
}

const CheckboxTileGroup: React.FC<CheckboxTileGroupProps> = ({ options, selected, onChange }) => {
  const handleToggle = (id: string | number) => {
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <StyledWrapper>
      <div className="checkbox-wrapper-16" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {options.map((option) => (
          <label className="checkbox-wrapper" key={option.id}>
            <input
              className="checkbox-input"
              type="checkbox"
              checked={selected.includes(option.id)}
              onChange={() => handleToggle(option.id)}
            />
            <span className="checkbox-tile">
              <span className="checkbox-icon">{option.icon}</span>
              <span className="checkbox-label">{option.label}</span>
            </span>
          </label>
        ))}
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .checkbox-wrapper-16 *,
    .checkbox-wrapper-16 *:after,
    .checkbox-wrapper-16 *:before {
    box-sizing: border-box;
  }

  .checkbox-wrapper-16 .checkbox-input {
    clip: rect(0 0 0 0);
    -webkit-clip-path: inset(100%);
    clip-path: inset(100%);
    height: 1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  }

  .checkbox-wrapper-16 .checkbox-input:checked + .checkbox-tile {
    border-color: #2260ff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    color: #2260ff;
  }

  .checkbox-wrapper-16 .checkbox-input:checked + .checkbox-tile:before {
    transform: scale(1);
    opacity: 1;
    background-color: #2260ff;
    border-color: #2260ff;
    background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='10' cy='10' r='10' fill='%232260ff'/%3E%3Cpath d='M6 10.5L9 13.5L14 8.5' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-position: center;
    content: "";
  }

  .checkbox-wrapper-16 .checkbox-input:checked + .checkbox-tile .checkbox-icon,
    .checkbox-wrapper-16 .checkbox-input:checked + .checkbox-tile .checkbox-label {
    color: #2260ff;
  }

  .checkbox-wrapper-16 .checkbox-input:focus + .checkbox-tile {
    border-color: #2260ff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1), 0 0 0 4px #b5c9fc;
  }

  .checkbox-wrapper-16 .checkbox-input:focus + .checkbox-tile:before {
    transform: scale(1);
    opacity: 1;
  }

  .checkbox-wrapper-16 .checkbox-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 7rem;
    min-height: 7rem;
    border-radius: 0.5rem;
    border: 2px solid #b5bfd9;
    background-color: #fff;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.1);
    transition: 0.15s ease;
    cursor: pointer;
    position: relative;
  }

  .checkbox-wrapper-16 .checkbox-tile:before {
    content: "";
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.2rem;
    height: 1.2rem;
    border: 2px solid #b5bfd9;
    background-color: #fff;
    border-radius: 50%;
    top: 0.25rem;
    left: 0.25rem;
    opacity: 0;
    transform: scale(0);
    transition: 0.25s ease;
    background: none;
  }

  .checkbox-wrapper-16 .checkbox-tile:hover {
    border-color: #2260ff;
  }

  .checkbox-wrapper-16 .checkbox-tile:hover:before {
    transform: scale(1);
    opacity: 1;
  }

  .checkbox-wrapper-16 .checkbox-icon {
    transition: 0.375s ease;
    color: #494949;
  }

  .checkbox-wrapper-16 .checkbox-icon svg {
    width: 3rem;
    height: 3rem;
  }

  .checkbox-wrapper-16 .checkbox-label {
    color: #707070;
    transition: 0.375s ease;
    text-align: center;
  }
`;

export default CheckboxTileGroup;
