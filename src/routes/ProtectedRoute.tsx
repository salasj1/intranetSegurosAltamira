import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import styles from '../css/loading.module.css';
import { Mosaic } from "react-loading-indicators";
const ProtectedRoute = () => {
    const auth = useAuth();

    if (auth.isAuthenticated === undefined) {
        return <div className={styles.loadingContainer}><Mosaic  color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" /></div>; // O cualquier componente de carga
    }
    

    return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;