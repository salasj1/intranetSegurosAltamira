import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Alert, Button, Card, Spinner } from 'react-bootstrap';
import { useAuth } from '../auth/AuthProvider';
import { FaSignOutAlt } from "react-icons/fa";

function AdminDashboard() {
    const auth = useAuth(); // Acceder al contexto de autenticación
    const [selectedUser, setSelectedUser] = useState('');
    const [employeeEmails, setEmployeeEmails] = useState<string[]>([]); // Lista de correos
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Estado para manejar la animación de carga
    const abortControllerRef = useRef<AbortController | null>(null); // Referencia para el AbortController

    // Cargar correos de empleados al montar el componente
    useEffect(() => {
        const fetchEmployeeEmails = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const response = await axios.get(`${apiUrl}/admin/usuarios`);
                // Accede a response.data.usuarios en lugar de response.data
                const emails = response.data.usuarios
                    .map((emp: { correo_e: string }) => emp.correo_e)
                    .filter((email: string) => email && email.trim() !== ''); // Eliminar correos vacíos o nulos
                setEmployeeEmails(Array.from(new Set(emails))); // Eliminar duplicados
            } catch (err) {
                console.error('Error fetching employee emails:', err);
                setError('Error al cargar los correos de los empleados');
            }
        };

        fetchEmployeeEmails();
    }, []);

    const handleImpersonate = async () => {
        // Cancelar cualquier solicitud en curso
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Crear un nuevo AbortController para la nueva solicitud
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        try {
            setIsLoading(true); // Mostrar animación de carga
            setError('');
            setSuccess('');

            const apiUrl = import.meta.env.VITE_API_URL;
            const response = await axios.post(
                `${apiUrl}/admin/impersonate`,
                { username: selectedUser },
                { signal: abortController.signal } // Pasar el AbortController a la solicitud
            );

            if (response.data.success) {
                // Guardar los datos del usuario impersonado en localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('nombres', response.data.nombres);
                localStorage.setItem('apellidos', response.data.apellidos);
                localStorage.setItem('nombre_completo', response.data.nombre_completo);
                localStorage.setItem('cargo_empleado', response.data.des_cargo);
                localStorage.setItem('cod_emp', response.data.cod_emp);
                localStorage.setItem('fecha_ing', response.data.fecha_ing);
                localStorage.setItem('des_depart', response.data.des_depart);
                localStorage.setItem('tipo', response.data.tipo);
                localStorage.setItem('RRHH', response.data.RRHH.toString());
                localStorage.setItem('email', response.data.email);
                
                localStorage.setItem('sexo', response.data.sexo);
                localStorage.setItem('isAdmin', 'false'); // El usuario impersonado no es administrador
                setSuccess(`Ahora estás autenticado como ${selectedUser}`);
                setError('');

                // Redirigir al panel principal del usuario impersonado
                window.location.href = '/home';
            } else {
                setError(response.data.message);
                setSuccess('');
            }
        } catch (err) {
            if (axios.isCancel(err)) {
            } else {
                console.error(err);
                setError('Error al intentar autenticar como el usuario seleccionado');
                setSuccess('');
            }
        } finally {
            setIsLoading(false); // Ocultar animación de carga
        }
    };

    const handleLogout = () => {
        auth.logout(); // Llamar a la función de cierre de sesión
        window.location.href = '/'; // Redirigir al login
    };

    return (
        <div className="container mt-5 w-50 ">
            
            
            <Card style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, .1), 0px 8px 16px rgba(0, 0, 0, .1)" }}>
                <Card.Header className="d-flex justify-content-between align-items-center" style={{ backgroundColor: "#003896", color: "white" }}>
                    <h1>Panel de Administración</h1>
                    
                </Card.Header>
                <Card.Body>
                <button
                        className="btn btn-link text-#003896"
                        onClick={handleLogout}
                        style={{ fontSize: '1.5rem', textDecoration: 'none' }}
                        title="Cerrar sesión"
                    >
                        <FaSignOutAlt size={25} />
                    </button>
                    <div style={{ marginTop: '-60px',  marginBottom: '20px' }}>
                    <div className="text-center">
                        <img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" style={{ width: '300px' }} />
                    </div>
                    <h1 className="text-center mb-2" style={{ marginLeft: '-2px', color: "#003896" }}>Intranet</h1>
                    </div>
                    <div className="form-group">
                        <label htmlFor="selectedUser">Selecciona un usuario para autenticarte como él:</label>
                        <Select
                            id="selectedUser"
                            options={employeeEmails.map((email) => ({ value: email, label: email }))}
                            onChange={(selectedOption) => setSelectedUser(selectedOption?.value || '')}
                            placeholder="Selecciona un usuario"
                            isClearable
                        />
                    </div>
                    <Button className="btn btn-primary mt-3" onClick={handleImpersonate} disabled={!selectedUser || isLoading}>
                        {isLoading ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                {' '}Cargando...
                            </>
                        ) : (
                            'Ingresar como usuario'
                        )}
                    </Button>
                    {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                    {success && <Alert variant="success" className="mt-3">{success}</Alert>}
                </Card.Body>
            </Card>
        </div>
    );
}

export default AdminDashboard;