import { useState, useEffect, useCallback } from 'react';


// Interface matching the Pydantic model in notifications.py
export interface NotificationModel {
    ID: string;
    Usuario_Destino: string;
    Titulo: string;
    Mensaje: string;
    Tipo: string; // "Info" | "Success" | "Warning" | "Error"
    Leido: string; // Backend returns "True" or "False" strings
    Fecha: string;
    Link: string | null;
}

// Named export to match the import in Header.tsx
export const useNotifications = (user: string | null) => {
    const [notifications, setNotifications] = useState<NotificationModel[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            // Assuming backend is running on localhost:8000
            const response = await fetch(`https://crm-backend-56gq.onrender.com/notifications/?user=${encodeURIComponent(user)}`);
            if (response.ok) {
                const data = await response.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`https://crm-backend-56gq.onrender.com/notifications/${id}/read`, {
                method: 'PATCH'
            });
            if (response.ok) {
                // Optimistic update
                setNotifications(prev => prev.map(n => 
                    n.ID === id ? { ...n, Leido: "True" } : n
                ));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 15 seconds
        const interval = setInterval(fetchNotifications, 15000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    return { notifications, loading, fetchNotifications, markAsRead };
};