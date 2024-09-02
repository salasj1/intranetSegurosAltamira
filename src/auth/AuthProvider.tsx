import { useContext, createContext, useState, useEffect } from "react";
import axios from 'axios';
import NavbarEmpresa from "../components/NavbarEmpresa";

interface AuthContextType {
    isAuthenticated: boolean;
    nombre_completo: string | null;
    cargo_empleado: string | null;
    cod_emp: string | null; 
    fecha_ing: string | null;
    des_depart: string | null;
    login: (usuario: string, password: string) => Promise<boolean | undefined>;
    signup: (email: string, usuario: string, password: string, confirmPassword: string) => Promise<string | boolean | undefined>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    nombre_completo: null,
    cargo_empleado: null,
    cod_emp: null, 
    fecha_ing: null,
    des_depart: null,
    login: async () => false,
    signup: async () => false,
    logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [nombre_completo, setNombreCompleto] = useState<string | null>(null);
    const [cargo_empleado, setCargoEmpleado] = useState<string | null>(null);
    const [cod_emp, setCodEmp] = useState<string | null>(null);
    const [fecha_ing, setFechaIng] = useState<string | null>(null); 
    const [des_depart, setDesDepart] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedNombreCompleto = localStorage.getItem('nombre_completo');
        const storedCargoEmpleado = localStorage.getItem('cargo_empleado');
        const storedCodEmp = localStorage.getItem('cod_emp');
        const storedFechaIng = localStorage.getItem('fecha_ing');
        const storedDesDepart = localStorage.getItem('des_depart');
        if (storedToken && storedNombreCompleto && storedCargoEmpleado && storedCodEmp && storedFechaIng && storedDesDepart) {
            setIsAuthenticated(true);
            setNombreCompleto(storedNombreCompleto);
            setCargoEmpleado(storedCargoEmpleado);
            setCodEmp(storedCodEmp); 
            setFechaIng(storedFechaIng);
            setDesDepart(storedDesDepart);
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
                setCodEmp(response.data.cod_emp);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('nombre_completo', response.data.nombre_completo);
                localStorage.setItem('cargo_empleado', response.data.des_cargo);
                localStorage.setItem('cod_emp', response.data.cod_emp);
                console.log(response.data.fecha_ing);
                localStorage.setItem('fecha_ing', response.data.fecha_ing);
                localStorage.setItem('des_depart', response.data.des_depart);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error during login:', error);
            return false;
        }
    };

    const signup = async (email: string, usuario: string, password: string, confirmPassword: string): Promise<string | true> => {
        try {
            const response = await axios.post('/api/signup', { email, username: usuario, password, confirmPassword });
            if (response.data.success) {
                setIsAuthenticated(true);
                setNombreCompleto(response.data.nombre_completo);
                setCargoEmpleado(response.data.des_cargo);
                setCodEmp(response.data.cod_emp);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('nombre_completo', response.data.nombre_completo);
                localStorage.setItem('cargo_empleado', response.data.des_cargo);
                localStorage.setItem('cod_emp', response.data.cod_emp);
                localStorage.setItem('fecha_ing', response.data.fecha_ing);
                localStorage.setItem('des_depart', response.data.des_depart);
                return true;
            } else {
                return response.data.message || 'Error desconocido'; // Devolver el mensaje de error del servidor o un mensaje por defecto
            }
        } catch (error) {
            console.error('Error during signup:', error);
            return 'Error en el registro';
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setNombreCompleto(null);
        setCargoEmpleado(null);
        setCodEmp(null);
        localStorage.removeItem('token');
        localStorage.removeItem('nombre_completo');
        localStorage.removeItem('cargo_empleado');
        localStorage.removeItem('cod_emp');
        localStorage.removeItem('fecha_ing');
        localStorage.removeItem('des_depart');
    };

    if (loading) {
        return <>
        <NavbarEmpresa/>
        </>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, nombre_completo, cargo_empleado, cod_emp, fecha_ing ,des_depart, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};