// Tipos para Cloud UCV - Eventos Universitarios

export type Categoria = 'Todos' | 'Académicos' | 'Culturales' | 'Deportivos' | 'Comerciales';

// Tipo para la tabla profiles (SQLite local)
export interface Profile {
  id: string;
  username: string;
  email: string | null;
  role: 'user' | 'admin';
  categorias_favoritas?: string[];
  avatar_url?: string | null;
  created_at: string;
}

// Tipo que mapea la estructura de la tabla eventos
export interface EventoRow {
  id: string;
  titulo: string;
  categoria: 'Académicos' | 'Culturales' | 'Deportivos' | 'Comerciales';
  fecha: string;
  hora: string;
  descripcion: string;
  asistentes: number;
  imagen: string;
  avatares: string[];
  direccion?: string | null;
  likes: number;
  created_at: string;
  user_id?: string | null;
}

// Tipo usado en la UI (extiende EventoRow con estado local de bookmark y like local)
export interface Evento extends EventoRow {
  guardado: boolean;
  like_local?: boolean; // Para optimismo
}

// Tipo para mensajes privados al administrador del evento
export interface MensajeEvento {
  id: string;
  evento_id: string;
  remitente_id: string;
  contenido: string;
  created_at: string;
  reply_to_id?: string | null;
  // JOIN con profiles para mostrar username y avatar del remitente
  profiles?: { username: string; avatar_url?: string | null } | null;
  // Conteo de likes
  likes?: { count: number }[];
  // Mensaje al que se responde (JOIN recursivo opcional)
  reply_to?: { profiles?: { username: string } | null } | null;
}

export type TabNavegacion = 'inicio' | 'explorar' | 'calendario' | 'perfil';

export interface NotificacionRow {
  id: string;
  user_id: string;
  actor_id: string | null;
  evento_id: string;
  tipo: string;
  leida: boolean;
  created_at: string;
  
  // Relaciones
  actor?: { username: string } | null;
  evento?: { titulo: string } | null;
}
