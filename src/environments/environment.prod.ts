// Production environment configuration
export const environment = {
  production: true,
  
  // API Configuration - Update these URLs for production
  apiUrl: 'https://api.encuestar.com/api',
  surveyApiUrl: 'https://api.encuestar.com/api/surveys',
  authApiUrl: 'https://api.encuestar.com/api/auth',
  
  // Application Configuration
  appName: 'EncueStar',
  appVersion: '1.1.0',
  
  // Feature Flags
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableFileUpload: true,
    enableSurveyTemplates: true,
    enableAdvancedQuestions: true
  },
  
  // UI Configuration
  ui: {
    defaultTheme: 'light',
    enableAnimations: true,
    autoSave: true,
    autoSaveInterval: 60000, // 1 minute in production
    maxFileSize: 10485760, // 10MB in bytes for production
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedDocumentTypes: ['application/pdf', 'text/csv', 'application/json']
  },
  
  // Security Configuration
  security: {
    tokenExpiration: 3600, // 1 hour
    refreshTokenExpiration: 86400, // 24 hours
    maxLoginAttempts: 3, // Stricter in production
    passwordMinLength: 8,
    requireStrongPassword: true
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 20, // Larger default for production
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100]
  },
  
  // Survey Configuration
  survey: {
    maxQuestionsPerSurvey: 500, // More capacity in production
    maxResponsesPerSurvey: 100000, // More capacity in production
    defaultSurveyExpiration: 90, // 3 months
    maxSurveyTitleLength: 100,
    maxSurveyDescriptionLength: 500,
    maxQuestionTitleLength: 200
  },

  // External Services
  externalServices: {
    googleAnalytics: 'G-XXXXXXXXXX', // Add your GA tracking ID
    sentry: 'https://your-sentry-dsn@sentry.io/project-id',
    emailService: 'https://api.sendgrid.com/v3' // Or your email service
  }
};
