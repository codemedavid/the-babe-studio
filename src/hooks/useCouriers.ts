import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Courier {
    id: string;
    name: string;
    code: string;
    tracking_url_template: string | null;
    is_active: boolean;
    sort_order: number;
    created_at: string;
}

export const useCouriers = () => {
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCouriers = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('couriers')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;
            setCouriers(data || []);
        } catch (error) {
            console.error('Error fetching couriers:', error);
            // Return default couriers if table doesn't exist
            setCouriers([
                { id: '00000000-0000-0000-0000-000000000001', name: 'LBC Express', code: 'lbc', tracking_url_template: 'https://www.lbcexpress.com/track/?tracking_no={tracking}', is_active: true, sort_order: 1, created_at: new Date().toISOString() },
                { id: '00000000-0000-0000-0000-000000000002', name: 'Lalamove', code: 'lalamove', tracking_url_template: null, is_active: true, sort_order: 2, created_at: new Date().toISOString() },
                { id: '00000000-0000-0000-0000-000000000003', name: 'Maxim', code: 'maxim', tracking_url_template: null, is_active: true, sort_order: 3, created_at: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    }, []);

    const addCourier = async (courier: Omit<Courier, 'id' | 'created_at'>) => {
        try {
            const { data, error } = await supabase
                .from('couriers')
                .insert([courier])
                .select()
                .single();

            if (error) throw error;
            setCouriers(prev => [...prev, data]);
            return data;
        } catch (error) {
            console.error('Error adding courier:', error);
            throw error;
        }
    };

    const updateCourier = async (id: string, updates: Partial<Courier>) => {
        try {
            // Convert empty tracking_url_template to null
            const cleanedUpdates = {
                ...updates,
                tracking_url_template: updates.tracking_url_template || null
            };

            const { data, error } = await supabase
                .from('couriers')
                .update(cleanedUpdates)
                .eq('id', id)
                .select();

            if (error) throw error;
            if (data && data.length > 0) {
                setCouriers(prev => prev.map(c => c.id === id ? data[0] : c));
                return data[0];
            }
        } catch (error) {
            console.error('Error updating courier:', error);
            throw error;
        }
    };

    const deleteCourier = async (id: string) => {
        try {
            const { error } = await supabase
                .from('couriers')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setCouriers(prev => prev.filter(c => c.id !== id));
        } catch (error) {
            console.error('Error deleting courier:', error);
            throw error;
        }
    };

    useEffect(() => {
        fetchCouriers();
    }, [fetchCouriers]);

    return {
        couriers,
        loading,
        addCourier,
        updateCourier,
        deleteCourier,
        refetch: fetchCouriers
    };
};
