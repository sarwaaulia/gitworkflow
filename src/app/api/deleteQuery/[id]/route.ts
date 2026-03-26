import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
	request: NextRequest,
	{ params }: any,
) {
	try {
		const { id } = await params;

		const supabase = await createClient();
		const {
			data: { user },
			error: userError,
		} = await supabase.auth.getUser();
		if (!user || userError) {
			return NextResponse.json(
				{ error: `user not authenticated yet`, userError },
				{ status: 401 },
			);
		}

		const { data: entry, error: fetchError } = await supabase
			.from("entries")
			.select("id, user_id, content")
			.eq("user_id", user.id)
			.eq("id", id)
			.single();

		// apakah entry tsb ada (tanpa user)
		const { data: entryDatas, error: errorEntry } = await supabase
			.from("entries")
			.select("id, user_id")
			.eq("id", id)
			.maybeSingle();

		if (fetchError) {
			console.error("Test Delete API: Entry not found for user:", fetchError);
			return NextResponse.json(
				{
					error: "Entry not found or no permission",
					details: fetchError,
					debug: {
						userId: user.id,
						entryId: id,
						entryDatas,
						errorEntry,
					},
				},
				{ status: 404 },
			);
		}

		const { error: deleteError } = await supabase
			.from("entries")
			.delete()
			.eq("id", id)
			.eq("user_id", user.id);

		console.log("delete result:", { error: deleteError });

		if (deleteError) {
			console.error("Delete failed:", deleteError);
			return NextResponse.json(
				{ error: "Failed to delete entry cause server error ", deleteError },
				{ status: 500 },
			);
		}

		console.log("Delete API: Entry deleted successfully");
		return NextResponse.json({ success: true, deletedEntry: id });
		
	} catch (error: any) {
		console.error(error.message);
		return NextResponse.json(
			{ error: `Internal server error` },
			{ status: 500 },
		);
	}
}
