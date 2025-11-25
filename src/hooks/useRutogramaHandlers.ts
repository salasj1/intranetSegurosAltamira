import { useCallback } from "react";

interface UseRutogramaHandlersProps {
  ruta: string[];
  setRuta: (v: string[]) => void;
  actividadesSeleccionadas: number[];
  setActividadesSeleccionadas: (ids: number[]) => void;
  detallesActividades: any;
  setDetallesActividades: (v: any) => void;
}

export function useRutogramaHandlers({
  ruta,
  setRuta,
  actividadesSeleccionadas,
  setActividadesSeleccionadas,
  detallesActividades,
  setDetallesActividades,
}: UseRutogramaHandlersProps) {
  // Manejo de inputs de ruta
  const handleRutaChange = useCallback(
    (index: number, value: string) => {
      const nuevaRuta = [...ruta];
      nuevaRuta[index] = value;
      setRuta(nuevaRuta);
    },
    [ruta, setRuta]
  );

  const addRutaInput = useCallback(() => {
    setRuta([...ruta, ""]);
  }, [ruta, setRuta]);

  const clearRutaInputs = useCallback(() => {
    setRuta([""]);
  }, [setRuta]);

  const removeRutaInput = useCallback(
    (index: number) => {
      const nuevaRuta = ruta.filter((_, i) => i !== index);
      setRuta(nuevaRuta.length > 0 ? nuevaRuta : [""]);
    },
    [ruta, setRuta]
  );

  // Manejo de actividades
  const handleActividadesChange = useCallback(
    (ids: number[]) => {
      setActividadesSeleccionadas(ids);
      // Opcional: limpiar detalles de actividades no seleccionadas
      const nuevosDetalles = { ...detallesActividades };
      Object.keys(nuevosDetalles).forEach((id) => {
        if (!ids.includes(Number(id))) {
          delete nuevosDetalles[id];
        }
      });
      setDetallesActividades(nuevosDetalles);
    },
    [setActividadesSeleccionadas, detallesActividades, setDetallesActividades]
  );

  const handleDetalleActividad = useCallback(
    (id: number, field: string, value: string) => {
      setDetallesActividades({
        ...detallesActividades,
        [id]: {
          ...detallesActividades[id],
          [field]: value,
        },
      });
    },
    [detallesActividades, setDetallesActividades]
  );

  return {
    handleRutaChange,
    addRutaInput,
    clearRutaInputs,
    removeRutaInput,
    handleActividadesChange,
    handleDetalleActividad,
  };
}
