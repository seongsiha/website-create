const AuthContext = createContext({
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {}
}); 