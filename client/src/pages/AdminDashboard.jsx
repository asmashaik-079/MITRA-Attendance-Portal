import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOutUser } from '../services/authService';

const AdminDashboard = () => {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("Failed to sign out", error);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>Admin Dashboard Placeholder</h1>
      <p>Welcome, {currentUser?.email}</p>
      <p>The admin dashboard will be implemented later.</p>
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Log Out
      </button>
    </div>
  );
};

export default AdminDashboard;
