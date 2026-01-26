import { useEffect } from "react";
import { Mosaic } from "react-loading-indicators";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import styles from '../css/loading.module.css';

// Lista de rutas válidas
const rutasValidas = [
    "/home",
    "/RecibodePago",
    "/RecibodePagoDetallado",
    "/Prestaciones",
    "/ConstanciaDeTrabajo",
    "/ARC",
    "/PrestacionesDetallado",
    "/SolicitarVacaciones",
    "/AprobarVacaciones",
    "/ProcesarVacaciones",
    "/RetornoVacaciones",
    "/SolicitarPermisos",
    "/AprobarPermisos",
    "/ProcesarPermisos",
    "/DirectorioEmpleados",
    "/ControlSupervision",
    "Expediente",
    "/GestionExpedientes",
];

const ProtectedRoute = () => {
    const auth = useAuth();
    const location = useLocation();

    // Guardar la última ruta válida en localStorage
    useEffect(() => {
        const rutaBase = "/" + location.pathname.split("/")[1];
        if (rutasValidas.includes(rutaBase)) {
            localStorage.setItem("lastValidPath", location.pathname);
        }
    }, [location]);

    // Bloquear acceso a /Admin si no es admin
    const normalizedPath = location.pathname.toLowerCase();
    if (
        normalizedPath.startsWith("/admin") &&
        auth.isAuthenticated &&
        !auth.isAdmin
    ) {
        const lastValidPath = localStorage.getItem("lastValidPath") || "/home";
        return <Navigate to={lastValidPath} replace />;
    }

    if (auth.isAuthenticated === undefined) {
        return (
            <div className={styles.loadingContainer}>
                <Mosaic color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
            </div>
        );
    }

    return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;