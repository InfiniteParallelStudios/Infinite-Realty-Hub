/**
 * API endpoints configuration
 */
export const endpoints = {
  // Authentication endpoints
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },

  // User endpoints
  users: {
    base: '/users',
    profile: (id: string) => `/users/${id}`,
    update: (id: string) => `/users/${id}`,
    delete: (id: string) => `/users/${id}`,
  },

  // Property endpoints
  properties: {
    base: '/properties',
    detail: (id: string) => `/properties/${id}`,
    create: '/properties',
    update: (id: string) => `/properties/${id}`,
    delete: (id: string) => `/properties/${id}`,
    search: '/properties/search',
  },

  // Listings endpoints
  listings: {
    base: '/listings',
    detail: (id: string) => `/listings/${id}`,
    create: '/listings',
    update: (id: string) => `/listings/${id}`,
    delete: (id: string) => `/listings/${id}`,
    featured: '/listings/featured',
  },

  // Client endpoints
  clients: {
    base: '/clients',
    detail: (id: string) => `/clients/${id}`,
    create: '/clients',
    update: (id: string) => `/clients/${id}`,
    delete: (id: string) => `/clients/${id}`,
  },

  // Health check
  health: '/health',
};
