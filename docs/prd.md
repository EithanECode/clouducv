# Documento de Requisitos

## 1. Descripción General de la Aplicación

### 1.1 Nombre de la Aplicación
Cloud UCV - Eventos Universitarios

### 1.2 Descripción
Aplicación web mobile-first para visualizar y gestionar eventos universitarios de la UCV. Permite a los usuarios explorar eventos por categorías (Académicos, Culturales, Deportivos, Comercial), dar like a eventos, guardar eventos favoritos, crear nuevos eventos con descripción (requiere autenticación), editar y eliminar eventos propios, ver detalles completos de eventos, enviar mensajes privados a organizadores, y navegar entre diferentes secciones. Los datos de eventos se almacenan y leen desde Supabase. Incluye sistema de autenticación con usuario, correo electrónico y contraseña. Diseño responsive adaptable a todos los dispositivos.

## 2. Usuarios y Escenarios de Uso

### 2.1 Usuarios Objetivo
Estudiantes y personal de la Universidad Central de Venezuela (UCV)

### 2.2 Escenarios Principales
- Consultar eventos universitarios disponibles desde la base de datos (sin autenticación)
- Registrarse e iniciar sesión con usuario, correo electrónico y contraseña
- Filtrar eventos por categoría de interés
- Dar like a eventos y ver contador de likes
- Guardar eventos para referencia futura
- Ver eventos guardados ordenados por fecha (próximos primero)
- Explorar eventos destacados y académicos/culturales/comerciales
- Ver detalle completo de un evento específico con descripción
- Crear nuevos eventos universitarios con dirección y descripción (requiere autenticación)
- Ver eventos propios en el perfil
- Editar eventos propios desde el perfil incluyendo dirección y descripción
- Eliminar eventos propios desde el perfil
- Enviar mensajes privados al organizador de un evento
- Ver mensajes recibidos en eventos propios
- Recuperar contraseña mediante correo electrónico
- Cerrar sesión

## 3. Estructura de Páginas y Funcionalidades

### 3.1 Estructura de Navegación

```
Cloud UCV - Eventos Universitarios
├── Pantalla de Login/Registro
├── Pantalla de Recuperación de Contraseña
├── Inicio (Tab activo por defecto)
│   └── Modal de Creación de Evento (solo usuarios autenticados)
├── Explorar
├── Calendario
├── Perfil
│   ├── Sección de Eventos Guardados
│   ├── Modal de Edición de Evento (solo para eventos propios)
│   └── Diálogo de Confirmación de Eliminación
└── Detalle de Evento
    └── Sección de Mensajes al Administrador
```

### 3.2 Componentes Globales

#### 3.2.1 Header
- Logo: nube rosa/morada (SVG inline)
- Texto: \"Eventos Universitarios\" y \"Cloud UCV\"
- Ícono de campana de notificaciones (SVG inline)
- Estado de sesión:
  - Usuario NO autenticado: botón \"Iniciar sesión\"
  - Usuario autenticado: avatar con iniciales del username
