// ===== CONSTANTS AND VARIABLES =====

// API Base URL - endpoint for user data
const API_BASE_URL = '/api/users';

// Constants
const userForm = document.getElementById('userForm');
const userTable = document.getElementById('userTable').getElementsByTagName('tbody')[0];
const selectAllCheckbox = document.getElementById('selectAll');
const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
const sortableHeaders = document.querySelectorAll('.sortable');

// Sort state - tracks current sort column and direction
let currentSort = {
    column: 'id', // Default sort column
    direction: 'asc' // Default sort direction: ascending
};

// User cache - holds all users from the server
let usersData = [];

// ===== EVENT LISTENERS =====

// Initialize data when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchUsers);

// Toggle all checkboxes 
selectAllCheckbox.addEventListener('change', toggleSelectAll);

// Bulk delete button
bulkDeleteBtn.addEventListener('click', bulkDeleteUsers);

// Sortable columnsbb
sortableHeaders.forEach(header => {
    header.addEventListener('click', () => handleSort(header.dataset.sort));
});

// ===== DATA FETCHING FUNCTIONS =====

/**
 * Fetches all users from the API
 * Updates the usersData array and renders the table
 */
async function fetchUsers() {
    try {
        // Fetch users from the API
        const response = await fetch(API_BASE_URL);
        
        // Check if the request was successful
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        // Parse the JSON response
        usersData = await response.json();
        
        // Sort the users according to current sort settings
        sortUsers();
        
        // Render the user table
        renderUserTable();
    } catch (error) {
        // Log error and display user-friendly message
        console.error('Error fetching users:', error);
        displayErrorMessage('Unable to load users. Please try again later.');
    }
}

// ===== SORTING FUNCTIONS =====

/**
 * Sorts the users array based on the current sort settings
 */
function sortUsers() {
    const { column, direction } = currentSort;
    
    usersData.sort((a, b) => {
        let valueA = a[column];
        let valueB = b[column];
        
        // Handle string comparisons (case-insensitive)
        if (typeof valueA === 'string') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        // Compare values based on sort direction
        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0; // Values are equal
    });
}

/**
 * Sort header 
 * @param {string} column - The column to sort by
 */
