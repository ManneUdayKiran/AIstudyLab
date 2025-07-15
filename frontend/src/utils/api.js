const API_BASE_URL = 'https://a-istudy-lab-of1b.vercel.app/api';

// Function to refresh token
const refreshToken = async () => {
  try {
    const currentToken = localStorage.getItem('token');
    if (!currentToken) {
      throw new Error('No token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data.token;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
};

// Function to make authenticated API calls with automatic token refresh
export const authenticatedFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token available');
  }

  // Add authorization header
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });

    // If token is expired, try to refresh it
    if (response.status === 401) {
      try {
        const newToken = await refreshToken();
        
        // Retry the request with the new token
        const retryResponse = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`
          }
        });

        if (!retryResponse.ok) {
          throw new Error(`API call failed: ${retryResponse.status}`);
        }

        return retryResponse;
      } catch (refreshError) {
        // If refresh fails, redirect to login
        window.location.href = '/login';
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Helper function to get JSON response
export const apiGet = async (url) => {
  const response = await authenticatedFetch(url);
  return response.json();
};

// Helper function to post JSON data
export const apiPost = async (url, data) => {
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
};

// Helper function to put JSON data
export const apiPut = async (url, data) => {
  const response = await authenticatedFetch(url, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  return response.json();
};

// Helper function to delete
export const apiDelete = async (url) => {
  const response = await authenticatedFetch(url, {
    method: 'DELETE'
  });
  return response.json();
}; 