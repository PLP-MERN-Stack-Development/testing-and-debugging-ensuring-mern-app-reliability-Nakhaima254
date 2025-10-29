import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock auth - check if user is logged in (simulate session persistence)
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setSession({ user: JSON.parse(storedUser) });
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    // Mock sign in - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    const mockUser = { id: 'mock-user', email };
    setUser(mockUser);
    setSession({ user: mockUser });
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
  };

  const signUp = async (email, password, fullName) => {
    // Mock sign up - simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay

    const mockUser = { id: 'mock-user', email, full_name: fullName };
    setUser(mockUser);
    setSession({ user: mockUser });
    localStorage.setItem('mockUser', JSON.stringify(mockUser));
  };

  const signOut = async () => {
    setUser(null);
    setSession(null);
    localStorage.removeItem('mockUser');
    navigate('/auth');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
