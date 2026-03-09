# Intranet Seguros Altamira

<div align="center">
  <img src="./src/assets/icono.webp" alt="Logo de Seguros Altamira" width="150">
</div>

<div style="font-size: 1.2em;">

La **Intranet de Seguros Altamira** es una plataforma web interna desarrollada para la autogestión de los empleados y áreas administrativas de Seguros Altamira, C.A. Su objetivo es centralizar y digitalizar procesos de gestión de recursos humanos, trámites laborales y comunicación interna, facilitando el acceso seguro y eficiente a información y servicios clave de la empresa.






<br/>
<div style=" margin-bottom: 25px;">
Además, se encuentra en constante evolución, incorporando nuevos módulos y funcionalidades según las necesidades de la empresa, con el propósito de seguir optimizando los procesos internos y mejorando la experiencia de los empleados. 🚀
</div>

## Funcionalidades principales 

- **Gestión de Documentos Laborales 📂**    
  Los empleados pueden descargar y solicitar documentos como:
  - Recibos de pago de nómina (PDF)
  - Constancias de trabajo
  - Comprobantes ARC (Agente de Retención)
  - Movimientos de prestaciones sociales

- **Envío Automático de Documentos por Correo Electrónico 📩**  
  El sistema envía correos automáticos mediante tareas programadas (cron) para notificar y recoger documentos vencidos desde Google Drive y llevarlos a la base de datos.

- **Portal de Expedientes y Directorio de Empleados 📝**  
  Acceso a un portal donde se puede visualizar el directorio de expedientes de todos los empleados, incluyendo:
  - Solicitudes de cambio de datos personales de empleados
  - Documentos almacenados en Google Drive y registrados en google Sheets y en Base de Datos
  - Estado de documentos vencidos por empleado y por tipo
  - Visualización de indicadores como:
    - Cantidad total de empleados con documentos vencidos
    - Cantidad total de documentos vencidos (seleccionados y por tipo)
    - Listado detallado de empleados y documentos afectados

- **Gestión de Permisos y Vacaciones 👍🏖**  
  Solicitud, aprobación y seguimiento de permisos laborales y vacaciones, con notificaciones automáticas en la plataforma y por correo a supervisores y RRHH.

- **Actualización de Datos Personales**  
  Los empleados pueden revisar y solicitar cambios en sus datos personales, con flujos de validación y bloqueo ante solicitudes pendientes, asegurando la integridad y seguridad de la información.

- **Carga y Validación de Documentos**  
   Integración con Google Drive para la carga, almacenamiento y validación de documentos personales requeridos por la empresa.

- **Panel de Supervisión🔎**  
  Módulos para supervisores y RRHH para gestionar solicitudes, aprobar/rechazar trámites y visualizar el estado de rol de los empleados a su cargo.

## Tecnologías utilizadas

- **Frontend:**  
  - React + TypeScript  
  - Vite  
  - React Bootstrap  
  - react-pdf-viewer  
  - react-toastify  
  

- **Backend:**  
  - Node.js + Express  
  - SQL Server (procedimientos almacenados y vistas para la gestión de datos)
  - Multer (manejo de archivos)
  - Nodemailer (envío de correos)
  - PDF-lib, jsPDF (generación y compresión de PDFs)
  - Archiver, Sharp (compresión y manipulación de archivos)
  - Integración con Google Drive API

## Estructura del proyecto

- `/src`: Código fuente del frontend (componentes, rutas, estilos, utilidades)
- `/BackendIntranetSegurosAltamira`: Código fuente del backend (rutas, funciones, plantillas de correo)
- `/public`: Recursos estáticos y assets
- `/templates`: Plantillas HTML para correos automáticos

## Instalación y ejecución

1. **Clonar el repositorio**
2. **Instalar dependencias**  
   ```sh
   npm install
   ```
3. **Configurar variables de entorno**  
   Completar el archivo `.env` con las credenciales y rutas necesarias.
4. **Ejecutar el backend**  
   (Ver instrucciones específicas en el repositorio de BackendIntranetSegurosAltamira)
5. **Ejecutar el frontend**  
   ```sh
   npm run dev
   ```

## Seguridad y privacidad

El acceso a la intranet está restringido a empleados autorizados. Los datos personales y documentos están protegidos y solo accesibles por el usuario y las áreas responsables.

---

**Intranet Seguros Altamira** es una herramienta en constante evolución, orientada a mejorar la experiencia y eficiencia de los empleados y la gestión interna de la empresa.