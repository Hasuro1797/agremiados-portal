export const routes = {
  home: "/",
  autorization: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  checkout: "/checkout",
  agreements: "/convenios",
  reservations: "/alquileres",
  championships: {
    home: "/campeonatos",
    fixture: "/campeonatos/calendario",
  },
  public: {
    termsAndConditions: "/terms-and-conditions",
    privacyPolicy: "/privacy-policy",
  },
  privates: {
    updateData: "/update-data",
    downloadCertificate: "/download-certificate",
  },
  schedule: "/calendario",
  benefits: {
    home: "/beneficios",
    agreements: "/beneficios/convenios",
    reservations: "/beneficios/alquileres",
  },
  surveys: {
    home: "/encuestas",
    survey: "/encuestas/reclamos-quejas-felicitaciones",
    detail: (id: number | string) => `/encuestas/${id}`,
  },
  communications: {
    home: "/comunicados",
    detail: (id: number | string) => `/comunicados/${id}`,
  },
  news: {
    home: "/anuncios",
    detail: (id: number | string) => `/anuncios/${id}`,
  },
  others: {
    home: "/otros",
  },
  activities: {
    home: "/actividades",
    detail: (id: number | string) => `/actividades/${id}`,
  },
  spaces: {
    home: "/espacios",
    detail: (id: number | string) => `/espacios/${id}`,
  },
  myReservations: "/mis-reservas",
};

export const publicAuthRoutes = [
  routes.autorization.signIn,
  routes.autorization.signUp,
  routes.autorization.forgotPassword,
  routes.autorization.resetPassword,
];

export const publicRoutes = [
  routes.public.termsAndConditions,
  routes.public.privacyPolicy,
];

export const privateRoutes = [
  routes.privates.updateData,
  routes.championships.home,
  routes.championships.fixture,
  routes.schedule,
  routes.reservations,
  routes.agreements,
  routes.surveys.home,
  routes.surveys.survey,
  routes.communications.home,
  routes.news.home,
  routes.others.home,
  routes.checkout,
  routes.activities.home,
  routes.activities.detail(":id"),
];