- Fondo: color púrpura oscuro (#2D1B69)
- Responsive: se adapta a diferentes tamaños de pantalla

#### 3.2.2 Barra de Navegación Inferior
- Posición: fija en la parte inferior
- 4 tabs con íconos SVG inline:
  - Inicio
  - Explorar
  - Calendario
  - Perfil
- Tab activo con indicador visual diferenciado
- Responsive: se mantiene visible en todos los dispositivos

#### 3.2.3 Botón Flotante de Acción (FAB)
- Posición: fija en la esquina inferior derecha de la pantalla de Inicio
- Ícono: símbolo \"+\" (SVG inline)
- Color: magenta (#d946ef)
- Visibilidad:
  - Usuario NO autenticado: NO se muestra
  - Usuario autenticado: se muestra
- Al hacer clic: abre el modal de creación de evento
- Responsive: se ajusta su posición según el tamaño de pantalla

### 3.3 Pantalla de Login/Registro

#### 3.3.1 Estructura
- Presentación: página dedicada o modal
- Tabs: \"Iniciar sesión\" / \"Registrarse\"
- Fondo: púrpura oscuro (#2D1B69)
- Link: \"¿Olvidaste tu contraseña?\" (visible en tab de Iniciar sesión)
- Responsive: formulario se adapta al ancho del dispositivo

#### 3.3.2 Tab de Iniciar Sesión

**Campos del formulario:**
- Usuario (username):
  - Tipo: input de texto
  - Placeholder: \"Ingresa tu usuario\"
  - Requerido: sí
- Contraseña:
  - Tipo: input de contraseña
  - Placeholder: \"Ingresa tu contraseña\"
  - Requerido: sí

**Botón de acción:**
- Texto: \"Iniciar sesión\"
- Al hacer clic: validar campos y autenticar con Supabase Auth usando método username+password (simulando un dominio de ejemplo)

**Link adicional:**
- Texto: \"¿Olvidaste tu contraseña?\"
- Al hacer clic: navegar a pantalla de recuperación de contraseña

**Manejo de errores:**
- Usuario no existe: mostrar mensaje \"Usuario no encontrado\"
- Contraseña incorrecta: mostrar mensaje \"Contraseña incorrecta\"
- Error de conexión: mostrar mensaje \"Error de conexión. Intenta nuevamente.\"

**Comportamiento post-login:**
- Login exitoso: cerrar modal/página, redirigir a Inicio, actualizar header con avatar

#### 3.3.3 Tab de Registrarse

**Campos del formulario:**
- Usuario (username):
  - Tipo: input de texto
  - Placeholder: \"Elige un nombre de usuario\"
  - Requerido: sí
  - Validación: debe ser único
- Correo electrónico:
  - Tipo: input de email
  - Placeholder: \"Ingresa tu correo electrónico\"
  - Requerido: sí
  - Validación: formato de email válido
- Contraseña:
  - Tipo: input de contraseña
  - Placeholder: \"Crea una contraseña\"
  - Requerido: sí
- Confirmar contraseña:
  - Tipo: input de contraseña
  - Placeholder: \"Confirma tu contraseña\"
  - Requerido: sí
  - Validación: debe coincidir con el campo Contraseña
- Checkbox de Acuerdo de Usuario y Política de Privacidad:
  - Texto: \"Acepto el Acuerdo de Usuario y la Política de Privacidad\"
  - Requerido: sí

**Botón de acción:**
- Texto: \"Registrarse\"
- Al hacer clic: validar campos y crear usuario en Supabase Auth

**Validación de campos:**
- Campos vacíos: mostrar mensaje \"Por favor completa todos los campos\"
- Formato de email inválido: mostrar mensaje \"Por favor ingresa un correo electrónico válido\"
- Contraseñas no coinciden: mostrar mensaje \"Las contraseñas no coinciden\"
- Checkbox no marcado: mostrar mensaje \"Debes aceptar el Acuerdo de Usuario y la Política de Privacidad\"
- Usuario ya existe: mostrar mensaje \"El nombre de usuario ya está en uso\"
- Correo ya registrado: mostrar mensaje \"El correo electrónico ya está registrado\"

**Comportamiento post-registro:**
- Registro exitoso: crear perfil en tabla profiles automáticamente (trigger handle_new_user), cerrar modal/página, redirigir a Inicio, actualizar header con avatar
- Sin verificación de email (deshabilitada)

### 3.4 Pantalla de Recuperación de Contraseña

#### 3.4.1 Estructura
- Presentación: página dedicada o modal
- Título: \"Recuperar Contraseña\"
- Fondo: púrpura oscuro (#2D1B69)
- Responsive: formulario se adapta al ancho del dispositivo

#### 3.4.2 Campos del Formulario
- Correo electrónico:
  - Tipo: input de email
  - Placeholder: \"Ingresa tu correo electrónico\"
  - Requerido: sí
  - Validación: formato de email válido

#### 3.4.3 Botones de Acción
- Botón \"Enviar enlace de recuperación\": envía email de recuperación mediante Supabase Auth
- Link \"Volver a iniciar sesión\": regresa a pantalla de login

#### 3.4.4 Validación y Comportamiento
- Campo vacío: mostrar mensaje \"Por favor ingresa tu correo electrónico\"
- Formato inválido: mostrar mensaje \"Por favor ingresa un correo electrónico válido\"
- Correo no registrado: mostrar mensaje \"No existe una cuenta con este correo electrónico\"
- Envío exitoso: mostrar mensaje \"Se ha enviado un enlace de recuperación a tu correo electrónico\"
- Error de conexión: mostrar mensaje \"Error al enviar el enlace. Intenta nuevamente.\"

### 3.5 Página de Inicio

#### 3.5.1 Sección de Saludo
- Usuario NO autenticado: \"Hola, Invitado 👋\"
- Usuario autenticado: \"Hola, [username] 👋\"
- Subtítulo: \"¿Qué pasa hoy en la UCV?\"
- Responsive: texto se ajusta al ancho del dispositivo

#### 3.5.2 Filtros de Categoría
- Formato: pills/chips horizontales con scroll
- Categorías disponibles:
  - Todos (activo por defecto, color morado)
  - Académicos (con ícono SVG inline)
  - Culturales (con ícono SVG inline)
  - Deportivos (con ícono SVG inline)
  - Comercial (con ícono SVG inline)
- Barra de progreso/scroll debajo de los filtros
- Al seleccionar una categoría, se actualiza el contenido mostrado filtrando los datos obtenidos de Supabase
- Responsive: scroll horizontal en dispositivos pequeños, puede expandirse en pantallas grandes

#### 3.5.3 Estados de Carga y Error
- Estado de carga: mostrar indicador visual (spinner o skeleton) mientras se obtienen los eventos desde Supabase
- Estado de error: si falla la conexión con Supabase, mostrar mensaje \"No se pudieron cargar los eventos. Intenta nuevamente.\"
- Estado vacío: si no hay eventos en la base de datos, mostrar mensaje \"No hay eventos disponibles\"

#### 3.5.4 Sección de Eventos (Vista: Todos)
- Título: \"Eventos destacados\"
- Link: \"Ver todos →\" (alineado a la derecha)
- Cards de eventos obtenidos desde Supabase:
  - Evento 1:
    - Imagen del evento (URL desde campo imagen)
    - Badge de categoría: \"Culturales\"
    - Título: \"Concierto Sinfónico UCV\"
    - Fecha y hora: \"15 Jun, 2025 - 7:00 PM\"
    - Dirección (si existe): con ícono de pin de ubicación
    - Avatares de asistentes (círculos superpuestos)
    - Contador: \"342 asistentes\"
    - Ícono de corazón con contador de likes
    - Ícono bookmark (SVG inline)
  - Evento 2:
    - Badge: \"Deportivos\"
    - Imagen en blanco y negro de fútbol
    - Ícono de corazón con contador de likes
    - Visible parcialmente (scroll vertical)
- Al hacer clic en una card: navegar a pantalla de detalle del evento
- Al hacer clic en ícono de corazón: incrementar/decrementar contador de likes
- Responsive: cards se ajustan en columnas según ancho de pantalla (1 columna en móvil, 2-3 en tablet/desktop)

#### 3.5.5 Sección de Eventos (Vista: Académicos)
- Título: \"Eventos Académicos\"
- Link: \"Ver todos →\"
- Card de evento filtrado por categoría \"Académicos\":
  - Imagen: auditorio con estudiantes
  - Badge: \"Académicos\"
  - Título: \"Conferencia Tech Summit\"
  - Fecha y hora: \"22 Jun, 2025 - 10:00 AM\"
  - Dirección (si existe): con ícono de pin
  - Avatares de asistentes
  - Contador: \"267 asistentes\"
  - Ícono de corazón con contador de likes
  - Ícono bookmark
- Al hacer clic en una card: navegar a pantalla de detalle del evento
- Al hacer clic en ícono de corazón: incrementar/decrementar contador de likes

#### 3.5.6 Sección de Eventos (Vista: Culturales)
- Título: \"Eventos Culturales\"
- Link: \"Ver todos →\"
- Cards de eventos filtrados por categoría \"Culturales\":
  - Card 1:
    - Badge: \"Culturales\"
    - Título: \"Concierto Sinfónico UCV\"
    - Fecha y hora: \"15 Jun, 2025 - 7:00 PM\"
    - Dirección (si existe): con ícono de pin
    - Avatares de asistentes
    - Contador: \"342 asistentes\"
    - Ícono de corazón con contador de likes
    - Ícono bookmark
  - Card 2:
    - Imagen de carnaval/colores vibrantes
    - Badge: \"Culturales\"
    - Ícono de corazón con contador de likes
    - Visible parcialmente (scroll vertical)
- Al hacer clic en una card: navegar a pantalla de detalle del evento
- Al hacer clic en ícono de corazón: incrementar/decrementar contador de likes

#### 3.5.7 Sección de Eventos (Vista: Comercial)
- Título: \"Eventos Comerciales\"
- Link: \"Ver todos →\"
- Cards de eventos filtrados por categoría \"Comercial\":
  - Estructura idéntica a otras categorías
  - Badge: \"Comercial\"
  - Ícono de corazón con contador de likes
  - Ícono bookmark
- Al hacer clic en una card: navegar a pantalla de detalle del evento
- Al hacer clic en ícono de corazón: incrementar/decrementar contador de likes

#### 3.5.8 Funcionalidad de Bookmark
- Cada card de evento incluye ícono de bookmark
- Al hacer clic, cambia el estado visual del ícono (guardado/no guardado)
- Usuario autenticado: guardar en tabla eventos_guardados de Supabase
- Usuario NO autenticado: guardar localmente (sin persistencia)

#### 3.5.9 Funcionalidad de Likes
- Cada card de evento incluye ícono de corazón con contador de likes
- Al hacer clic en el ícono:
  - Usuario autenticado: incrementar/decrementar contador en tabla eventos de Supabase
  - Usuario NO autenticado: mostrar prompt de login
- El contador se actualiza en tiempo real
- Un usuario solo puede dar like una vez por evento

### 3.6 Modal de Creación de Evento

#### 3.6.1 Activación
- Solo visible para usuarios autenticados
- Se abre al hacer clic en el botón FAB \"+\"
- Presentación: modal o panel deslizable desde abajo (bottom sheet)
- Fondo oscurecido detrás del modal
- Responsive: modal se adapta al tamaño de pantalla

#### 3.6.2 Estructura del Formulario
- Título del modal: \"Crear Nuevo Evento\"
- Botón de cerrar (X) en la esquina superior

#### 3.6.3 Campos del Formulario

**Título del evento**
- Tipo: input de texto
- Placeholder: \"Ingresa el título del evento\"
- Requerido: sí
- Validación: no puede estar vacío

**Categoría**
- Tipo: selector/dropdown
- Opciones: Académicos, Culturales, Deportivos, Comercial
- Requerido: sí
- Validación: debe seleccionar una opción

**Fecha**
- Tipo: input de tipo date
- Requerido: sí
- Validación: debe ser una fecha válida

**Hora**
- Tipo: input de tipo time
- Requerido: sí
- Validación: debe ser una hora válida en formato 12 horas (AM/PM)

**Dirección / Ubicación**
- Tipo: input de texto
- Placeholder: \"Ej: Aula Magna UCV, Caracas\"
- Requerido: no
- Comportamiento: campo opcional para especificar la ubicación del evento

**Descripción del evento**
- Tipo: textarea
- Placeholder: \"Describe el evento\"
- Requerido: sí
- Validación: no puede estar vacío
- Contador de caracteres (máximo 1000)

**Número de asistentes esperados**
- Tipo: input numérico
- Placeholder: \"Número de asistentes\"
- Requerido: sí
- Validación: debe ser un número mayor a 0

**URL de imagen**
- Tipo: input de texto
- Placeholder: \"URL de la imagen (opcional)\"
- Requerido: no
- Comportamiento: si no se provee, usar imagen por defecto según categoría

#### 3.6.4 Botones de Acción
- Botón \"Cancelar\": cierra el modal sin guardar
- Botón \"Guardar Evento\": valida campos y guarda en Supabase

#### 3.6.5 Validación de Campos
- Al hacer clic en \"Guardar Evento\", validar que todos los campos requeridos estén completos
- Validar formato de fecha y hora
- Validar longitud de descripción (máximo 1000 caracteres)
- Si hay campos vacíos o inválidos, mostrar mensaje \"Por favor completa todos los campos requeridos correctamente\"
- No permitir el envío hasta que la validación sea exitosa

#### 3.6.6 Guardado en Supabase
- Al pasar la validación, insertar nuevo registro en tabla eventos
- Campos a insertar:
  - titulo: valor del campo Título
  - categoria: valor del campo Categoría
  - fecha: valor del campo Fecha
  - hora: valor del campo Hora
  - direccion: valor del campo Dirección (puede ser null)
  - descripcion: valor del campo Descripción
  - asistentes: valor del campo Número de asistentes
  - imagen: valor del campo URL de imagen (o imagen por defecto si está vacío)
  - avatares: generados automáticamente con colores predeterminados según categoría
  - likes: 0 (valor inicial)
  - user_id: auth.uid() del usuario autenticado
  - created_at: timestamp automático

#### 3.6.7 Estados Post-Guardado
- Éxito: mostrar mensaje \"Evento creado exitosamente\", cerrar modal, refrescar lista de eventos en la página de Inicio
- Error: si falla la inserción en Supabase, mostrar mensaje \"Error al crear el evento. Intenta nuevamente.\"

### 3.7 Página de Explorar
- Placeholder para funcionalidad futura
- Muestra mensaje o contenido básico indicando la sección
- Al hacer clic en una card de evento: navegar a pantalla de detalle del evento
- Responsive: se adapta a diferentes tamaños de pantalla

### 3.8 Página de Calendario
- Placeholder para funcionalidad futura
- Muestra mensaje o contenido básico indicando la sección
- Responsive: se adapta a diferentes tamaños de pantalla

### 3.9 Página de Perfil

#### 3.9.1 Usuario NO Autenticado
- Mostrar mensaje: \"Inicia sesión para ver tu perfil\"
- Botón: \"Iniciar sesión\" (redirige a pantalla de login)
- Responsive: mensaje centrado y adaptado al tamaño de pantalla

#### 3.9.2 Usuario Autenticado
- Mostrar username del usuario
- Sección: \"Eventos guardados\"
  - Lista de eventos guardados por el usuario (obtenidos de tabla eventos_guardados)
  - Ordenados por fecha del evento: eventos próximos primero, luego eventos pasados
  - Cada evento en la lista incluye:
    - Información del evento (título, categoría, fecha, hora, dirección si existe, asistentes)
    - Ícono de corazón con contador de likes
    - Botón para dejar de guardar (ícono de bookmark activo)
  - Si no tiene eventos guardados: mostrar mensaje \"Aún no has guardado eventos\"
- Sección: \"Mis eventos creados\"
  - Lista de eventos creados por el usuario (filtrados por user_id)
  - Cada evento en la lista incluye:
    - Información del evento (título, categoría, fecha, hora, dirección si existe, asistentes, descripción)
    - Ícono de corazón con contador de likes
    - Botón de editar (ícono de lápiz SVG inline)
    - Botón de eliminar (ícono de basura/papelera SVG inline)
  - Si no tiene eventos: mostrar mensaje \"Aún no has creado eventos\"
- Botón: \"Cerrar sesión\"
  - Al hacer clic: ejecutar signOut, actualizar header, redirigir a Inicio
- Responsive: listas se adaptan en columnas según ancho de pantalla

### 3.10 Modal de Edición de Evento

#### 3.10.1 Activación
- Solo visible para usuarios autenticados
- Se abre al hacer clic en el botón de editar (ícono de lápiz) de un evento propio en la página de Perfil
- Presentación: modal o panel deslizable desde abajo (bottom sheet)
- Fondo oscurecido detrás del modal
- Responsive: modal se adapta al tamaño de pantalla

#### 3.10.2 Estructura del Formulario
- Título del modal: \"Editar Evento\"
- Botón de cerrar (X) en la esquina superior

#### 3.10.3 Campos del Formulario
- Todos los campos son idénticos al modal de creación
- Los campos se pre-llenan con los valores actuales del evento:
  - Título del evento
  - Categoría
  - Fecha (formato date)
  - Hora (formato time)
  - Dirección / Ubicación
  - Descripción del evento
  - Número de asistentes esperados
  - URL de imagen

#### 3.10.4 Botones de Acción
- Botón \"Cancelar\": cierra el modal sin guardar cambios
- Botón \"Guardar Cambios\": valida campos y actualiza en Supabase

#### 3.10.5 Validación de Campos
- Mismas reglas de validación que el modal de creación
- Validar formato de fecha y hora
- Validar longitud de descripción (máximo 1000 caracteres)
- Al hacer clic en \"Guardar Cambios\", validar que todos los campos requeridos estén completos
- Si hay campos vacíos o inválidos, mostrar mensaje \"Por favor completa todos los campos requeridos correctamente\"

#### 3.10.6 Actualización en Supabase
- Al pasar la validación, ejecutar UPDATE en tabla eventos
- Condición: WHERE id = evento_id AND user_id = auth.uid()
- Campos a actualizar:
  - titulo
  - categoria
  - fecha
  - hora
  - direccion
  - descripcion
  - asistentes
  - imagen
  - avatares (regenerados según nueva categoría si cambió)

#### 3.10.7 Estados Post-Actualización
- Éxito: mostrar mensaje \"Evento actualizado exitosamente\", cerrar modal, refrescar lista de eventos en la página de Perfil
- Error: si falla la actualización en Supabase, mostrar mensaje \"Error al actualizar el evento. Intenta nuevamente.\"

### 3.11 Diálogo de Confirmación de Eliminación

#### 3.11.1 Activación
- Se abre al hacer clic en el botón de eliminar (ícono de basura/papelera) de un evento propio en la página de Perfil
- Presentación: diálogo modal centrado
- Fondo oscurecido detrás del diálogo
- Responsive: diálogo se adapta al tamaño de pantalla

#### 3.11.2 Contenido del Diálogo
- Título: \"Eliminar Evento\"
- Mensaje: \"¿Estás seguro de que deseas eliminar el evento '[título del evento]'? Esta acción no se puede deshacer.\"
- Botones:
  - \"Cancelar\": cierra el diálogo sin eliminar
  - \"Eliminar\": ejecuta la eliminación en Supabase

#### 3.11.3 Eliminación en Supabase
- Al hacer clic en \"Eliminar\", ejecutar DELETE en tabla eventos
- Condición: WHERE id = evento_id AND user_id = auth.uid()

#### 3.11.4 Estados Post-Eliminación
- Éxito: mostrar mensaje \"Evento eliminado exitosamente\", cerrar diálogo, refrescar lista de eventos en la página de Perfil
- Error: si falla la eliminación en Supabase, mostrar mensaje \"Error al eliminar el evento. Intenta nuevamente.\"

### 3.12 Pantalla de Detalle de Evento

#### 3.12.1 Activación
- Se accede al hacer clic en cualquier card de evento desde la página de Inicio o Explorar
- Presentación: página completa dedicada
- Responsive: contenido se adapta al ancho de pantalla

#### 3.12.2 Estructura de la Pantalla
- Botón de volver (back) en la parte superior para regresar a la pantalla anterior
- Imagen del evento a tamaño completo (hero image)
- Badge de categoría
- Título del evento
- Descripción del evento (debajo del título)
- Fecha y hora
- Dirección/ubicación del evento (si existe)
- Número de asistentes con avatares
- Ícono de corazón con contador de likes
- Nombre del creador (username del perfil del user_id)
- Sección de \"Mensajes al Administrador\" (ver 3.12.3)

#### 3.12.3 Sección de Mensajes al Administrador

**Visibilidad según estado de autenticación:**

- Usuario NO autenticado:
  - Mostrar prompt: \"Inicia sesión para enviar un mensaje al organizador\"
  - Botón: \"Iniciar sesión\" (redirige a pantalla de login)

- Usuario autenticado (NO creador del evento):
  - Mostrar lista de mensajes propios enviados al organizador
  - Cada mensaje incluye:
    - Avatar con iniciales del remitente
    - Username del remitente
    - Texto del mensaje
    - Fecha/hora relativa
  - Campo para escribir nuevo mensaje:
    - Textarea con placeholder \"Escribe tu mensaje al organizador\"
    - Contador de caracteres (máximo 500)
    - Botón \"Enviar mensaje\"
  - Al hacer clic en \"Enviar mensaje\": validar longitud, insertar en tabla mensajes_evento, mostrar mensaje de éxito, refrescar lista

- Usuario autenticado (creador del evento):
  - Mostrar todos los mensajes recibidos de otros usuarios
  - Cada mensaje incluye:
    - Avatar con iniciales del remitente
    - Username del remitente
    - Texto del mensaje
    - Fecha/hora relativa
  - NO mostrar campo para escribir mensaje (no puede enviarse mensajes a sí mismo)
  - Si no hay mensajes: mostrar \"Aún no has recibido mensajes\"

**Formato de mensajes:**
- Avatar circular con iniciales del remitente
- Username del remitente
- Texto del mensaje (máximo 500 caracteres)
- Fecha/hora relativa (ej: \"hace 2 horas\", \"ayer\", \"15 Jun\")

**Validación de nuevo mensaje:**
- Campo vacío: mostrar mensaje \"El mensaje no puede estar vacío\"
- Más de 500 caracteres: mostrar mensaje \"El mensaje no puede superar los 500 caracteres\"
- Usuario intenta enviar mensaje a su propio evento: bloquear acción (RLS)

**Guardado en Supabase:**
- Al enviar mensaje, insertar en tabla mensajes_evento:
  - evento_id: id del evento actual
  - remitente_id: auth.uid()
  - contenido: texto del mensaje
  - created_at: timestamp automático

**Estados post-envío:**
- Éxito: mostrar mensaje \"Mensaje enviado exitosamente\", limpiar textarea, refrescar lista de mensajes
- Error: mostrar mensaje \"Error al enviar el mensaje. Intenta nuevamente.\"

## 4. Reglas de Negocio y Lógica

### 4.1 Integración con Supabase

#### 4.1.1 Estructura de Base de Datos

**Tabla: eventos**
- id: identificador único del evento (uuid)
- titulo: nombre del evento
- categoria: tipo de evento (Académicos, Culturales, Deportivos, Comercial)
- fecha: fecha del evento (date)
- hora: hora del evento (time)
- direccion: dirección/ubicación del evento (text, nullable)
- descripcion: descripción del evento (text, not null)
- asistentes: número de asistentes
- imagen: URL de la imagen del evento
- avatares: avatares de asistentes
- likes: contador de likes (integer, default 0)
- user_id: uuid REFERENCES profiles(id) (nullable para eventos seed existentes)
- created_at: fecha de creación del registro

**Tabla: profiles**
- id: uuid (FK auth.users, primary key)
- username: text (unique, not null)
- email: text (unique, not null)
- role: enum (user/admin)
- created_at: timestamp

**Tabla: eventos_guardados**
- id: identificador único
- evento_id: uuid REFERENCES eventos(id) ON DELETE CASCADE
- user_id: uuid REFERENCES profiles(id)
- created_at: fecha de creación del registro

**Tabla: likes_evento**
- id: uuid primary key default gen_random_uuid()
- evento_id: uuid REFERENCES eventos(id) ON DELETE CASCADE
- user_id: uuid REFERENCES profiles(id)
- created_at: timestamptz default now()
- Constraint: UNIQUE(evento_id, user_id)

**Tabla: mensajes_evento**
- id: uuid primary key default gen_random_uuid()
- evento_id: uuid REFERENCES eventos(id) ON DELETE CASCADE
- remitente_id: uuid REFERENCES profiles(id)
- contenido: text NOT NULL
- created_at: timestamptz default now()

#### 4.1.2 Políticas de Acceso (RLS)

**Tabla eventos:**
- SELECT: acceso público (anon y authenticated pueden leer)
- INSERT: solo usuarios autenticados pueden insertar; el user_id debe coincidir con auth.uid()
- UPDATE: solo el dueño del evento puede actualizar (auth.uid() = user_id); el campo likes puede ser actualizado por cualquier usuario autenticado
- DELETE: solo el dueño del evento puede eliminar (auth.uid() = user_id)

**Tabla profiles:**
- SELECT: acceso público de lectura
- INSERT/UPDATE: solo el propio usuario puede modificar su perfil

**Tabla eventos_guardados:**
- SELECT: solo el usuario puede ver sus eventos guardados (auth.uid() = user_id)
- INSERT: solo usuarios autenticados pueden guardar eventos; user_id debe ser auth.uid()
- DELETE: solo el usuario puede eliminar sus eventos guardados (auth.uid() = user_id)

**Tabla likes_evento:**
- SELECT: acceso público de lectura
- INSERT: solo usuarios autenticados pueden dar like; user_id debe ser auth.uid()
- DELETE: solo el usuario puede eliminar su like (auth.uid() = user_id)

**Tabla mensajes_evento:**
- SELECT: el creador del evento puede ver todos los mensajes de sus eventos; el remitente puede ver sus propios mensajes
- INSERT: solo usuarios autenticados pueden enviar mensajes; remitente_id debe ser auth.uid(); no se puede enviar mensaje a un evento propio (validar que auth.uid() != user_id del evento)
- UPDATE: no permitido
- DELETE: no permitido para usuarios (solo admin)

#### 4.1.3 Trigger de Sincronización
- Trigger: handle_new_user
- Función: al crear un usuario en auth.users, insertar automáticamente un registro en profiles con:
  - id: auth.users.id
  - username: extraído del email o metadata
  - email: auth.users.email
  - role: \"user\" (por defecto)
  - created_at: timestamp actual

#### 4.1.4 Datos de Muestra (Seed Data)
Insertar en Supabase los siguientes eventos:
- Concierto Sinfónico UCV (Culturales, 15 Jun 2025, 7:00 PM, 342 asistentes, descripción genérica, likes: 0, user_id: null)
- Conferencia Tech Summit (Académicos, 22 Jun 2025, 10:00 AM, 267 asistentes, descripción genérica, likes: 0, user_id: null)
- Evento deportivo de fútbol (Deportivos, descripción genérica, likes: 0, user_id: null)
- Evento cultural de carnaval (Culturales, descripción genérica, likes: 0, user_id: null)
- Evento comercial de muestra (Comercial, descripción genérica, likes: 0, user_id: null)

#### 4.1.5 Realtime
- Habilitar Realtime en tabla mensajes_evento para actualización en tiempo real de mensajes
- Habilitar Realtime en tabla likes_evento para actualización en tiempo real de likes

### 4.2 Autenticación con Supabase Auth

#### 4.2.1 Método de Autenticación
- Método: username + email + password (simulando un dominio de ejemplo)
- Sin verificación de email (deshabilitada en configuración de Supabase Auth)
- Email utilizado para recuperación de contraseña

#### 4.2.2 Flujo de Registro
1. Usuario completa formulario de registro (username, email, contraseña, confirmar contraseña, checkbox)
2. Validar campos (username único, email único y válido, contraseñas coinciden, checkbox marcado)
3. Crear usuario en auth.users con Supabase Auth
4. Trigger handle_new_user crea registro en profiles automáticamente
5. Iniciar sesión automáticamente
6. Redirigir a Inicio

#### 4.2.3 Flujo de Login
1. Usuario completa formulario de login (username, contraseña)
2. Validar campos
3. Autenticar con Supabase Auth
4. Si exitoso: obtener sesión, actualizar AuthContext, redirigir a Inicio
5. Si falla: mostrar mensaje de error correspondiente

#### 4.2.4 Flujo de Recuperación de Contraseña
1. Usuario hace clic en \"¿Olvidaste tu contraseña?\"
2. Navegar a pantalla de recuperación
3. Usuario ingresa correo electrónico
4. Validar formato de email
5. Enviar enlace de recuperación mediante Supabase Auth
6. Mostrar mensaje de confirmación
7. Usuario recibe email con enlace para restablecer contraseña
8. Usuario hace clic en enlace y establece nueva contraseña

#### 4.2.5 Flujo de Logout
1. Usuario hace clic en \"Cerrar sesión\"
2. Ejecutar signOut de Supabase Auth
3. Limpiar sesión en AuthContext
4. Actualizar header (mostrar botón \"Iniciar sesión\")
5. Redirigir a Inicio

### 4.3 AuthContext

#### 4.3.1 Estado Expuesto
- user: objeto del usuario autenticado (null si no autenticado)
- session: objeto de sesión de Supabase
- loading: booleano indicando si se está cargando el estado de autenticación
- signOut: función para cerrar sesión

#### 4.3.2 Uso en Componentes
- Todos los componentes pueden acceder al estado de autenticación mediante AuthContext
- Componentes que requieren autenticación verifican user !== null

### 4.4 Lógica de Permisos según Estado de Sesión

#### 4.4.1 Usuario NO Autenticado (anon)
- Puede ver todos los eventos (SELECT público)
- Puede ver detalle completo de eventos con descripción
- Puede ver contador de likes
- NO puede dar like (prompt de login)
- NO puede guardar eventos (prompt de login)
- NO puede crear eventos (FAB no visible)
- NO puede editar eventos
- NO puede eliminar eventos
- NO puede enviar mensajes a organizadores (prompt de login)
- Al intentar acceder a funciones de usuario: mostrar prompt de login
- Header muestra botón \"Iniciar sesión\"
- Perfil muestra prompt de login

#### 4.4.2 Usuario Autenticado
- Puede ver todos los eventos
- Puede ver detalle completo de eventos con descripción
- Puede dar like a eventos (incrementar/decrementar contador)
- Puede guardar eventos en su perfil
- Puede ver eventos guardados ordenados por fecha
- Puede crear nuevos eventos con descripción (FAB visible, INSERT permitido)
- Puede editar solo sus propios eventos (UPDATE con verificación user_id = auth.uid())
- Puede eliminar solo sus propios eventos (DELETE con verificación user_id = auth.uid())
- Puede enviar mensajes a organizadores de eventos ajenos
- Puede ver mensajes recibidos en sus propios eventos
- NO puede enviarse mensajes a sí mismo
- Los eventos creados guardan el user_id del creador
- Puede ver sus propios eventos en su perfil
- Puede recuperar contraseña mediante email
- Header muestra avatar con iniciales del username
- Perfil muestra username, eventos guardados ordenados por fecha, eventos creados con botones de editar/eliminar, y botón de cerrar sesión

### 4.5 Filtrado de Eventos
- Al seleccionar \"Todos\": muestra eventos de todas las categorías obtenidos de Supabase
- Al seleccionar \"Académicos\": filtra y muestra solo eventos con categoria = \"Académicos\"
- Al seleccionar \"Culturales\": filtra y muestra solo eventos con categoria = \"Culturales\"
- Al seleccionar \"Deportivos\": filtra y muestra solo eventos con categoria = \"Deportivos\"
- Al seleccionar \"Comercial\": filtra y muestra solo eventos con categoria = \"Comercial\"
- El filtro activo se indica visualmente con color diferenciado
- El título de la sección cambia según el filtro: \"Eventos destacados\" (Todos), \"Eventos Académicos\", \"Eventos Culturales\", \"Eventos Deportivos\", \"Eventos Comerciales\"
- El filtrado se realiza sobre los datos ya obtenidos de Supabase

### 4.6 Carga de Datos
- Al cargar la página de Inicio, se realiza consulta a Supabase para obtener todos los eventos
- Mientras se cargan los datos, mostrar estado de carga
- Si la consulta falla, mostrar mensaje de error
- Los datos obtenidos se almacenan en el estado de la aplicación para filtrado local

### 4.7 Creación de Eventos
- Solo usuarios autenticados pueden crear eventos
- Al abrir el modal de creación, todos los campos están vacíos
- La validación se ejecuta al hacer clic en \"Guardar Evento\"
- Validar formato de fecha (tipo date) y hora (tipo time)
- Validar longitud de descripción (máximo 1000 caracteres)
- Si la URL de imagen está vacía, asignar imagen por defecto según categoría:
  - Académicos: imagen de auditorio/conferencia
  - Culturales: imagen de evento cultural
  - Deportivos: imagen de actividad deportiva
  - Comercial: imagen de evento comercial
- Los avatares se generan automáticamente con colores predeterminados:
  - Académicos: tonos azules
  - Culturales: tonos morados/rosas
  - Deportivos: tonos verdes/naranjas
  - Comercial: tonos amarillos/naranjas
- El user_id se asigna automáticamente desde auth.uid()
- El campo direccion puede quedar vacío (null)
- El campo likes se inicializa en 0
- Después de guardar exitosamente, refrescar la lista de eventos para mostrar el nuevo evento

### 4.8 Edición de Eventos
- Solo usuarios autenticados pueden editar eventos
- Solo se pueden editar eventos propios (user_id = auth.uid())
- Los botones de editar solo aparecen en la página de Perfil, en la lista \"Mis eventos creados\"
- Al abrir el modal de edición, todos los campos se pre-llenan con los valores actuales del evento (incluyendo direccion y descripcion)
- La validación se ejecuta al hacer clic en \"Guardar Cambios\"
- Validar formato de fecha y hora
- Validar longitud de descripción (máximo 1000 caracteres)
- Si la categoría cambia, los avatares se regeneran según la nueva categoría
- La actualización en Supabase verifica tanto en el cliente como en RLS que user_id = auth.uid()
- Después de actualizar exitosamente, refrescar la lista de eventos en el Perfil

### 4.9 Eliminación de Eventos
- Solo usuarios autenticados pueden eliminar eventos
- Solo se pueden eliminar eventos propios (user_id = auth.uid())
- Los botones de eliminar solo aparecen en la página de Perfil, en la lista \"Mis eventos creados\"
- Al hacer clic en eliminar, se muestra un diálogo de confirmación
- El diálogo muestra el título del evento a eliminar
- La eliminación en Supabase verifica tanto en el cliente como en RLS que user_id = auth.uid()
- Al eliminar un evento, se eliminan automáticamente todos los mensajes, likes y guardados asociados (ON DELETE CASCADE)
- Después de eliminar exitosamente, refrescar la lista de eventos en el Perfil

### 4.10 Navegación
- La navegación inferior permite cambiar entre las 4 secciones principales
- Al cambiar de tab, se actualiza el contenido principal
- El tab activo se indica visualmente
- La página de Inicio mantiene el estado del filtro seleccionado al volver desde otras secciones
- Los datos de eventos se mantienen en memoria durante la sesión
- El botón FAB solo es visible en la página de Inicio y solo para usuarios autenticados
- Los botones de editar y eliminar solo son visibles en la página de Perfil y solo para eventos propios
- Al hacer clic en una card de evento desde Inicio o Explorar, se navega a la pantalla de detalle
- La pantalla de detalle incluye botón de volver para regresar a la pantalla anterior

### 4.11 Detalle de Evento
- Cualquier usuario (autenticado o no) puede acceder a la pantalla de detalle
- Se obtiene toda la información del evento desde Supabase mediante el id del evento
- Se muestra la descripción del evento debajo del título
- Se obtiene el username del creador mediante JOIN con tabla profiles usando user_id
- Si el campo direccion es null, no se muestra la sección de dirección
- Se muestra el contador de likes
- Usuario autenticado puede dar like/quitar like
- Usuario NO autenticado ve el contador pero no puede interactuar (prompt de login)
- La sección de mensajes se comporta según el estado de autenticación (ver 3.12.3)

### 4.12 Mensajes al Administrador
- Solo usuarios autenticados pueden enviar mensajes
- Un usuario NO puede enviar mensajes a sus propios eventos (validado en RLS)
- Los mensajes son privados: solo el creador del evento y el remitente pueden verlos
- El creador del evento ve todos los mensajes recibidos de diferentes usuarios
- Un usuario visitante solo ve sus propios mensajes enviados al organizador
- Máximo 500 caracteres por mensaje
- Los mensajes se actualizan en tiempo real mediante Realtime de Supabase
- Al enviar un mensaje, se valida:
  - Usuario autenticado
  - Mensaje no vacío
  - Longitud <= 500 caracteres
  - remitente_id != user_id del evento (no puede enviarse mensajes a sí mismo)
- Después de enviar exitosamente, limpiar textarea y refrescar lista de mensajes

### 4.13 Sistema de Likes
- Cada evento tiene un contador de likes visible para todos los usuarios
- Usuario NO autenticado: puede ver el contador pero no puede dar like (prompt de login)
- Usuario autenticado: puede dar like/quitar like
- Un usuario solo puede dar like una vez por evento (constraint UNIQUE en tabla likes_evento)
- Al dar like:
  - Insertar registro en tabla likes_evento
  - Incrementar contador en tabla eventos
  - Actualizar UI en tiempo real
- Al quitar like:
  - Eliminar registro de tabla likes_evento
  - Decrementar contador en tabla eventos
  - Actualizar UI en tiempo real
- Los likes se actualizan en tiempo real mediante Realtime de Supabase

### 4.14 Sistema de Eventos Guardados
- Usuario autenticado puede guardar eventos para referencia futura
- Al hacer clic en ícono de bookmark:
  - Si no está guardado: insertar en tabla eventos_guardados
  - Si está guardado: eliminar de tabla eventos_guardados
  - Actualizar estado visual del ícono
- En la página de Perfil, sección \"Eventos guardados\":
  - Obtener eventos mediante JOIN entre eventos_guardados y eventos
  - Ordenar por fecha del evento: eventos próximos primero (fecha >= hoy), luego eventos pasados (fecha < hoy)
  - Mostrar información completa del evento
  - Incluir botón para dejar de guardar
- Usuario NO autenticado: guardar localmente sin persistencia

### 4.15 Diseño Responsive
- La aplicación debe adaptarse a diferentes tamaños de pantalla:
  - Móvil (< 768px): diseño de 1 columna, navegación inferior fija
  - Tablet (768px - 1024px): diseño de 2 columnas para cards, navegación inferior fija
  - Desktop (> 1024px): diseño de 3 columnas para cards, navegación puede ser lateral o inferior
- Componentes responsive:
  - Header: se ajusta al ancho de pantalla
  - Filtros de categoría: scroll horizontal en móvil, pueden expandirse en desktop
  - Cards de eventos: 1 columna en móvil, 2-3 columnas en tablet/desktop
  - Modales: se adaptan al tamaño de pantalla, pueden ser bottom sheet en móvil y modal centrado en desktop
  - Formularios: inputs se ajustan al ancho disponible
  - Listas en Perfil: 1 columna en móvil, pueden expandirse en tablet/desktop
  - Detalle de evento: contenido se ajusta al ancho de pantalla
- Uso de Tailwind CSS para implementar diseño responsive mediante breakpoints

## 5. Excepciones y Casos Límite

| Escenario | Comportamiento |
|-----------|----------------|
| Error de conexión con Supabase al cargar eventos | Mostrar mensaje \"No se pudieron cargar los eventos. Intenta nuevamente.\" |
| No hay eventos en la base de datos | Mostrar mensaje \"No hay eventos disponibles\" |
| No hay eventos en una categoría filtrada | Mostrar mensaje \"No hay eventos disponibles\" |
| Scroll horizontal de filtros al final | Indicador visual de que no hay más categorías |
| Click en \"Ver todos →\" | Navegar a vista expandida de eventos de la categoría (placeholder) |
| Click en card de evento | Navegar a pantalla de detalle del evento |
| Click en avatar de usuario en header (autenticado) | Navegar a página de Perfil |
| Click en botón \"Iniciar sesión\" en header (no autenticado) | Abrir pantalla de login/registro |
| Click en ícono de campana | Mostrar notificaciones (placeholder) |
| Carga de datos en progreso | Mostrar indicador de carga, deshabilitar interacción con filtros |
| Campos requeridos vacíos en formulario de evento | Mostrar mensaje \"Por favor completa todos los campos requeridos correctamente\" y no permitir guardado |
| Formato de fecha u hora inválido | Mostrar mensaje de validación del navegador |
| Descripción supera 1000 caracteres | Mostrar mensaje \"La descripción no puede superar los 1000 caracteres\" |
| Error al insertar evento en Supabase | Mostrar mensaje \"Error al crear el evento. Intenta nuevamente.\" |
| Guardado exitoso de evento | Mostrar mensaje \"Evento creado exitosamente\", cerrar modal, refrescar lista |
| Click en botón \"Cancelar\" del formulario | Cerrar modal sin guardar cambios |
| Click fuera del modal | Cerrar modal sin guardar cambios |
| Número de asistentes no es numérico o es 0 | Mostrar error de validación |
| Usuario no autenticado intenta crear evento | FAB no visible, no puede acceder al formulario |
| Campos vacíos en formulario de login | Mostrar mensaje \"Por favor completa todos los campos\" |
| Usuario no existe en login | Mostrar mensaje \"Usuario no encontrado\" |
| Contraseña incorrecta en login | Mostrar mensaje \"Contraseña incorrecta\" |
| Error de conexión en login | Mostrar mensaje \"Error de conexión. Intenta nuevamente.\" |
| Campos vacíos en formulario de registro | Mostrar mensaje \"Por favor completa todos los campos\" |
| Formato de email inválido en registro | Mostrar mensaje \"Por favor ingresa un correo electrónico válido\" |
| Contraseñas no coinciden en registro | Mostrar mensaje \"Las contraseñas no coinciden\" |
| Checkbox no marcado en registro | Mostrar mensaje \"Debes aceptar el Acuerdo de Usuario y la Política de Privacidad\" |
| Usuario ya existe en registro | Mostrar mensaje \"El nombre de usuario ya está en uso\" |
| Correo ya registrado | Mostrar mensaje \"El correo electrónico ya está registrado\" |
| Error al crear usuario en registro | Mostrar mensaje \"Error al crear la cuenta. Intenta nuevamente.\" |
| Campo vacío en recuperación de contraseña | Mostrar mensaje \"Por favor ingresa tu correo electrónico\" |
| Formato de email inválido en recuperación | Mostrar mensaje \"Por favor ingresa un correo electrónico válido\" |
| Correo no registrado en recuperación | Mostrar mensaje \"No existe una cuenta con este correo electrónico\" |
| Envío exitoso de enlace de recuperación | Mostrar mensaje \"Se ha enviado un enlace de recuperación a tu correo electrónico\" |
| Error al enviar enlace de recuperación | Mostrar mensaje \"Error al enviar el enlace. Intenta nuevamente.\" |
| Usuario autenticado accede a página de Perfil | Mostrar username, eventos guardados ordenados por fecha, eventos creados con botones de editar/eliminar, y botón de cerrar sesión |
| Usuario no autenticado accede a página de Perfil | Mostrar prompt de login con botón \"Iniciar sesión\" |
| Usuario sin eventos guardados en Perfil | Mostrar mensaje \"Aún no has guardado eventos\" |
| Usuario sin eventos creados en Perfil | Mostrar mensaje \"Aún no has creado eventos\" |
| Click en \"Cerrar sesión\" | Ejecutar signOut, actualizar header, redirigir a Inicio |
| Click en botón de editar en Perfil | Abrir modal de edición con campos pre-llenados |
| Campos requeridos vacíos en formulario de edición | Mostrar mensaje \"Por favor completa todos los campos requeridos correctamente\" y no permitir guardado |
| Error al actualizar evento en Supabase | Mostrar mensaje \"Error al actualizar el evento. Intenta nuevamente.\" |
| Actualización exitosa de evento | Mostrar mensaje \"Evento actualizado exitosamente\", cerrar modal, refrescar lista en Perfil |
| Click en botón de eliminar en Perfil | Abrir diálogo de confirmación mostrando título del evento |
| Click en \"Cancelar\" en diálogo de eliminación | Cerrar diálogo sin eliminar |
| Click en \"Eliminar\" en diálogo de confirmación | Ejecutar DELETE en Supabase |
| Error al eliminar evento en Supabase | Mostrar mensaje \"Error al eliminar el evento. Intenta nuevamente.\" |
| Eliminación exitosa de evento | Mostrar mensaje \"Evento eliminado exitosamente\", cerrar diálogo, refrescar lista en Perfil |
| Usuario intenta editar evento que no le pertenece | RLS bloquea la operación, mostrar mensaje de error |
| Usuario intenta eliminar evento que no le pertenece | RLS bloquea la operación, mostrar mensaje de error |
| Botones de editar/eliminar en página de Inicio | NO se muestran, solo visibles en Perfil |
| Botones de editar/eliminar en página de Explorar | NO se muestran, solo visibles en Perfil |
| Click en botón de volver en detalle de evento | Regresar a la pantalla anterior (Inicio o Explorar) |
| Error al cargar detalle de evento | Mostrar mensaje \"No se pudo cargar el evento. Intenta nuevamente.\" |
| Evento sin dirección | No mostrar sección de dirección en detalle |
| Usuario no autenticado en detalle de evento | Mostrar prompt de login en sección de mensajes y al intentar dar like |
| Usuario autenticado (no creador) en detalle de evento | Mostrar sus mensajes enviados + campo para nuevo mensaje, puede dar like |
| Usuario creador en detalle de evento | Mostrar todos los mensajes recibidos, sin campo para escribir, puede ver likes |
| Creador sin mensajes recibidos | Mostrar \"Aún no has recibido mensajes\" |
| Campo de mensaje vacío al enviar | Mostrar mensaje \"El mensaje no puede estar vacío\" |
| Mensaje supera 500 caracteres | Mostrar mensaje \"El mensaje no puede superar los 500 caracteres\" |
| Usuario intenta enviar mensaje a su propio evento | RLS bloquea la operación (no permitido) |
| Error al enviar mensaje | Mostrar mensaje \"Error al enviar el mensaje. Intenta nuevamente.\" |
| Envío exitoso de mensaje | Mostrar mensaje \"Mensaje enviado exitosamente\", limpiar textarea, refrescar lista |
| Error al cargar mensajes | Mostrar mensaje \"No se pudieron cargar los mensajes\" |
| Usuario no autenticado intenta dar like | Mostrar prompt de login |
| Usuario autenticado da like por primera vez | Insertar en likes_evento, incrementar contador, actualizar UI |
| Usuario autenticado quita like | Eliminar de likes_evento, decrementar contador, actualizar UI |
| Usuario intenta dar like dos veces al mismo evento | Constraint UNIQUE previene duplicados, mostrar mensaje de error |
| Error al dar like | Mostrar mensaje \"Error al dar like. Intenta nuevamente.\" |
| Error al quitar like | Mostrar mensaje \"Error al quitar like. Intenta nuevamente.\" |
| Usuario no autenticado intenta guardar evento | Guardar localmente sin persistencia |
| Usuario autenticado guarda evento | Insertar en eventos_guardados, actualizar ícono |
| Usuario autenticado deja de guardar evento | Eliminar de eventos_guardados, actualizar ícono |
| Error al guardar evento | Mostrar mensaje \"Error al guardar el evento. Intenta nuevamente.\" |
| Error al dejar de guardar evento | Mostrar mensaje \"Error al dejar de guardar el evento. Intenta nuevamente.\" |
| Eventos guardados sin eventos próximos | Mostrar solo eventos pasados ordenados por fecha descendente |
| Eventos guardados sin eventos pasados | Mostrar solo eventos próximos ordenados por fecha ascendente |
| Aplicación en dispositivo móvil pequeño | Diseño de 1 columna, navegación inferior fija, modales como bottom sheet |
| Aplicación en tablet | Diseño de 2 columnas para cards, navegación inferior fija |
| Aplicación en desktop | Diseño de 3 columnas para cards, navegación puede ser lateral o inferior |
| Cambio de orientación en dispositivo móvil | Diseño se adapta automáticamente |

## 6. Especificaciones de Diseño Visual

### 6.1 Colores
- Fondo principal: púrpura oscuro (#2D1B69)
- Acento: magenta (#d946ef)
- Filtro activo: morado
- Badges de categoría: colores diferenciados por tipo
- Botón FAB: magenta (#d946ef)
- Botones de editar/eliminar: colores diferenciados
- Ícono de corazón (like): rojo cuando activo, gris cuando inactivo
- Ícono de bookmark: amarillo cuando activo, gris cuando inactivo

### 6.2 Tipografía
- Saludo: texto destacado
- Títulos de sección: tamaño medio
- Títulos de eventos: tamaño estándar
- Descripción de eventos: tamaño estándar, color secundario
- Fecha/hora y contador: tamaño pequeño
- Título del modal: tamaño destacado
- Labels de formulario: tamaño estándar
- Contador de caracteres: tamaño pequeño

### 6.3 Componentes Visuales
- Pills/chips de filtros con bordes redondeados
- Cards de eventos con bordes redondeados y sombra sutil
- Avatares circulares superpuestos
- Íconos SVG inline para navegación, categorías y acciones
- Spinner o skeleton para estado de carga
- Botón FAB circular con sombra
- Modal con bordes redondeados superiores (si es bottom sheet)
- Inputs de formulario con bordes y padding
- Input de tipo date para fecha
- Input de tipo time para hora
- Textarea para descripción y mensajes
- Contador de caracteres debajo de textarea
- Botón \"Iniciar sesión\" en header (no autenticado)
- Avatar con iniciales en header (autenticado)
- Botones de editar (ícono de lápiz) y eliminar (ícono de basura/papelera) en lista de eventos del Perfil
- Diálogo de confirmación centrado con fondo oscurecido
- Botón de volver (back) en detalle de evento
- Hero image a tamaño completo en detalle
- Ícono de pin de ubicación para dirección
- Ícono de corazón con contador de likes
- Ícono de bookmark para guardar eventos
- Burbujas de mensajes con avatar y username
- Diseño responsive con breakpoints de Tailwind CSS

### 6.4 Imágenes
- Usar URLs almacenadas en el campo imagen de Supabase
- Imágenes específicas mencionadas:
  - Evento deportivo: imagen en blanco y negro de fútbol
  - Conferencia Tech Summit: auditorio con estudiantes
  - Evento cultural: imagen de carnaval/colores vibrantes
  - Evento comercial: imagen de evento comercial
- Imágenes por defecto según categoría cuando no se provee URL

### 6.5 Restricciones Técnicas
- Tecnologías: Next.js + TypeScript + Tailwind CSS únicamente
- Mobile first (diseño responsive priorizando móvil)
- Sin librerías externas adicionales
- Íconos implementados con SVG inline
- Sin uso de librerías de íconos externas
- Integración con Supabase para lectura, inserción, actualización y eliminación de datos
- Integración con Supabase Auth para autenticación y recuperación de contraseña
- Integración con Supabase Realtime para mensajes y likes en tiempo real
- Uso de breakpoints de Tailwind CSS para diseño responsive

## 7. Criterios de Aceptación

1. El usuario NO autenticado accede a la aplicación y visualiza estado de carga mientras se obtienen los eventos desde Supabase
2. Una vez cargados los datos, el usuario visualiza la página de Inicio con el saludo \"Hola, Invitado 👋\" y el filtro \"Todos\" activo, incluyendo la nueva categoría \"Comercial\"
3. El usuario visualiza la sección \"Eventos destacados\" con eventos obtenidos de Supabase mostrando título, fecha, hora, categoría, dirección (si existe), número de asistentes, contador de likes e ícono de bookmark
4. El usuario hace clic en una card de evento y navega a la pantalla de detalle mostrando imagen completa, título, descripción debajo del título, categoría, fecha, hora, dirección (si existe), asistentes, contador de likes, nombre del creador y sección de mensajes
5. El usuario NO autenticado en detalle de evento visualiza prompt de login en la sección de mensajes y al intentar dar like
6. El usuario NO autenticado hace clic en el botón \"Iniciar sesión\" en el header y se abre la pantalla de login/registro
7. El usuario completa el formulario de registro (username, email, contraseña, confirmar contraseña, checkbox), hace clic en \"Registrarse\", el sistema valida el formato de email, crea la cuenta, crea el perfil automáticamente y redirige a Inicio mostrando el avatar con iniciales en el header
8. El usuario autenticado visualiza el botón FAB \"+\" en la página de Inicio, hace clic y se abre el modal de creación de evento
9. El usuario completa todos los campos requeridos del formulario (título, categoría incluyendo \"Comercial\", fecha usando input tipo date, hora usando input tipo time, descripción, asistentes) y opcionalmente dirección, hace clic en \"Guardar Evento\"
10. El sistema valida los campos incluyendo formato de fecha/hora y longitud de descripción, inserta el nuevo evento en Supabase con el user_id del usuario autenticado, la dirección (si se proveyó) y la descripción, muestra mensaje de éxito, cierra el modal y refresca la lista de eventos mostrando el evento recién creado
11. El usuario autenticado navega a la pestaña Perfil y visualiza su username, la sección \"Eventos guardados\" con eventos ordenados por fecha (próximos primero, luego pasados), la lista de eventos creados por él con descripción, dirección (si existe) y botones de editar y eliminar, y el botón \"Cerrar sesión\"
12. El usuario hace clic en el botón de editar de uno de sus eventos, se abre el modal de edición con los campos pre-llenados (incluyendo dirección y descripción), modifica el título, la descripción y la dirección, hace clic en \"Guardar Cambios\", el sistema valida y actualiza el evento en Supabase, muestra mensaje de éxito, cierra el modal y refresca la lista mostrando el evento actualizado
13. El usuario hace clic en el botón de eliminar de uno de sus eventos, se abre el diálogo de confirmación mostrando el título del evento, hace clic en \"Eliminar\", el sistema elimina el evento y sus mensajes, likes y guardados asociados de Supabase, muestra mensaje de éxito, cierra el diálogo y refresca la lista sin el evento eliminado
14. El usuario autenticado (no creador) accede al detalle de un evento ajeno, visualiza la descripción del evento, sus mensajes enviados previamente, el campo para escribir nuevo mensaje, y puede dar like al evento incrementando el contador
15. El usuario escribe un mensaje de menos de 500 caracteres, hace clic en \"Enviar mensaje\", el sistema inserta el mensaje en Supabase, muestra mensaje de éxito, limpia el textarea y refresca la lista mostrando el nuevo mensaje
16. El usuario creador del evento accede al detalle de su propio evento, visualiza la descripción, todos los mensajes recibidos de diferentes usuarios con username y fecha, el contador de likes, sin campo para escribir (no puede enviarse mensajes a sí mismo)
17. El usuario hace clic en el botón de volver en la pantalla de detalle y regresa a la pantalla anterior (Inicio o Explorar)
18. El usuario autenticado hace clic en el ícono de bookmark de un evento, el sistema guarda el evento en tabla eventos_guardados, actualiza el ícono, y el evento aparece en la sección \"Eventos guardados\" del Perfil ordenado por fecha
19. El usuario autenticado accede a su Perfil y visualiza la sección \"Eventos guardados\" con eventos ordenados por fecha: eventos próximos primero (fecha >= hoy) en orden ascendente, luego eventos pasados (fecha < hoy) en orden descendente
20. El usuario hace clic en \"¿Olvidaste tu contraseña?\" en la pantalla de login, ingresa su correo electrónico, hace clic en \"Enviar enlace de recuperación\", el sistema envía un email mediante Supabase Auth y muestra mensaje de confirmación
21. El usuario accede a la aplicación desde diferentes dispositivos (móvil, tablet, desktop) y visualiza un diseño responsive adaptado a cada tamaño de pantalla
22. El usuario hace clic en \"Cerrar sesión\", el sistema cierra la sesión, actualiza el header mostrando el botón \"Iniciar sesión\" y redirige a Inicio

## 8. Funcionalidades No Implementadas en Esta Versión

- Vista expandida al hacer clic en \"Ver todos →\"
- Funcionalidad completa de las secciones Explorar y Calendario
- Sistema de notificaciones (campana en header)
- Búsqueda de eventos
- Confirmación de asistencia a eventos
- Compartir eventos
- Filtros adicionales (por fecha, ubicación, etc.)
- Integración con calendario del dispositivo
- Notificaciones push
- Modo oscuro/claro
- Internacionalización (i18n)
- Accesibilidad avanzada (ARIA labels completos)
- Animaciones y transiciones complejas
- Paginación de eventos
- Actualización automática de eventos
- Caché de datos offline
- Subida de imágenes desde el dispositivo
- Previsualización de imagen en el formulario
- Cambio de contraseña desde el perfil
- Edición de perfil de usuario (cambiar username, email)
- Roles y permisos avanzados (admin)
- Moderación de eventos
- Reportes de eventos
- Sistema de comentarios públicos en eventos
- Respuestas a mensajes (conversación bidireccional)
- Notificaciones de nuevos mensajes
- Edición o eliminación de mensajes enviados
- Adjuntar archivos o imágenes en mensajes
- Marcar mensajes como leídos/no leídos
- Búsqueda o filtrado de mensajes
- Estadísticas de eventos (vistas, interacciones)
- Sistema de recomendaciones de eventos
- Integración con redes sociales
- Verificación de email en registro