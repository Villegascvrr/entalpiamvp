
import { supabase } from "./src/lib/supabaseClient";

async function testActorResolution() {
    console.log("Testing actor resolution...");

    // 1. Login
    console.log("Logging in as admin...");
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email: "admin@entalpia-demo.com",
        password: "Demo2024!"
    });

    if (loginError) {
        console.error("Login failed:", loginError);
        return;
    }

    console.log("Logged in:", session?.user.id);

    // 2. Try to fetch actor
    console.log("Fetching actor...");
    const { data, error } = await supabase
        .from("actors")
        .select("*")
        .eq("auth_user_id", session?.user.id)
        .maybeSingle();

    console.log("Actor Query Result:", { data, error });

    if (error) {
        console.error("Actor fetch failed:", error);
    } else {
        console.log("Actor fetched successfully:", data?.name);
    }
}

testActorResolution();
