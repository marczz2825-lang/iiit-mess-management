import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState('student'); // 'student' or 'admin'
  const [currentStudent, setCurrentStudent] = useState(null);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadSession = async () => {
    try {
      const data = await api.getSession();
      setRole(data.role);
      setCurrentStudent(data.currentStudent);
      setAllStudents(data.allStudents || []);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const switchRole = async (newRole, studentId) => {
    try {
      const res = await api.switchSession(newRole, studentId || currentStudent?.id);
      setRole(res.role);
      setCurrentStudent(res.currentStudent);
      showToast(`Switched view to ${newRole === 'admin' ? 'Mess Manager / Admin' : res.currentStudent?.name}`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentStudent,
        allStudents,
        loading,
        toast,
        showToast,
        switchRole,
        refreshSession: loadSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
