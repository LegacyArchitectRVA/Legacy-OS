import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../lib/admin-access";
import { isAdminRequest, validateUserCredentials } from "../../../lib/admin-auth";

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  try {
    const body = (await request.json()) as { email?: string; password?: string; sendInvite?: boolean };
    const email = body.email?.trim().toLowerCase() ?? "";
    const password = body.password ?? "";
    if (!validateUserCredentials(email, password)) return NextResponse.json({ error: "Use a valid email and a password of at least 12 characters." }, { status: 400 });

    const { data, error } = await getSupabaseAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { must_change_password: true, provisioned_by: "legacy-os-admin" },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ user: { id: data.user.id, email: data.user.email, temporaryPasswordIssued: true, mustChangePassword: true }, message: body.sendInvite === false ? "Account created. Deliver the temporary password securely." : "Account created. Send the user a secure sign-in invitation and temporary password." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create user" }, { status: 500 });
  }
}
