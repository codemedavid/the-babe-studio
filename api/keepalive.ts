import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
    try {
        // Vercel Cron sends a Bearer token matching your CRON_SECRET environment variable
        const authHeader = req.headers.authorization;
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Use environment variables (works locally with .env or in Vercel)
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return res.status(500).json({ error: 'Database credentials missing' });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        // Perform a lightweight query to wake up/keep alive the database
        // Fetching 1 row from an existing table is extremely fast and efficient
        const { data, error } = await supabase.from('site_settings').select('id').limit(1);

        if (error) {
            throw error;
        }

        return res.status(200).json({
            status: 'success',
            message: 'Supabase database pinged successfully to prevent pausing.',
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Database keepalive ping failed:', error.message);
        return res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}
