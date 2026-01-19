import { useContext, createContext, useState, useEffect } from "react";
import axios, { AxiosError } from 'axios';
import { Mosaic } from "react-loading-indicators";
import styles from '../css/loading.module.css';
const apiUrl = import.meta.env.VITE_API_URL;
interface AuthContextType {
    isAuthenticated: boolean;
    nombres: string | '';
    apellidos: string | '';
    nombre_completo: string | null;
    sexo: string | '';
    cargo_empleado: string | null;
    cod_emp: string ; 
    fecha_ing: string | null;
    des_depart: string | null;
    tipo: string | null;
    RRHH: number | null;
    canApproveVacations: boolean; 
    canApprovePermits: boolean;   
    email: string  | '';
    isAdmin: boolean;
    login: (usuario: string, password: string) => Promise<boolean | undefined>;
    signup: (email: string, usuario: string, password: string, confirmPassword: string) => Promise<string | boolean | undefined>;
    logout: () => void;
    revalidateUserStatus: () => Promise<void>; // Añade la nueva función al tipo
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    nombre_completo: null,
    cargo_empleado: null,
    nombres: '',
    apellidos: '',
    sexo: '',
    cod_emp: '',
    fecha_ing: null,
    des_depart: null,
    tipo: null,
    RRHH: null,
    canApproveVacations: false, // Valor por defecto
    canApprovePermits: false,   // Valor por defecto
    email: '',
    isAdmin: false,
    login: async () => false,
    signup: async () => false,
    logout: () => {},
    revalidateUserStatus: async () => {} // Proporciona una implementación predeterminada
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [nombres, setNombres] = useState<string | ''>('');
    const [apellidos, setApellidos] = useState<string | ''>('');
    const [nombre_completo, setNombreCompleto] = useState<string | null>(null);
    const [sexo, setSexo] = useState<string | ''>('');
    const [cargo_empleado, setCargoEmpleado] = useState<string | null>(null);
    const [cod_emp, setCodEmp] = useState<string | ''>(localStorage.getItem('cod_emp') || '');
    const [fecha_ing, setFechaIng] = useState<string | null>(null);
    const [des_depart, setDesDepart] = useState<string | null>(null);
    const [tipo, setTipo] = useState<string | null>(sessionStorage.getItem('tipo'));
    const [RRHH, setRRHH] = useState<number | null>(Number(localStorage.getItem('RRHH')));
    const [canApproveVacations, setCanApproveVacations] = useState<boolean>(localStorage.getItem('canApproveVacations') === 'true');
    const [canApprovePermits, setCanApprovePermits] = useState<boolean>(localStorage.getItem('canApprovePermits') === 'true');
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string | ''>('');
    const [isAdmin, setIsAdmin] = useState(false);
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedNombres = localStorage.getItem('nombres');
        const storedApellidos = localStorage.getItem('apellidos');
        const storedNombreCompleto = localStorage.getItem('nombre_completo');
        const storedCargoEmpleado = localStorage.getItem('cargo_empleado');
        const storedCodEmp = localStorage.getItem('cod_emp');
        const storedFechaIng = localStorage.getItem('fecha_ing');
        const storedDesDepart = localStorage.getItem('des_depart');
        const storedTipo = sessionStorage.getItem('tipo');
        const storedRRHH = localStorage.getItem('RRHH');
        const storedCanApproveVacations = localStorage.getItem('canApproveVacations') === 'true';
        const storedCanApprovePermits = localStorage.getItem('canApprovePermits') === 'true';
        const storedEmail = localStorage.getItem('email');
        const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
        const storedSexo = localStorage.getItem('sexo');
        console.log(storedSexo);
        if (storedToken && storedNombres && storedApellidos && storedNombreCompleto && storedCargoEmpleado && storedCodEmp && storedFechaIng && storedDesDepart && storedTipo && storedRRHH && storedEmail && storedSexo) {
            setIsAuthenticated(true);
            setNombres(storedNombres);
            setApellidos(storedApellidos );
            setNombreCompleto(storedNombreCompleto);
            setCargoEmpleado(storedCargoEmpleado);
            setCodEmp(storedCodEmp);
            setFechaIng(storedFechaIng);
            setDesDepart(storedDesDepart);
            setTipo(storedTipo);
            setRRHH(parseInt(storedRRHH || '0'));
            setCanApproveVacations(storedCanApproveVacations);
            setCanApprovePermits(storedCanApprovePermits);
            setEmail(storedEmail);
            setIsAdmin(storedIsAdmin);
            setSexo(storedSexo);
        }
        setLoading(false);
    }, []);

    const login = async (usuario: string, password: string) => {
        try {
            const response = await axios.post(`${apiUrl}/login`, { username: usuario, password });
            if (response.data.success) {
                console.log('Login successful:', response.data); // Añade este log para depuración
                setIsAuthenticated(true);
                setNombres(response.data.nombres);
                setApellidos(response.data.apellidos);
                setNombreCompleto(response.data.nombre_completo);
                setCargoEmpleado(response.data.des_cargo);
                setCodEmp(response.data.cod_emp);
                setFechaIng(response.data.fecha_ing);
                setDesDepart(response.data.des_depart);
                setTipo(response.data.tipo);
                setRRHH(response.data.RRHH);
                setCanApproveVacations(response.data.canApproveVacations);
                setCanApprovePermits(response.data.canApprovePermits);
                setEmail(response.data.email);
                setSexo(response.data.sexo);
                console.log('sexo ', response.data.sexo);   
                setIsAdmin(response.data.isAdmin || false);    
  // Asegúrate de que este valor se está estableciendo
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('nombres', response.data.nombres);
                localStorage.setItem('apellidos', response.data.apellidos);
                localStorage.setItem('nombre_completo', response.data.nombre_completo);
                localStorage.setItem('cargo_empleado', response.data.des_cargo);
                localStorage.setItem('cod_emp', response.data.cod_emp);
                localStorage.setItem('fecha_ing', response.data.fecha_ing);
                localStorage.setItem('des_depart', response.data.des_depart);
                sessionStorage.setItem('tipo', response.data.tipo);
                localStorage.setItem('RRHH', response.data.RRHH);
                localStorage.setItem('email', response.data.email); // Asegúrate de que este valor se está almacenando
                localStorage.setItem('sexo', response.data.sexo);
                localStorage.setItem('isAdmin', response.data.isAdmin ? 'true' : 'false');
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
            const response = await axios.post(`${apiUrl}/signup`, { email, username: usuario, password, confirmPassword });
            if (response.data.success) {
                setIsAuthenticated(true);
                setNombres(response.data.nombres);
                setApellidos(response.data.apellidos);
                setNombreCompleto(response.data.nombre_completo);
                setCargoEmpleado(response.data.des_cargo);
                setCodEmp(response.data.cod_emp);
                setFechaIng(response.data.fecha_ing);
                setDesDepart(response.data.des_depart);
                setTipo(response.data.tipo);
                setRRHH(response.data.RRHH);
                setEmail(response.data.email);
                setSexo(response.data.sexo);
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('nombres', response.data.nombres);
                localStorage.setItem('apellidos', response.data.apellidos);
                localStorage.setItem('nombre_completo', response.data.nombre_completo);
                localStorage.setItem('cargo_empleado', response.data.des_cargo);
                localStorage.setItem('cod_emp', response.data.cod_emp);
                localStorage.setItem('fecha_ing', response.data.fecha_ing);
                localStorage.setItem('des_depart', response.data.des_depart);
                sessionStorage.setItem('tipo', response.data.tipo);
                localStorage.setItem('RRHH', response.data.RRHH.toString());
                localStorage.setItem('email', response.data.email);
                localStorage.setItem('sexo', response.data.sexo);
                return true;
            } else {
                return response.data.message || 'Error desconocido'; 
            }
        } catch (error) {
            
            console.error('Error during signup:', error);
            const axiosError = error as AxiosError;
            const errorMessage = (axiosError.response?.data as { message?: string })?.message;
            return errorMessage || 'Error desconocido';
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setNombres('');
        setNombreCompleto(null);
        setCargoEmpleado(null);
        setSexo('');
        setCodEmp('');
        setFechaIng(null);
        setDesDepart(null);
        setTipo(null);
        setRRHH(null);
        setEmail('');
        setIsAdmin(false);
        localStorage.removeItem('token');
        localStorage.removeItem('nombres');
        localStorage.removeItem('apellidos');
        localStorage.removeItem('nombre_completo');
        localStorage.removeItem('sexo');
        localStorage.removeItem('cargo_empleado');
        localStorage.removeItem('cod_emp');
        localStorage.removeItem('fecha_ing');
        localStorage.removeItem('des_depart');
        sessionStorage.removeItem('tipo');
        localStorage.removeItem('RRHH');
        localStorage.removeItem('email');
        localStorage.removeItem('isAdmin');
    };

    const revalidateUserStatus = async () => {
        if (!cod_emp) return; // No hacer nada si no hay un usuario logueado

        try {
            console.log("Revalidando estado del usuario...");
            const response = await axios.get(`${apiUrl}/check-status/${cod_emp}`);
            const newStatus = response.data;

            if (newStatus.success) {
                // Compara el estado actual con el nuevo y actualiza si hay cambios
                    console.log(newStatus);
                /* if (newStatus.tipo !== tipo || newStatus.RRHH !== RRHH || newStatus.canApproveVacations !== canApproveVacations || newStatus.canApprovePermits !== canApprovePermits) { */
                    console.log('¡El rol o los permisos del usuario han cambiado! Actualizando sesión.');
                    setTipo(newStatus.tipo);
                    setRRHH(newStatus.RRHH);
                    setCanApproveVacations(newStatus.canApproveVacations);
                    setCanApprovePermits(newStatus.canApprovePermits);
                    sessionStorage.setItem('tipo', newStatus.tipo);
                    localStorage.setItem('RRHH', String(newStatus.RRHH));
                    localStorage.setItem('canApproveVacations', String(newStatus.canApproveVacations));
                    localStorage.setItem('canApprovePermits', String(newStatus.canApprovePermits));
                /* } else {
                    console.log("El rol y los permisos del usuario no han cambiado.");
                } */
            }
        } catch (error) {
            console.error('Error al re-validar el estado del usuario:', error);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
            <Mosaic  color={["#003391","#1A5FFA","#33CCCC","#1A3FFA"]} size="large" text="" textColor="#0d1bff" />
            </div>
        );
    }

    const value = {
        isAuthenticated, 
        nombres, 
        apellidos, 
        nombre_completo, 
        sexo, 
        cargo_empleado, 
        cod_emp, 
        fecha_ing, 
        des_depart, 
        tipo, 
        RRHH,
        canApproveVacations,
        canApprovePermits,
        email,  
        isAdmin, 
        login, 
        signup, 
        logout,
        revalidateUserStatus // Expón la nueva función a través del contexto
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};