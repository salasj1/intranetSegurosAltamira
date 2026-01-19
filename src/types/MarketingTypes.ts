export type ContentActionType = 'Link' | 'Modal' | 'InternalRoute' | 'None';
export type SectionContentType = 'Standard' | 'WelcomeSystem' | 'Gallery' | 'ExpedienteLink';

// Interface para un Slide del Carrusel
export interface CarouselSlideConfig {
    id: number;
    contentType: SectionContentType; // 'WelcomeSystem' para el slide de bienvenida
    title?: string;
    description?: string;
    imageUrl?: string;
    buttonText?: string;
    actionType?: ContentActionType;
    actionPayload?: string; // URL, Route path, o ID de modal
    order: number;
}

// Interface para el Banner Principal (lo que reemplaza a Navidad/Expediente)
export interface MainBannerConfig {
    id: number;
    contentType: SectionContentType; // 'ExpedienteLink', 'Gallery', 'Standard'
    title?: string;
    description?: string;
    imageUrl?: string;
    buttonText?: string; 
    actionType?: ContentActionType;
    actionPayload?: string;
}

// Respuesta de la API
export interface HomeContentResponse {
    carouselSlides: CarouselSlideConfig[];
    mainBanner: MainBannerConfig | null; // Null si no hay ninguno activo
}
