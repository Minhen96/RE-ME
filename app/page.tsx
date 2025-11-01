import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function HomePage() {
const router = useRouter();

useEffect(() => {
    checkUser();
}, []);

async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
    // TODO: Redirect to login/signup page
    router.push('/onboarding');
    } else {
    router.push('/dashboard');
    }
}

return (
    <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
        <h1 className="text-4xl font-bold text-primary-600 mb-4">RE:ME</h1>
        <p className="text-gray-600">Loading your journey...</p>
    </div>
    </div>
);
}