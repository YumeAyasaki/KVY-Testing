import jetPaths from 'jet-paths';

const Paths = {
  _: '/api',
  Users: {
    _: '/users',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Sellers: {
    _: '/sellers',
    Get: '/all',
    Add: '/add',
    Update: '/update',
    Delete: '/delete/:id',
  },
  Admin: {
    _: '/admin',
    Documents: {
      _: '/documents',
      Get: '/all',
      GetById: '/:id',
      Update: '/update',
    },
    Attempts: {
      _: '/verification-attempts',
      Add: '/add',
      GetByDocument: '/document/:documentId',
    },
  },
} as const;

export const JetPaths = jetPaths(Paths);
export default Paths;
