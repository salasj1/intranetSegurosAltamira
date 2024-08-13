import { useContext, createContext, useState, useEffect } from "react";
import axios from 'axios';

interface AuthContextType {
    isAuthenticated: boolean;
    nombre_completo: string | null;
    cargo_empleado: string | null;
    login: (usuario: string, password: string) => Promise<boolean | undefined>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    nombre_completo: null,
    cargo_empleado: null,
    login: async () => false,
    logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [nombre_completo, setNombreCompleto] = useState<string | null>(null);
    const [cargo_empleado, setCargoEmpleado] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedNombreCompleto = localStorage.getItem('nombre_completo');
        const storedCargoEmpleado = localStorage.getItem('cargo_empleado');

        if (storedToken && storedNombreCompleto && storedCargoEmpleado) {
            setIsAuthenticated(true);
            setNombreCompleto(storedNombreCompleto);
            setCargoEmpleado(storedCargoEmpleado);
        }
        setLoading(false);
    }, []);

    const login = async (usuario: string, password: string) => {
        try {
            const response = await axios.post('/api/login', { username: usuario, password });
            if (response.data.success) {
                setIsAuthenticated(true);
                setNombreCompleto(response.data.nombre_completo);
                setCargoEmpleado(response.data.des_cargo);
                localStorage.setItem('token', 'dummy-token'); 
                localStorage.setItem('nombre_completo', response.data.nombre_completo);
                localStorage.setItem('cargo_empleado', response.data.des_cargo);
                return true;
            }
        } catch (error) {
            console.error('Error during authentication', error);
            setIsAuthenticated(false);
            return false;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setNombreCompleto(null);
        setCargoEmpleado(null);
        localStorage.removeItem('token');
        localStorage.removeItem('nombre_completo');
        localStorage.removeItem('cargo_empleado');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, nombre_completo, cargo_empleado, login, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};