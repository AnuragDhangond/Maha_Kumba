import axiosInstance from '../axiosConfig';

export const crowdService = {
getCrowdStatus: async () => {
try {
const response = await axiosInstance.get('/api/crowd-status');
return response;
} catch (error) {
throw error;
}
},

updateCrowdStatus: async (id, newLevel) => {
try {
const response = await axiosInstance.put(`/api/crowd-status/${id}`, newLevel, {
headers: { 'Content-Type': 'application/json' }
});
return response;
} catch (error) {
throw error;
}
},

pingLocation: async (pingData) => {
try {
const response = await axiosInstance.post('/api/crowd-status/ping', pingData);
return response;
} catch (error) {
console.error("GPS Ping failed", error);
}
},

disconnectUser: async (deviceId) => {
try {
const response = await axiosInstance.post('/api/crowd-status/disconnect', { deviceId });
return response;
} catch (error) {
console.error("Disconnect failed", error);
}
},

getLivePings: async () => {
try {
const response = await axiosInstance.get('/api/crowd-status/pings');
return response;
} catch (error) {
console.error("Failed to fetch live pings", error);
throw error;
}
},

refreshDensity: async () => {
try {
const response = await axiosInstance.post('/api/crowd-status/refresh-density');
return response;
} catch (error) {
console.error("Density refresh failed", error);
throw error;
}
    },

    releaseOverride: async (id) => {
        try {
            const response = await axiosInstance.post(`/api/crowd-status/${id}/release`);
            return response;
        } catch (error) {
            console.error("Release override failed", error);
            throw error;
        }
}
};