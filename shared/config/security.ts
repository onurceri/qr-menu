export const contentSecurityPolicy = {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "https://*.googleapis.com",
        "https://apis.google.com",
        "https://unpkg.com"
      ],
      connectSrc: [
        "'self'",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "https://*.googleapis.com",
        "https://apis.google.com"
      ],
      frameSrc: [
        "'self'",
        "https://*.firebaseio.com",
        "https://*.firebase.com",
        "https://*.googleapis.com",
        "https://apis.google.com"
      ]
    }
  };