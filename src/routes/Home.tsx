import Carrusel from "../components/Carrusel"
import NavbarEmpresa from "../components/NavbarEmpresa"
import BlurText from "../components/react-bits/BlurText";
import SplitText from "../components/react-bits/SplitText";

function Home() {
  const handleAnimationComplete = () => {
    console.log('Animation completed!');
  };
  return (
    <><NavbarEmpresa />
    <Carrusel /></>
  )
}

export default Home