function handleSort(column) {
    // Update sort direction
    if (currentSort.column === column) {
        // Toggle direction if same column clicked again
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new column and default to ascending
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // Update sort icons to show current state
    updateSortIcons();
    
    // Re-sort and render the table
    sortUsers();
    renderUserTable();
}

/**
 * Updates sort icons to reflect current sort state
 */
function updateSortIcons() {
    sortableHeaders.forEach(header => {
        // Reset all icons to default
        const icon = header.querySelector('i');
        icon.className = 'fas fa-sort';
        
        // Set active sort icon for the current sort column
        if (header.dataset.sort === currentSort.column) {
            icon.className = `fas fa-sort-${currentSort.direction === 'asc' ? 'up' : 'down'}`;
        }
    });
}

// ===== CHECKBOX AND BULK ACTIONS =====

/**
 * Toggles all checkboxes based on the "Select All" checkbox state
 */
function toggleSelectAll() {
    const isChecked = selectAllCheckbox.checked;
    const checkboxes = document.querySelectorAll('.user-checkbox');
    
    // Set all user checkboxes to match the select all checkbox
    checkboxes.forEach(checkbox => {
        checkbox.checked = isChecked;
    });
    
    // Update bulk delete button state
    updateBulkDeleteButton();
}

/**
 * Updates bulk delete button state based on selected checkboxes
 */
function updateBulkDeleteButton() {
    const selectedCount = document.querySelectorAll('.user-checkbox:checked').length;
    
    // Disable button if no users selected
    bulkDeleteBtn.disabled = selectedCount === 0;
    
    // Update button text to show selection count
    if (selectedCount > 0) {
        bulkDeleteBtn.textContent = `Delete Selected (${selectedCount})`;
    } else {
        bulkDeleteBtn.textContent = 'Delete Selected';
    }
}

/**
 * Handles bulk deletion of selected users
 */
async function bulkDeleteUsers() {
    const selectedCheckboxes = document.querySelectorAll('.user-checkbox:checked');
    
    // Return early if no users selected
    if (selectedCheckboxes.length === 0) return;
    
    // Get array of selected user IDs
    const userIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.userId);
    
    // Confirm deletion with the user
    if (!confirm(`Are you sure you want to delete ${userIds.length} user(s)?`)) {
        return;
    }
    
    try {
        let successCount = 0;
        let failCount = 0;
        
        // Process deletes one by one (no bulk delete endpoint)
        for (const userId of userIds) {
            try {
                const response = await fetch(`${API_BASE_URL}/${userId}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
                console.error(`Error deleting user ${userId}:`, error);
            }
        }
        
        // Refresh the user list after bulk operations
        await fetchUsers();
        
        // Display results to the user
        if (failCount === 0) {
            displayErrorMessage(`Successfully deleted ${successCount} user(s).`, 'success');
        } else {
            displayErrorMessage(`Deleted ${successCount} user(s), but failed to delete ${failCount} user(s).`, 'warning');
        }
    } catch (error) {
        console.error('Error in bulk delete operation:', error);
        displayErrorMessage('Failed to complete bulk delete operation.');
    }
}

// ===== TABLE RENDERING FUNCTIONS =====

/**
 * Renders the user table with current data
 */
function renderUserTable() {
    // Clear existing table rows
    userTable.innerHTML = '';
    
    // Add a row for each user
    usersData.forEach(user => {
        addUserToTable(user);
    });
    
    // Reset select all checkbox and update button state
    selectAllCheckbox.checked = false;
    updateBulkDeleteButton();
}

/**
 * Adds a single user to the table
 * @param {Object} user - The user data to add
 */
function addUserToTable(user) {
    const row = userTable.insertRow();
    row.dataset.userId = user.id;
    
    // Create the row HTML with user data
    row.innerHTML = `
        <td>
            <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" onchange="updateBulkDeleteButton()">
        </td>
        <td>${user.id}</td>
        <td>${user.first_name}</td>
        <td>${user.last_name}</td>
        <td>${user.email}</td>
        <td>${user.phone}</td>
        <td>
            <button onclick="editUser(${user.id})" class="edit-btn">Edit</button>
            <button onclick="deleteUser(${user.id})" class="delete-btn">Delete</button>
        </td>
    `;
}

// ===== USER OPERATIONS =====

/**
 * Initiates editing a user
 * @param {number} userId - The ID of the user to edit
 */
async function editUser(userId) {
    try {
        // Fetch user details from the API
        const response = await fetch(`${API_BASE_URL}/${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }
        
        const user = await response.json();
        
        // Populate form with user details
        document.getElementById('firstName').value = user.first_name;
        document.getElementById('lastName').value = user.last_name;
        document.getElementById('email').value = user.email;
        document.getElementById('phone').value = user.phone;
        
        // Store the editing user ID in the form
        userForm.dataset.editingUserId = userId;
    } catch (error) {
        console.error('Error editing user:', error);
        displayErrorMessage('Unable to edit user. Please try again.');
    }
}

/**
 * Deletes a single user
 * @param {number} userId - The ID of the user to delete
 */
async function deleteUser(userId) {
    // Confirm deletion with the user
    if (!confirm('Are you sure you want to delete this user?')) {
        return;
    }
    
    try {
        // Send delete request to the API
        const response = await fetch(`${API_BASE_URL}/${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete user');
        }
        
        // Remove user from local data array
        usersData = usersData.filter(user => user.id !== userId);
        
        // Refresh the table
        renderUserTable();
        
        // Show success message
        displayErrorMessage('User successfully deleted.', 'success');
    } catch (error) {
        console.error('Error deleting user:', error);
        displayErrorMessage('Failed to delete user. Please try again.');
    }
}

// ===== VALIDATION AND UTILITIES =====

/**
 * Validates user input data
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} email - User's email
 * @param {string} phone - User's phone number
 * @returns {boolean} - Whether the input is valid
 */
function validateInput(firstName, lastName, email, phone) {
    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Phone validation regex - 10 digits
    const phoneRegex = /^\d{10}$/;
    
    // Check names are provided
    if (!firstName || !lastName) {
        displayErrorMessage('First and last names are required.');
        return false;
    }
    
    // Check email format
    if (!emailRegex.test(email)) {
        displayErrorMessage('Please enter a valid email address.');
        return false;
    }
    
    // Check phone format
    if (!phoneRegex.test(phone)) {
        displayErrorMessage('Please enter a valid 10-digit phone number.');
        return false;
    }
    
    // All validations passed
    return true;
}

/**
 * Displays an error or success message
 * @param {string} message - The message to display
 * @param {string} type - Message type: 'error', 'success', or 'warning'
 */
function displayErrorMessage(message, type = 'error') {
    // Get or create the message element
    const errorDiv = document.getElementById('errorMessage') || createErrorDiv();
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Set color based on message type
    if (type === 'success') {
        errorDiv.style.backgroundColor = '#4CAF50'; // Green
    } else if (type === 'warning') {
        errorDiv.style.backgroundColor = '#ff9800'; // Orange
    } else {
        errorDiv.style.backgroundColor = '#ff6b6b'; // Red
    }
    
    // Automatically hide message after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

/**
 * Creates error message div if it doesn't exist
 * @returns {HTMLElement} - The created or existing error div
 */
function createErrorDiv() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'errorMessage';
    errorDiv.style.color = 'white';
    errorDiv.style.marginTop = '10px';
    document.body.insertBefore(errorDiv, userForm.nextSibling);
    return errorDiv;
}

// ===== FORM SUBMISSION HANDLING =====

/**
 * Main form submission handler - handles both create and update
 */
userForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    // Get form values
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Validate input
    if (!validateInput(firstName, lastName, email, phone)) {
        return;
    }
    
    // Create user data object
    const userData = { 
        first_name: firstName, 
        last_name: lastName, 
        email, 
        phone 
    };
    
    // Check if we're updating an existing user
    const editingUserId = userForm.dataset.editingUserId;
    
    try {
        let response;
        
        if (editingUserId) {
            // Update existing user
            response = await fetch(`${API_BASE_URL}/${editingUserId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        } else {
            // Create new user
            response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
        }
        
        // Check for API errors
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server response error:', errorData);
            throw new Error(`Failed to ${editingUserId ? 'update' : 'create'} user: ${response.status}`);
        }
        
        // Get the created/updated user
        const user = await response.json();
        
        // Update local data
        if (editingUserId) {
            // Find and update existing user in the array
            const index = usersData.findIndex(u => u.id === parseInt(editingUserId));
            if (index !== -1) {
                usersData[index] = user;
            }
            delete userForm.dataset.editingUserId;
        } else {
            // Add new user to the array
            usersData.push(user);
        }
        
        // Re-sort and render
        sortUsers();
        renderUserTable();
        
        // Reset form and show success message
        userForm.reset();
        displayErrorMessage(`User successfully ${editingUserId ? 'updated' : 'created'}!`, 'success');
    } catch (error) {
        console.error(`Error ${editingUserId ? 'updating' : 'creating'} user:`, error);
        displayErrorMessage(`Failed to ${editingUserId ? 'update' : 'add'} user. Please check your input.`);
    }
});