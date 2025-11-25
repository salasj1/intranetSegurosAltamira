import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const ErrorPhase = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', marginTop: '50px' }}>
      <div style={{ width: '50vw', height: '50vh' }}>
        <DotLottieReact
            src="https://lottie.host/c492f6d1-0b3d-492e-b85e-f27c94c16b45/WhS8y9jUDi.json"
            loop
            autoplay
        />
      </div>
      <h3 style={{ marginTop: '5px', color: '#555' }}>
        Fallo de sistema, vuélvelo a hacer más tarde
      </h3>
    </div>
  );
};

export default ErrorPhase;