import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "../../../lib/admin-access";
import { isAdminRequest, validateUserCredentials } from "../../../lib/admin-auth";
import { ApiRequestError, isRecord, jsonResponseHeaders, parseJsonBody } from "../../../lib/api-request";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const sendInvite = body.sendInvite !== false;

    if (!validateUserCredentials(email, password)) {
      return NextResponse.json(
        { error: "Use a valid email and a password of at least 12 characters." },
        { status: 400, headers: jsonResponseHeaders() },
      );
    }

    const { data, error } = await getSupabaseAdminClient().auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      user_metadata: { must_change_password: true, provisioned_by: "legacy-os-admin" },
    });
    if (error) {
      return NextResponse.json({ error: "Unable to create the user account." }, { status: 400, headers: jsonResponseHeaders() });
    }

    return NextResponse.json(
      {
        user: { id: data.user.id, email: data.user.email, temporaryPasswordIssued: true, mustChangePassword: true },
        message: sendInvite
          ? "Account created. Send the user a secure sign-in invitation and temporary password."
          : "Account created. Deliver the temporary password securely.",
      },
      { status: 201, headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to create user." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
