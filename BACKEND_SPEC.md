# Backend Specification for PsicoAmparo

## Overview

Este proyecto frontend ya está diseñado para trabajar con un backend real. El backend debe proveer datos persistentes, autorización y notificaciones, no solo respuestas simuladas.

El documento incluye:

- Modelo de datos principal
- Endpoints públicos
- Endpoints de administrador
- Endpoints de psicólogo
- Autenticación y autorización
- Notificaciones y carga de archivos
- Variables de entorno necesarias

---

## 1. Modelo de datos

### 1.1 Psicologo

- id: String
- nombreCompleto: String
- correo: String (único)
- contrasenaHash: String
- whatsapp: String
- especialidades: String[]
- anosExperiencia: Int
- numeroColegiado: String
- paisResidencia: String
- disponibilidadSemanal: Json?
- bio: String?
- fotoUrl: String?
- fotoIsPublic: Boolean
- estadoPerfil: Enum(`pendiente`, `activo`, `inactivo`)
- rol: Enum(`psicologo`, `admin`)
- fechaRegistro: DateTime
- citas: relación con `Cita`

### 1.2 Paciente

- id: String
- nombreCompleto: String
- genero: Enum(`masculino`, `femenino`)
- correo: String
- whatsapp: String
- estadoVenezuela: String
- motivoConsulta: String
- primeraVez: Boolean
- preferenciaHorario: Enum(`Manana`, `Tarde`, `Noche`)
- formaContactoPreferida: String?
- nivelUrgencia: Enum(`baja`, `media`, `alta`)
- comentariosAdicionales: String?
- fechaRegistro: DateTime
- citas: relación con `Cita`

### 1.3 Cita

- id: String
- pacienteId: String
- psicologoId: String?
- fechaSolicitud: DateTime
- fechaHoraCita: DateTime?
- origenWhatsapp: Enum(`Linea_Principal`, `Linea_Apoyo`, `Web_Directo`)
- estado: Enum(`pendiente_asignar`, `confirmada`, `completada`, `cancelada`)
- notasInternas: String?
- metodoContacto: String
- paciente: relación con `Paciente`
- psicologo: relación con `Psicologo`

### 1.4 PasswordResetToken

- id: String
- token: String (único)
- correo: String
- psicologoId: String
- expiresAt: DateTime
- used: Boolean
- createdAt: DateTime

---

## 2. Endpoints públicos

| Método | Ruta                                 | Propósito                     | Entrada                                                                | Salida                            | Comentarios                                   |
| ------ | ------------------------------------ | ----------------------------- | ---------------------------------------------------------------------- | --------------------------------- | --------------------------------------------- |
| POST   | `/api/auth/login`                    | Login de usuario              | `{ email, password }`                                                  | `{ success, role, estadoPerfil }` | Valida contraseña con bcrypt                  |
| POST   | `/api/signup`                        | Registro de psicólogo         | `{ nombre_completo, correo, password, whatsapp, especialidades, ... }` | `{ success, id }`                 | Crea psicólogo con estado `pendiente`         |
| POST   | `/api/auth/forgot-password`          | Solicitar reset de contraseña | `{ correo }`                                                           | `{ success, message }`            | Crea token y envía email                      |
| GET    | `/api/auth/reset-password?token=...` | Verificar token               | query token                                                            | `{ valid }`                       | Valida existencia/expiración                  |
| POST   | `/api/auth/reset-password`           | Confirmar nueva contraseña    | `{ token, password }`                                                  | `{ success }`                     | Marca token usado                             |
| GET    | `/api/psicologos`                    | Listar psicólogos públicos    | `especialidad`, `search`, `activos`                                    | Lista de psicólogos               | Filtra `rol=psicologo`, `estadoPerfil=activo` |
| POST   | `/api/pacientes`                     | Crear paciente + cita         | `{ nombre_completo, correo, motivo_consulta, psicologo_id?, ... }`     | `{ success, id }`                 | Crea paciente y cita, envía email             |
| POST   | `/api/upload/presigned`              | Generar URL de upload         | `{ fileName, contentType, isPublic }`                                  | URL de upload pre-firmada         | Requiere auth                                 |

---

## 3. Endpoints de administrador

