import React, { useState, useEffect } from 'react';
import { userService } from '../../api/services/userService';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import '../../styles/DashboardForms.css';

const UsersPage = () => {
    const { user: currentUser } = useAuth();
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [usersCurrentPage, setUsersCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const [maxId, setMaxId] = useState(0);
    const entriesPerPage = 10;

    // Form state
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        address: '',
        role: 'USER',
        isActive: true
    });
    const [passwordStrength, setPasswordStrength] = useState({ label: '', color: '' });

    // Email validation state
    const [emailStatus, setEmailStatus] = useState({ message: '', available: null });

    // Search state
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const checkEmail = async () => {
            if (!newUser.email) {
                setEmailStatus({ message: '', available: null });
                return;
            }

            // If editing and email is same as original, it's available
            if (isEditing && editingUserId) {
                const originalUser = registeredUsers.find(u => u.id === editingUserId);
                if (originalUser && originalUser.email === newUser.email) {
                    setEmailStatus({ message: 'Current email', available: true });
                    return;
                }
            }

            // Capital letter check
            if (/[A-Z]/.test(newUser.email)) {
                setEmailStatus({ message: 'Only small case letters are allowed', available: false });
                return;
            }

            // Basic format check before backend call
            const emailRegex = /^[a-z0-9+_.-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
            if (!emailRegex.test(newUser.email)) {
                setEmailStatus({ message: 'Invalid email format', available: false });
                return;
            }

            try {
                const data = await userService.checkEmailExists(newUser.email);
                setEmailStatus({
                    message: data.message,
                    available: !data.exists && data.valid
                });
            } catch (error) {
                console.error("Email check failed:", error);
                setEmailStatus({ message: 'Error checking email', available: null });
            }
        };

        const timer = setTimeout(() => {
            if (newUser.email) checkEmail();
        }, 500);

        return () => clearTimeout(timer);
    }, [newUser.email, isEditing, editingUserId, registeredUsers]);

    // Password strength check
    useEffect(() => {
        const checkStrength = (pass) => {
            if (!pass || pass === 'DUMMY_PASSWORD') return { label: '', color: '' };

            let score = 0;
            if (pass.length >= 8) score++;
            if (/[A-Z]/.test(pass)) score++;
            if (/[a-z]/.test(pass)) score++;
            if (/[0-9]/.test(pass)) score++;
            if (/[^A-Za-z0-9]/.test(pass)) score++;

            if (pass.length < 6) return { label: 'Weak', color: '#e53e3e' };
            if (score <= 2) return { label: 'Weak', color: '#e53e3e' };
            if (score <= 4) return { label: 'Medium', color: '#d69e2e' };
            return { label: 'Strong', color: '#38a169' };
        };

        setPasswordStrength(checkStrength(newUser.password));
    }, [newUser.password]);

    // Backend filtering and pagination
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers(searchTerm, usersCurrentPage);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm, usersCurrentPage]);

    // Reset to page 1 when searching
    useEffect(() => {
        setUsersCurrentPage(1);
    }, [searchTerm]);

    const fetchUsers = async (search = '', page = 1) => {
        try {
            const response = await userService.getUsers(search, page - 1, entriesPerPage);
            const data = response.data;

            const userList = data.content || [];
            setRegisteredUsers(userList);
            setTotalPages(data.totalPages || 1);
            setTotalElements(data.totalElements || 0);

            if (!search && userList.length > 0) {
                const highestId = Math.max(...userList.map(u => u.id || 0));
                setMaxId(prev => Math.max(prev, highestId));
            } else if (!search && registeredUsers.length === 0) {
                setMaxId(100);
            }
        } catch (err) {
            console.warn("Registered Users Fetch Failed, using mock fallback:", err);
            let mockUsers = [
                { id: 105, name: 'Vikram Singh', email: 'vikram.s@example.com', createdDate: '2026-04-14T16:45:00Z', role: 'OPERATOR', isActive: true },
                { id: 104, name: 'Priya Joshi', email: 'priya.j@example.com', createdDate: '2026-04-13T14:20:00Z', role: 'USER', isActive: true },
                { id: 103, name: 'Amit Kumar', email: 'amit.k@example.com', createdDate: '2026-04-12T09:15:00Z', role: 'OPERATOR', isActive: false },
                { id: 102, name: 'Sita Devi', email: 'sita.d@example.com', createdDate: '2026-04-11T12:30:00Z', role: 'ADMIN', isActive: true },
                { id: 101, name: 'Rahul Verma', email: 'rahul.v@example.com', createdDate: '2026-04-10T10:00:00Z', role: 'USER', isActive: true }
            ];

            if (search) {
                const term = search.toLowerCase();
                mockUsers = mockUsers.filter(u => 
                    u.name.toLowerCase().includes(term) || 
                    u.email.toLowerCase().includes(term) ||
                    `U-${u.id}`.toLowerCase().includes(term)
                );
            }

            setRegisteredUsers(mockUsers);
            setTotalPages(1);
            setTotalElements(mockUsers.length);
            if (!search) setMaxId(105);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'email') {
            if (/[A-Z]/.test(value)) {
                setEmailStatus({ message: 'Only small case letters are allowed', available: false });
            } else if (emailStatus.message === 'Only small case letters are allowed') {
                setEmailStatus({ message: '', available: null });
            }
        }

        setNewUser(prev => ({ ...prev, [name]: value }));
    };

    const generatePassword = () => {
        if (!newUser.name.trim()) {
            Swal.fire({
                icon: 'info',
                title: 'Name Required',
                text: 'Please enter the user name first to generate a password.',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        const cleanName = newUser.name.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
        let namePart = cleanName.substring(0, 3);

        if (namePart.length > 0) {
            namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
        }

        if (namePart.length < 3) {
            namePart = (namePart + "Kumbh").substring(0, 3);
            namePart = namePart.charAt(0).toUpperCase() + namePart.slice(1).toLowerCase();
        }

        const nextSerial = (maxId + 1).toString();
        let generated = `${namePart}@${nextSerial}#`;

        if (generated.length < 8) {
            generated = generated.replace('#', '!!#');
        }

        if (generated.length > 12) {
            const allowedSerialLength = 12 - (namePart.length + 2);
            generated = `${namePart}@${nextSerial.substring(0, allowedSerialLength)}#`;
        }
        
        setNewUser(prev => ({ ...prev, password: generated }));
    };

    const handleReset = () => {
        setNewUser({ name: '', email: '', password: '', address: '', role: 'USER', isActive: true });
        setEmailStatus({ message: '', available: null });
        setIsEditing(false);
        setEditingUserId(null);
    };

    const handleEditClick = (user) => {
        setNewUser({
            name: user.name || user.fullName || '',
            email: user.email || '',
            password: 'DUMMY_PASSWORD',
            address: user.address || '',
            role: user.role || 'USER',
            isActive: user.isActive !== false
        });
        setIsEditing(true);
        setEditingUserId(user.id);
        document.querySelector('.admin-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteClick = async (user) => {
        const userName = user.name || user.fullName || 'User';
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `This will mark user ${userName} as INACTIVE.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, deactivate!'
        });

        if (result.isConfirmed) {
            try {
                const payload = {
                    name: user.name || user.fullName || '',
                    email: user.email || '',
                    address: user.address || '',
                    role: (user.role || 'USER').toUpperCase(),
                    isActive: false
                };
                await userService.updateUser(user.id, payload);
                Swal.fire(
                    'Deactivated!',
                    'User status has been set to INACTIVE.',
                    'success'
                );
                fetchUsers(searchTerm, usersCurrentPage);
            } catch (error) {
                console.error("Deactivation error:", error);
                const errorMessage = error.response?.data?.message || 'Failed to deactivate user.';
                Swal.fire('Error!', errorMessage, 'error');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newUser.name || !newUser.email || (!isEditing && !newUser.password) || !newUser.address) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Please fill in all required fields.',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        if (newUser.name.trim().length < 2) {
            Swal.fire({
                icon: 'error',
                title: 'Validation Error',
                text: 'Full Name must be at least 2 characters long.',
                confirmButtonColor: '#4a2a18'
            });
            return;
        }

        if (!isEditing) {
            const pass = newUser.password;
            const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\S+$).{8,12}$/;
            if (!passwordRegex.test(pass)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Password',
                    text: 'Password must be 8-12 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character (@#$%^&+=!). Whitespaces are not allowed.',
                    confirmButtonColor: '#4a2a18'
                });
                return;
            }
        }

        setIsCreating(true);
        try {
            const payload = {
                ...newUser,
                role: newUser.role.toUpperCase()
            };

            if (isEditing) {
                if (payload.password === 'DUMMY_PASSWORD') {
                    delete payload.password;
                }
                await userService.updateUser(editingUserId, payload);
            } else {
                await userService.registerUser(payload);
            }

            Swal.fire({
                icon: 'success',
                title: isEditing ? 'User Updated' : 'User Created',
                text: isEditing 
                    ? `Successfully updated ${newUser.name}.`
                    : `Successfully created ${newUser.role}: ${newUser.name}.`,
                confirmButtonColor: '#28a745'
            });

            handleReset();
            fetchUsers(searchTerm, usersCurrentPage);
        } catch (error) {
            console.error("Submission error:", error);
            const apiErrors = error.response?.data?.errors;
            let errorMessage = error.response?.data?.message || `Could not ${isEditing ? 'update' : 'create'} user.`;
            
            if (apiErrors && typeof apiErrors === 'object') {
                const detailedErrors = Object.entries(apiErrors)
                    .map(([field, msg]) => `• ${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`)
                    .join('\n');
                errorMessage = `Validation failed:\n${detailedErrors}`;
            }

            Swal.fire({
                icon: 'error',
                title: isEditing ? 'Update Failed' : 'Creation Failed',
                text: errorMessage,
                confirmButtonColor: '#4a2a18'
            });
        } finally {
            setIsCreating(false);
        }
    };

    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

    if (!isAdmin && currentUser?.role) {
        return (
            <div className="admin-page-content">
                <h2>Access Denied</h2>
                <p>You do not have permission to view User Management.</p>
            </div>
        );
    }

    return (
        <div className="admin-page-content animate-fade-in">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "40px" }}>
                <div className="dashboard-header-modern">
                    <h1 className="page-title">User Management</h1>
                </div>
            </div>

            {isAdmin && (
                <div className="dashboard-form-container">
                    <div className="form-header-modern">
                        <h3>{isEditing ? `Edit User: ${newUser.name}` : 'Create New User'}</h3>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid-modern">
                            <div className="form-group-modern">
                                <label className="form-label-modern">Full Name <span className="required-mark">*</span></label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    value={newUser.name} 
                                    onChange={handleInputChange} 
                                    className="form-input-modern"
                                    placeholder="Enter full name"
                                    required
                                />
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">Email Address <span className="required-mark">*</span></label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    value={newUser.email} 
                                    onChange={handleInputChange} 
                                    className={`form-input-modern ${emailStatus.available === false ? 'input-error' : emailStatus.available === true ? 'input-success' : ''}`}
                                    placeholder="Enter email"
                                    required
                                />
                                {emailStatus.message && (
                                    <div style={{ 
                                        fontSize: '12px', 
                                        marginTop: '4px', 
                                        color: emailStatus.available ? '#2e7d32' : '#c62828',
                                        fontWeight: '500'
                                    }}>
                                        {emailStatus.available ? '✓ ' : '✕ '} {emailStatus.message}
                                    </div>
                                )}
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">
                                    {isEditing ? 'New Password (Optional)' : 'User Password'} {!isEditing && <span className="required-mark">*</span>}
                                </label>
                                <div className="form-input-with-button">
                                    <input 
                                        type="text" 
                                        name="password" 
                                        value={isEditing && newUser.password === 'DUMMY_PASSWORD' ? '' : newUser.password} 
                                        onChange={handleInputChange}
                                        className="form-input-modern"
                                        placeholder={isEditing ? "Leave blank to keep current" : "Enter or generate password"}
                                        required={!isEditing}
                                    />
                                    <button 
                                        type="button"
                                        onClick={generatePassword}
                                        className="btn-dashboard-secondary"
                                        style={{ 
                                            padding: '10px 15px', 
                                            whiteSpace: 'nowrap',
                                            fontSize: '0.85rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                        title="Auto-generate password based on name"
                                    >
                                        Auto-Generate
                                    </button>
                                </div>
                                {passwordStrength.label && (
                                    <div style={{ 
                                        fontSize: '12px', 
                                        marginTop: '4px', 
                                        color: passwordStrength.color,
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <div style={{ 
                                            width: '8px', 
                                            height: '8px', 
                                            borderRadius: '50%', 
                                            backgroundColor: passwordStrength.color 
                                        }}></div>
                                        Strength: {passwordStrength.label}
                                    </div>
                                )}
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">Address <span className="required-mark">*</span></label>
                                <input 
                                    type="text" 
                                    name="address" 
                                    value={newUser.address} 
                                    onChange={handleInputChange} 
                                    className="form-input-modern"
                                    placeholder="Enter location/address"
                                    required
                                />
                            </div>
                            <div className="form-group-modern">
                                <label className="form-label-modern">System Role <span className="required-mark">*</span></label>
                                <select 
                                    name="role" 
                                    value={newUser.role} 
                                    onChange={handleInputChange}
                                    className="form-select-modern"
                                >
                                    <option value="USER">User (Pilgrim)</option>
                                    <option value="OPERATOR">Operator (Ground Ops)</option>
                                    <option value="ADMIN">Admin (Governance)</option>
                                </select>
                            </div>
                            {isEditing && (
                                <div className="form-group-modern">
                                    <label className="form-label-modern">Account Status <span className="required-mark">*</span></label>
                                    <select 
                                        name="isActive" 
                                        value={newUser.isActive.toString()} 
                                        onChange={(e) => setNewUser(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                                        className="form-select-modern"
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            )}
                        </div>
                        <div className="form-actions-modern">
                            <button 
                                type="submit" 
                                disabled={isCreating || (!isEditing && !newUser.password) || emailStatus.available === false}
                                className="btn-dashboard-primary"
                            >
                                {isCreating ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Account' : 'Create Account')}
                            </button>
                            <button 
                                type="button"
                                onClick={handleReset}
                                className="btn-dashboard-secondary"
                            >
                                {isEditing ? 'Cancel Edit' : 'Reset Form'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="emergency-banner-static">
                <div className="banner-context">
                    <div className="static-marker-sos" style={{ background: 'rgba(33, 150, 243, 0.08)' }}>
                        <div className="marker-inner" style={{ background: '#2196F3' }}></div>
                    </div>
                    <div>
                        <h2 className="title-static">System Directory</h2>
                        <span className="subtitle-static">Nashik 2027 • Unified User Registry</span>
                    </div>
                </div>
                <div className="banner-metrics-static">
                    <div className="metric-box-fixed pending">
                        <div className="m-vals">
                            <span className="digit">{totalElements}</span>
                            <span className="lab">Registered Accounts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-filter-row" style={{ marginTop: '20px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    placeholder="Search users by ID, Name, Email, Role or Date..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="form-input-modern"
                    style={{ width: '100%', maxWidth: 'none' }}
                />
            </div>

            <div className="table-wrapper-premium">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email Address</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registeredUsers.length === 0 ? (
                            <tr><td colSpan="6" className="text-center p-8 text-muted">No system users found matching your search.</td></tr>
                        ) : (
                            registeredUsers.map(user => (
                                <tr key={user.id}>
                                    <td><span className="id-badge-alt">U-{user.id}</span></td>
                                    <td className="font-semibold">{user.name || user.fullName || 'Anonymous User'}</td>
                                    <td>{user.email || 'N/A'}</td>
                                    <td>
                                        <span className={`status-pill ${
                                            (user.role || 'USER').toUpperCase() === 'ADMIN' ? 'status-accepted' : 
                                            (user.role || 'USER').toUpperCase() === 'OPERATOR' ? 'status-pending' : 
                                            'status-completed'
                                        }`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                                            {(user.role || 'USER').toUpperCase()}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status-pill ${(user.isActive === undefined || user.isActive) ? 'status-completed' : 'status-failed'}`} style={{ padding: '4px 10px', fontSize: '11px' }}>
                                            {(user.isActive === undefined || user.isActive) ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => handleEditClick(user)}
                                                className="pager-btn"
                                                style={{ padding: '4px 8px', fontSize: '12px', minWidth: 'auto' }}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteClick(user)}
                                                className="pager-btn"
                                                style={{ 
                                                    padding: '4px 8px', 
                                                    fontSize: '12px', 
                                                    minWidth: 'auto',
                                                    color: '#c62828',
                                                    borderColor: '#ef9a9a'
                                                }}
                                                disabled={user.isActive === false}
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                <div className="pagination-bar-premium">
                    <button 
                        className="pager-btn" 
                        disabled={usersCurrentPage === 1} 
                        onClick={() => setUsersCurrentPage(prev => Math.max(1, prev - 1))}
                    >
                        Previous
                    </button>
                    <div className="pager-info">
                        Page <strong>{usersCurrentPage}</strong> of {totalPages}
                    </div>
                    <button 
                        className="pager-btn" 
                        disabled={usersCurrentPage >= totalPages} 
                        onClick={() => setUsersCurrentPage(prev => prev + 1)}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
