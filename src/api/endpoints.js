export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
  },
  USER: (() => {
    return {
      GET_BY_ID: (id) => `/api/user/${id}`,
    };
  })(),
  PARKING: (() => {
    const BASE = '/api/parking';
    return {
      BASE,
      CREATE: `${BASE}/createParking`,
      GET_ALL: `${BASE}/getAllParking`,
      GET_BY_USER: `${BASE}/getUserParkings`,
      GET_BY_ID: (id) => `${BASE}/${id}`,
      UPDATE: (id) => `${BASE}/updateParking/${id}`,
      DELETE: (id) => `${BASE}/${id}`,
      CHECK_AVAILABILITY: '/api/parking/check/availability',
      SUMMARY_DASHBOARD: '/api/parking/dashboard/host-summary'
    };
  })(),
  BOOKINGS: (() => {
    return {
      GET_BY_PARKING: (id) => `/api/booking/byParking/${id}`,
      CREATE_BOOKING: 'api/booking/createBooking',
      GET_BY_USER: (id) => `api/booking/user/${id}`,
      CANCEL: (id) => `api/booking/cancel/${id}`,
      GET_BY_OWNER: (id) => `api/booking/owner/${id}`,
      CONFIRM: (id, plateNumber) => `api/booking/confirm/${id}/${plateNumber}`,
      UNMATCHED_CHECK:  (id, plateNumber) => `api/booking/unmatched-checkin/${id}/${plateNumber}`,
      UNMATCHED_CHECKINS: (ownerId) => `/api/booking/unmatched-checkins/${ownerId}`,
      MARK_VISITED: '/api/booking/mark-visited'
    };
  })(),

  PAYMENT: (() => {
    const BASE = '/stripe/payment';
    return {
      ADD_CARD: `${BASE}/add`,           // POST with params: cardNumber, expMonth, expYear, cvc, email
      CHARGE_CARD: `${BASE}/charge`,    // POST with body: PaymentRequest object
      MAKE_PAYMENT: `${BASE}/make-payment`, // POST with params: paymentMethodId, amount, customerId
    };
  })(),
};