| Método | Ruta                               | Propósito                    | Autorización | Comentarios                                                       |
| ------ | ---------------------------------- | ---------------------------- | ------------ | ----------------------------------------------------------------- |
| GET    | `/api/admin/stats`                 | Métricas generales           | Admin        | Pacientes, psicólogos activos, citas completadas/pendientes, tasa |
| GET    | `/api/admin/citas`                 | Listar todas las citas       | Admin        | Incluye datos de paciente y psicólogo                             |
| POST   | `/api/admin/citas/asignar`         | Asignar cita a psicólogo     | Admin        | Actualiza estado a `confirmada` y notifica                        |
| GET    | `/api/admin/administradores`       | Listar administradores       | Admin        | Oculta cuenta de prueba y añade flags                             |
| POST   | `/api/admin/administradores`       | Crear admin                  | Admin        | Crea rol admin                                                    |
| PATCH  | `/api/admin/administradores`       | Actualizar admin             | Admin        | Modifica datos y contraseña                                       |
| DELETE | `/api/admin/administradores`       | Eliminar admin               | Admin        | No elimina cuentas protegidas                                     |
| GET    | `/api/admin/psicologos`            | Listar psicólogos            | Admin        | Excluye hash de password                                          |
| POST   | `/api/admin/psicologos/crear`      | Crear psicólogo              | Admin        | Crea psicólogo activo                                             |
| POST   | `/api/admin/psicologos/actualizar` | Actualizar psicólogo         | Admin        | Ajusta campos, correo, contraseña                                 |
| POST   | `/api/admin/psicologos/eliminar`   | Eliminar psicólogo           | Admin        | Evita eliminar si tiene citas                                     |
| POST   | `/api/admin/psicologos/estado`     | Cambiar estado del psicólogo | Admin        | Envío email si se activa                                          |
| GET    | `/api/admin/pacientes/export`      | Exportar pacientes           | Admin        | Genera Excel con datos y citas                                    |

---

## 4. Endpoints de psicólogo

| Método | Ruta                          | Propósito                    | Autorización | Comentarios                            |
| ------ | ----------------------------- | ---------------------------- | ------------ | -------------------------------------- |
| GET    | `/api/psicologo/perfil`       | Obtener perfil del psicólogo | Auth         | Retorna datos del psicólogo actual     |
| PUT    | `/api/psicologo/perfil`       | Actualizar perfil            | Auth         | Bio, disponibilidad, foto, visibilidad |
| GET    | `/api/psicologo/citas`        | Listar citas del psicólogo   | Auth         | Solo citas asignadas a él/ella         |
| POST   | `/api/psicologo/citas/estado` | Cambiar estado de cita       | Auth         | Solo cita propia                       |

---

## 5. Autenticación y autorización

El backend debe manejar:

- Autenticación de psicólogos y administradores
- Sesiones o tokens para proteger rutas administradas
- Validar que solo usuarios con rol `admin` accedan a `/api/admin/*`
- Validar que solo el psicólogo dueño acceda a `/api/psicologo/*`

### Recomendaciones

- Auth por JWT o sesiones según tecnología elegida.
- Para login, compara `password` con hash bcrypt.
- Para signup y reset, siempre hash de contraseñas con bcrypt.

---

## 6. Notificaciones y correo

El backend actual envía emails para:

- Solicitud de cita recibida (`/api/pacientes`)
- Asignación de cita a psicólogo (`/api/admin/citas/asignar`)
- Confirmación de cita al paciente (`/api/admin/citas/asignar`)
- Aprobación de psicólogo (`/api/admin/psicologos/estado`)
- Restablecimiento de contraseña (`/api/auth/forgot-password`)

Debe soportar un servicio de envío de correo o notificaciones, y manejar posibles variables de entorno de envío.

---

## 7. Variables de entorno necesarias

| Variable                                      | Uso                                      |
| --------------------------------------------- | ---------------------------------------- |
| `DATABASE_URL`                                | Conexión a PostgreSQL                    |
| `NEXTAUTH_URL`                                | URL base de la app para enlaces de reset |
| `NOTIF_ID_SOLICITUD_DE_CITA_RECIBIDA`         | Email de confirmación de cita            |
| `NOTIF_ID_CITA_ASIGNADA_A_PSICLOGO`           | Email a psicólogo asignado               |
| `NOTIF_ID_CITA_ASIGNADA_NOTIFICACIN_PACIENTE` | Email al paciente                        |
| `NOTIF_ID_PSICLOGO_APROBADO`                  | Email de aprobación de psicólogo         |

---

## 8. Consideraciones adicionales

- El seed actual crea solo cuentas administrativas de prueba, no datos de psicólogos o pacientes de ejemplo.
- El frontend espera una API REST con rutas claras y JSON estándar.
- La carga de fotos usa URL prefirmadas y almacenamiento externo.
- Es importante mantener el mismo formato de respuesta para evitar cambios en el frontend.

---

## 9. Resumen rápido de tablas necesarias

### Tabla: `psicologos`

Campos principales:

- `id`, `nombreCompleto`, `correo`, `contrasenaHash`, `whatsapp`, `especialidades`, `anosExperiencia`, `numeroColegiado`, `paisResidencia`, `disponibilidadSemanal`, `bio`, `fotoUrl`, `fotoIsPublic`, `estadoPerfil`, `rol`, `fechaRegistro`

### Tabla: `pacientes`

Campos principales:

- `id`, `nombreCompleto`, `genero`, `correo`, `whatsapp`, `estadoVenezuela`, `motivoConsulta`, `primeraVez`, `preferenciaHorario`, `formaContactoPreferida`, `nivelUrgencia`, `comentariosAdicionales`, `fechaRegistro`

### Tabla: `citas`

Campos principales:

- `id`, `pacienteId`, `psicologoId`, `fechaSolicitud`, `fechaHoraCita`, `origenWhatsapp`, `estado`, `notasInternas`, `metodoContacto`

### Tabla: `password_reset_tokens`

Campos principales:

- `id`, `token`, `correo`, `psicologoId`, `expiresAt`, `used`, `createdAt`
