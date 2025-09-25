// Development environment configuration
export const environment = {
  production: false,
  
  // API Configuration
  apiUrl: 'http://localhost:3000/api',
  surveyApiUrl: 'http://localhost:3000/api/surveys',
  authApiUrl: 'http://localhost:3000/api/auth',
  
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
    autoSaveInterval: 30000, // 30 seconds
    maxFileSize: 5242880, // 5MB in bytes
    supportedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    supportedDocumentTypes: ['application/pdf', 'text/csv', 'application/json']
  },
  
  // Security Configuration
  security: {
    tokenExpiration: 3600, // 1 hour in seconds
    refreshTokenExpiration: 86400, // 24 hours in seconds
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireStrongPassword: true
  },
  
  // Pagination defaults
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 100,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },
  
  // Survey Configuration
  survey: {
    maxQuestionsPerSurvey: 100,
    maxResponsesPerSurvey: 10000,
    defaultSurveyExpiration: 30, // days
    maxSurveyTitleLength: 100,
    maxSurveyDescriptionLength: 500,
    maxQuestionTitleLength: 200
  },

  // External Services (if any)
  externalServices: {
    googleAnalytics: '',
    sentry: '',
    emailService: ''
  }
};
