# EncueStar 📊

Una aplicación Angular moderna y elegante para la creación, gestión y análisis de encuestas con una interfaz de usuario intuitiva y efectos visuales avanzados.

![Angular](https://img.shields.io/badge/Angular-17.3.12-red.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4.5-blue.svg)
![Bootstrap](https://img.shields.io/badge/Bootstrap-3.4.1-purple.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## ✨ Características Principales

### 🎨 Interfaz de Usuario Moderna
- **Diseño Glassmorphism**: Efectos de vidrio translúcido con blur y transparencias
- **Animaciones SVG**: Gráficos animados de barras, círculos, líneas y burbujas
- **Responsive Design**: Adaptable a dispositivos móviles y escritorio
- **Paleta de Colores**: Esquema de colores turquesa/verde olivo (#19b394)

### 📋 Gestión de Encuestas
- **Creador de Encuestas**: Interface visual para crear encuestas personalizadas
- **Buscador por UUID**: Acceso rápido a encuestas mediante identificador único
- **Múltiples Tipos de Pregunta**: Soporte para diversos formatos de preguntas
- **Vista Previa**: Visualización en tiempo real durante la creación

### 📊 Analytics y Reportes
- **Visualización de Datos**: Gráficos interactivos con SurveyJS Analytics
- **Exportación**: Generación de reportes en PDF y Excel
- **Tablas Dinámicas**: Análisis de datos con DataTables
- **Métricas en Tiempo Real**: Dashboard con estadísticas actualizadas

### 🔒 Autenticación
- **Sistema de Login**: Autenticación segura de usuarios
- **Registro de Usuarios**: Proceso de registro simplificado
- **Gestión de Sesiones**: Control de acceso y permisos

## 🚀 Tecnologías Utilizadas

### Frontend Framework
- **Angular 17.3.12** - Framework principal
- **TypeScript 5.4.5** - Lenguaje de programación
- **RxJS 7.4.0** - Programación reactiva

### UI/UX Libraries
- **Bootstrap 3.4.1** - Framework CSS
- **Bootstrap Icons** - Iconografía
- **Custom CSS** - Estilos personalizados con glassmorphism

### Survey Engine
- **SurveyJS Core** - Motor de encuestas
- **Survey Creator Angular** - Editor visual de encuestas
- **Survey Analytics** - Visualización de datos
- **Survey PDF** - Exportación a PDF

### Data Visualization
- **DataTables.net** - Tablas interactivas
- **Chart.js** (vía SurveyJS) - Gráficos y visualizaciones
- **jsPDF** - Generación de PDF
- **XLSX** - Exportación a Excel

### Additional Tools
- **jQuery 3.7.1** - Manipulación DOM
- **Ace Editor** - Editor de código
- **CKEditor 4** - Editor de texto enriquecido

## 📦 Instalación

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn
- Angular CLI

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/juanlll/FrontedEncueStar.git
   cd FrontedEncueStar
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar entorno**
   ```bash
   # Copiar archivo de configuración
   cp src/environments/environment.ts src/environments/environment.local.ts
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   # o
   ng serve
   ```

5. **Abrir en navegador**
   ```
   http://localhost:4200
   ```

## 🎯 Uso

### Buscar Encuesta
1. Accede a la página principal
2. Ingresa el UUID de la encuesta en el campo de búsqueda
3. Haz clic en "Acceder a la encuesta"

### Crear Nueva Encuesta
1. Navega a `/creator`
2. Utiliza el editor visual para diseñar tu encuesta
3. Configura preguntas, opciones y lógica de navegación
4. Guarda y publica tu encuesta

### Ver Analytics
1. Accede a una encuesta existente
2. Navega a la sección de analytics
3. Visualiza gráficos, tablas y estadísticas
4. Exporta reportes en PDF o Excel

## 🏗️ Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                    # Módulo de autenticación
│   │   ├── auth.service.ts      # Servicio de autenticación
│   │   ├── login.component.*    # Componente de login
│   │   └── register.component.* # Componente de registro
│   ├── components/              # Componentes reutilizables
│   │   ├── survey.component.*   # Componente principal de encuesta
│   │   ├── survey.analytics.*   # Componente de analytics
│   │   └── survey-creator/      # Editor de encuestas
│   ├── models/                  # Modelos de datos
│   │   ├── survey.model.ts      # Modelo de encuesta
│   │   ├── question.model.ts    # Modelo de pregunta
│   │   └── todo.model.ts        # Modelo auxiliar
│   ├── pages/                   # Páginas principales
│   │   ├── home.page.*          # Página de inicio
│   │   ├── creator.page.*       # Página del creador
│   │   └── survey.page.*        # Página de encuesta
│   ├── app.component.*          # Componente raíz
│   ├── app.module.ts            # Módulo principal
│   └── app.routing.module.ts    # Configuración de rutas
├── assets/                      # Recursos estáticos
├── environments/                # Configuraciones de entorno
└── styles.css                   # Estilos globales
```

## 🔧 Scripts Disponibles

```bash
npm start          # Ejecutar en modo desarrollo
npm run build      # Compilar para producción
npm test           # Ejecutar tests unitarios
npm run lint       # Verificar código con linter
npm run e2e        # Ejecutar tests end-to-end
```

## 🌐 Configuración de Entorno

### Development
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  surveyApiUrl: 'http://localhost:3000/surveys'
};
```

### Production
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.encuestar.com',
  surveyApiUrl: 'https://api.encuestar.com/surveys'
};
```

## 🎨 Personalización de Temas

El proyecto utiliza un sistema de colores personalizable basado en CSS custom properties:

```css
:root {
  --primary-color: #19b394;
  --secondary-color: #26c6a4;
  --accent-color: #0e8b6f;
  --background-gradient: linear-gradient(135deg, #19b394, #0d8068);
}
```

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints Bootstrap**: Utiliza el sistema de grillas de Bootstrap
- **Touch Friendly**: Interfaces táctiles optimizadas
- **Progressive Enhancement**: Funcionalidad mejorada en dispositivos modernos

## 🔒 Seguridad

- **Validación de Entrada**: Sanitización de datos de usuario
- **Autenticación JWT**: Tokens seguros para sesiones
- **HTTPS Only**: Comunicación cifrada en producción
- **Content Security Policy**: Prevención de ataques XSS

## 📊 Performance

- **Lazy Loading**: Carga diferida de módulos
- **OnPush Strategy**: Optimización de detección de cambios
- **Bundle Optimization**: Código optimizado para producción
- **CDN Ready**: Preparado para distribución via CDN

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Changelog

### v1.1.0 (Actual)
- ✨ Implementación de efectos glassmorphism
- 🎨 Nuevo sistema de animaciones SVG
- 📊 Integración completa de SurveyJS Analytics
- 🔧 Actualización a Angular 17.3.12
- 🎯 Mejoras en la experiencia de usuario

### v1.0.0
- 🎉 Lanzamiento inicial
- 📋 Creador básico de encuestas
- 🔍 Sistema de búsqueda por UUID
- 🔒 Autenticación de usuarios

## 🐛 Reporte de Bugs

Si encuentras algún bug, por favor crea un issue en [GitHub Issues](https://github.com/juanlll/FrontedEncueStar/issues) con:

- Descripción detallada del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es aplicable
- Información del navegador y sistema operativo

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autor

**Juan Vargas** - [@juanlll](https://github.com/juanlll)

## 🙏 Agradecimientos

- [SurveyJS](https://surveyjs.io/) por el excelente motor de encuestas
- [Angular Team](https://angular.io/) por el framework
- [Bootstrap](https://getbootstrap.com/) por los componentes UI
- [Bootstrap Icons](https://icons.getbootstrap.com/) por la iconografía

---

<div align="center">
  <p>Hecho con ❤️ y ☕ por Juan Vargas</p>
  <p>
    <a href="https://github.com/juanlll/FrontedEncueStar">⭐ Star este repo si te gusta!</a>
  </p>
</div>
