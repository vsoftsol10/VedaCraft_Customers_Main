const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://vedacraft-customers-main.onrender.com/api/v1'

export const checkDeliveryState = async (stateName) => {
    if (!stateName)
        return null;
    try {
        const response = await fetch(`${API_BASE_URL}/delivery/check-state?state=${encodeURIComponent(stateName)}`);
        if (!response.ok) {
            return null; // Don't block checkout on API error
        }
        const json = await response.json();
        if (json.success && json.data) {
            return json.data;
        }
        return null; // Don't block checkout if unexpected response
    }
    catch (error) {
        console.error('Failed to check delivery state:', error);
        return null; // Don't block checkout when server is unreachable
    }
};
