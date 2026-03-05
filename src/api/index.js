// api.js - Helper for React Frontend to communicate with the Backend

const API_BASE = '/api';

export const getAllData = async () => {
    try {
        const response = await fetch(`${API_BASE}/all-data`);
        if (!response.ok) throw new Error('Failed to fetch data');
        return await response.json();
    } catch (error) {
        console.error('getAllData error:', error);
        throw error;
    }
};

export const saveData = async (data) => {
    try {
        const response = await fetch(`${API_BASE}/all-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to save data');
        return await response.json();
    } catch (error) {
        console.error('saveData error:', error);
        throw error;
    }
};
