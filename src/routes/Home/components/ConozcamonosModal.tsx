import React from 'react';
import { Modal, Carousel } from 'react-bootstrap';



// Importamos todas las imágenes de la carpeta
import Diapositiva1 from '@/assets/Conozcamonos/Diapositiva1.webp';
import Diapositiva2 from '@/assets/Conozcamonos/Diapositiva2.webp';
import Diapositiva3 from '@/assets/Conozcamonos/Diapositiva3.webp';
import Diapositiva4 from '@/assets/Conozcamonos/Diapositiva4.webp';
import Diapositiva5 from '@/assets/Conozcamonos/Diapositiva5.webp';
import Diapositiva18 from '@/assets/Conozcamonos/Diapositiva18.webp';
import Diapositiva6 from '@/assets/Conozcamonos/Diapositiva6.webp';
import Diapositiva7 from '@/assets/Conozcamonos/Diapositiva7.webp';
import Diapositiva8 from '@/assets/Conozcamonos/Diapositiva8.webp';
import Diapositiva9 from '@/assets/Conozcamonos/Diapositiva9.webp';
import Diapositiva10 from '@/assets/Conozcamonos/Diapositiva10.webp';
import Diapositiva11 from '@/assets/Conozcamonos/Diapositiva11.webp';
import Diapositiva12 from '@/assets/Conozcamonos/Diapositiva12.webp';
import Diapositiva13 from '@/assets/Conozcamonos/Diapositiva13.webp';
import Diapositiva14 from '@/assets/Conozcamonos/Diapositiva14.webp';
import Diapositiva15 from '@/assets/Conozcamonos/Diapositiva15.webp';
import Diapositiva16 from '@/assets/Conozcamonos/Diapositiva16.webp';
import Diapositiva17 from '@/assets/Conozcamonos/Diapositiva17.webp';

// Creamos un array con las imágenes importadas
const images = [
  Diapositiva1, Diapositiva2, Diapositiva3, Diapositiva4, Diapositiva5,
  Diapositiva18, Diapositiva6, Diapositiva7, Diapositiva8, Diapositiva9, Diapositiva10,
  Diapositiva11, Diapositiva12, Diapositiva13, Diapositiva14, Diapositiva15,
  Diapositiva16, Diapositiva17
];

interface ConozcamonosModalProps {
  show: boolean;
  onHide: () => void;
}

const ConozcamonosModal: React.FC<ConozcamonosModalProps> = ({ show, onHide }) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="xl"
      fullscreen={window.innerWidth < 992 ? true : undefined}
      style={{
        height: window.innerWidth < 992 ? '100vh' : '100%',
        maxHeight: window.innerWidth < 992 ? '640px' : 'none',
        marginLeft: window.innerWidth < 992 ? '5%' : undefined
      }}

    >
      <>
        <Modal.Header closeButton style={{ backgroundColor: '#003391', color: 'white' }}>
          <Modal.Title>Nuestro Equipo</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: 0 }}>
          <Carousel style={{ marginTop: 0 }}>
            {images.map((image, index) => (
              <Carousel.Item key={index} style={{ marginTop: 0 }}>
                <img
                  src={image}
                  alt={`Diapositiva ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain'
                  }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Modal.Body>
      </>
    </Modal>
  );
};

export default ConozcamonosModal;