import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const ProtectedRoute = () => {
    const auth = useAuth();
    console.log("VERIFICACION" + auth.isAuthenticated);

    if (auth.isAuthenticated === undefined) {
        return <div>Loading...</div>; // O cualquier componente de carga
    }

    return auth.isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;