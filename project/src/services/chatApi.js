const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    'https://vedacraft-customers-main.onrender.com/api/v1'
export const sendChatMessage = async (message, messages) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            messages,
        }),
    });
    const payload = (await response.json());
    if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Unable to send message');
    }
    return payload.data;
};
