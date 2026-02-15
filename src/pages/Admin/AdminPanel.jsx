import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import "./AdminPanel.css";

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { state: { from: "/admin" } });
      } else if (!isAdmin) {
        navigate("/");
      }
    }
  }, [user, isAdmin, loading, navigate]);


  // Fetch all users
  const fetchUsers = async () => {
    // Don't fetch if not authenticated
    const token = localStorage.getItem('idToken');
    if (!token) {
      console.log('AdminPanel: No auth token, skipping fetch');
      return;
    }
    
    try {
      setLoadingUsers(true);
      setError("");
      const response = await userAPI.getAllUsers({ limit: 50 });

      console.log("AdminPanel - getAllUsers response:", response);
      
      // Handle different response structures
      if (response.status === 'success' && response.data) {
        setUsers(response.data.users || []);
      } else if (response.success && response.data) {
        setUsers(response.data.users || []);
      } else {
        console.error("Unexpected response structure:", response);
        setError("Failed to load users - unexpected response");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users: " + (err.message || "Unknown error"));
    } finally {
      setLoadingUsers(false);
    }
  };

  // Search users
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoadingUsers(true);
      setError("");
      const data = await userAPI.searchUsers(searchQuery, { limit: 20 });
      setUsers(data.data.users);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Search failed");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Update user role
  const handleRoleChange = async (userId, newRole) => {
    try {
      setError("");
      setSuccessMessage("");
      await userAPI.updateUserRole(userId, newRole);
      setSuccessMessage("Role updated successfully");
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error updating role:", err);
      setError(err.message || "Failed to update role");
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setError("");
      setSuccessMessage("");
      await userAPI.deleteUser(userId);
      setSuccessMessage("User deleted successfully");
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error("Error deleting user:", err);
      setError(err.message || "Failed to delete user");
    }
  };

  useEffect(() => {
    // Only fetch if fully loaded, user exists, and is admin
    if (!loading && user && isAdmin) {
      fetchUsers();
    }
  }, [user, isAdmin, loading]);



  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  if (!user || !isAdmin) {
    return null; // Will redirect
  }


  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users and system settings</p>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {successMessage && <div className="admin-success">{successMessage}</div>}

      <div className="admin-section">
        <h2>User Management</h2>
        
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">Search</button>
          <button type="button" onClick={fetchUsers} className="refresh-btn">
            Refresh All
          </button>
        </form>

        {loadingUsers ? (
          <div className="loading-users">Loading users...</div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-cell">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="user-avatar" />
                        ) : (
                          <div className="user-avatar-placeholder">
                            {user.displayName?.[0] || user.email[0]}
                          </div>
                        )}
                        <span>{user.displayName || "No name"}</span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.role === 'admin' && user.email === 'ghildiyalnitin2007@gmail.com'}
                        className={`role-select role-${user.role}`}
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.email === 'ghildiyalnitin2007@gmail.com'}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-info">
        <h3>Admin Information</h3>
        <p><strong>Logged in as:</strong> {user?.email}</p>
        <p><strong>Role:</strong> Administrator</p>
        <p className="permanent-admin-note">
          * Permanent admin (ghildiyalnitin2007@gmail.com) cannot be deleted or demoted
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;
