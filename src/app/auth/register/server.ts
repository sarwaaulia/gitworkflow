"use server";

import { createClient } from "@/lib/supabase/server";
import { success, z } from "zod";

const registerSchema = z.object({
	email: z.string().email("Invalid email format"),
	name: z.string().min(3, "Username at least 4 characters").max(20),
	password: z.string().min(8, "Password at least 8 characters"),
});

export async function getCurrentUser() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
}

export async function register(formData: FormData) {
	console.log(`data masuk`, Object.fromEntries(formData.entries()));
	
	// get data from form
	const rawData = {
		name: formData.get("username"),
		email: formData.get("email"),
		password: formData.get("password"),
	};
	// validasi dengan zod
	const validatedFields = registerSchema.safeParse(rawData);

	if (!validatedFields.success) {
		const firstError = Object.values(
			validatedFields.error.flatten().fieldErrors,
		)[0]?.[0];

		return {
			error: firstError || "Validasi gagal",
		};
	}

	const { name, email, password } = validatedFields.data;
	const supabase = await createClient();

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { name } },
	});

	if (error) {
		return { error: error.message };
	}

	return {success: true}
};
