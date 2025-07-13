
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import { NotificationSettingsForm } from "./notification-settings-form";
import { AccountSecurityForm } from "./account-security-form";
import { FarmConfigurationForm } from "./farm-configuration-form";

// A dedicated error component to avoid repeating JSX
function SettingsErrorCard({ message, details }: { message: string, details?: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-destructive">Error Loading Settings</CardTitle>
                <CardDescription>
                    {message}
                    {details && <div className="mt-2 text-xs text-muted-foreground bg-muted p-2 rounded-md">Error details: {details}</div>}
                </CardDescription>
            </CardHeader>
        </Card>
    );
}

export default async function SettingsPage() {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        // This redirect should be handled by middleware, but it's a safeguard.
        return redirect('/login');
    }

    // Step 1: Fetch user profile
    const profileResponse = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    
    if (profileResponse.error) {
        console.error("Supabase profile error:", profileResponse.error.message);
        return <SettingsErrorCard message="Could not load your user profile from the database." details={profileResponse.error.message} />;
    }
    if (!profileResponse.data) {
        return <SettingsErrorCard message="Your user profile could not be found." />;
    }
    const profile = profileResponse.data;

    // Step 2: Fetch farm configuration
    const farmConfigResponse = await supabase
        .from('farm_config')
        .select('*')
        .eq('id', 1) // Assuming a single config row with id 1
        .single();

    if (farmConfigResponse.error) {
        console.error("Supabase farm config error:", farmConfigResponse.error.message);
        return <SettingsErrorCard message="Could not load the farm configuration from the database." details={farmConfigResponse.error.message} />;
    }
    if (!farmConfigResponse.data) {
        return <SettingsErrorCard message="The farm configuration could not be found." />;
    }
    const farmConfig = farmConfigResponse.data;
    
    // Step 3: Determine user role
    const isManager = profile.role === 'Manager';

    // Step 4: Render the page
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <Settings2 className="h-6 w-6 text-primary" /> Application Settings
                    </CardTitle>
                    <CardDescription>Manage your Happy Chicks application preferences and settings.</CardDescription>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                <NotificationSettingsForm profile={profile} />
                <AccountSecurityForm email={user.email ?? 'No email available'} />
            </div>
            
            {isManager && (
                <FarmConfigurationForm config={farmConfig} />
            )}
        </div>
    );
}
