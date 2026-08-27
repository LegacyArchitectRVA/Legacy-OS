import ProfileShell from "./ProfileShell";

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ onboarding?: string }> }) {
  const params = await searchParams;
  return <ProfileShell onboarding={params.onboarding === "1"} />;
}
