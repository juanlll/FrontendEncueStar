# EncueStar 📊

Aplicación Angular para la creación y gestión de encuestas con autenticación de usuarios.

![Angular](https://img.shields.io/badge/Angular-17.3.12-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-3.4.1-purple.svg)

## � Funcionalidades

- **🏠 Home**: Página principal con buscador de encuestas por UUID
- **🔐 Login**: Sistema de autenticación de usuarios
- **📝 Register**: Registro de nuevos usuarios
- **🛠️ Creator**: Editor visual para crear encuestas personalizadas

## 🚀 Tecnologías

- **Angular 17.3.12** - Framework principal
- **TypeScript 5.4.5** - Lenguaje de programación
- **Bootstrap 3.4.1** - Estilos y componentes UI
- **SurveyJS** - Motor de encuestas y editor

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/juanlll/FrontedEncueStar.git
   cd FrontedEncueStar
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar aplicación**
   ```bash
   npm start
   ```

4. **Abrir en navegador**: `http://localhost:4200`

## 💻 Uso

- **Home** (`/`): Buscar encuestas ingresando el UUID
- **Login** (`/login`): Iniciar sesión con credenciales
- **Register** (`/register`): Crear nueva cuenta de usuario  
- **Creator** (`/creator`): Crear y editar encuestas

## 📁 Estructura

```
src/app/
├── auth/                 # Autenticación
│   ├── login.component   # Página de login
│   └── register.component # Página de registro
├── pages/               # Páginas principales
│   ├── home.page        # Página de inicio
│   └── creator.page     # Editor de encuestas
└── components/          # Componentes
    └── survey-creator/  # Creator de encuestas
```

##  Autor

**Juan Vargas** - [@juanlll](https://github.com/juanlll)
