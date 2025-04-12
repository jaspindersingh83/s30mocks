import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionType, setActionType] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const usersPerPage = 10;

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/users', {
        params: {
          page: currentPage,
          limit: usersPerPage,
          search: searchTerm,
          role: roleFilter !== 'all' ? roleFilter : undefined
        }
      });
      
      setUsers(res.data.users);
      setTotalPages(Math.ceil(res.data.total / usersPerPage));
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  // Handle role change
  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    try {
      const newRole = actionType === 'promote' ? 'interviewer' : 'candidate';
      
      await axios.put(`/api/admin/users/${selectedUser._id}/role`, {
        role: newRole
      });
      
      // Update local state
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, role: newRole } : user
      ));
      
      setSuccessMessage(`User ${selectedUser.name} has been ${actionType === 'promote' ? 'promoted to interviewer' : 'demoted to candidate'}.`);
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Close modal
      setModalOpen(false);
      setSelectedUser(null);
      setActionType('');
    } catch (err) {
      setError('Failed to update user role. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Open modal for role change confirmation
  const openRoleChangeModal = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setModalOpen(true);
  };

  // Pagination handlers
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Render role badge
  const renderRoleBadge = (role) => {
    return (
      <span className={`role-badge ${role}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  if (loading && users.length === 0) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div className="user-management-container">
      <h2>User Management</h2>
      
      {successMessage && <div className="message success">{successMessage}</div>}
      {error && <div className="message error">{error}</div>}
      
      <div className="user-filters">
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="interviewer">Interviewer</option>
          <option value="candidate">Candidate</option>
        </select>
      </div>
      
      {users.length === 0 ? (
        <div className="no-users">No users found matching your criteria.</div>
      ) : (
        <>
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{renderRoleBadge(user.role)}</td>
                  <td className="user-actions">
                    {user.role === 'candidate' && (
                      <button 
                        className="promote-button"
                        onClick={() => openRoleChangeModal(user, 'promote')}
                      >
                        Promote to Interviewer
                      </button>
                    )}
                    
                    {user.role === 'interviewer' && (
                      <button 
                        className="demote-button"
                        onClick={() => openRoleChangeModal(user, 'demote')}
                      >
                        Demote to Candidate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="pagination">
            <button 
              onClick={() => goToPage(1)} 
              disabled={currentPage === 1}
            >
              First
            </button>
            <button 
              onClick={() => goToPage(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              Prev
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show pages around current page
              const pageNum = Math.max(1, Math.min(
                currentPage - 2 + i, 
                totalPages - Math.min(4, totalPages) + i + 1
              ));
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={currentPage === pageNum ? 'active' : ''}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => goToPage(currentPage + 1)} 
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button 
              onClick={() => goToPage(totalPages)} 
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </>
      )}
      
      {/* Confirmation Modal */}
      {modalOpen && selectedUser && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{actionType === 'promote' ? 'Promote User' : 'Demote User'}</h3>
              <button className="close-button" onClick={() => setModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to {actionType === 'promote' ? 'promote' : 'demote'} <strong>{selectedUser.name}</strong> 
                {actionType === 'promote' 
                  ? ' from candidate to interviewer?' 
                  : ' from interviewer to candidate?'}
              </p>
              {actionType === 'demote' && (
                <p className="warning">
                  This will revoke their interviewer privileges and they will no longer be able to conduct interviews.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="cancel-button" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="confirm-button" onClick={handleRoleChange}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
