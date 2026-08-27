import VerifyForm from "./VerifyForm";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function VerifyPage({ searchParams }: Props) {
  const params = await searchParams;
  const initialEmail = (params.email ?? "").trim().toLowerCase();
  return <VerifyForm initialEmail={initialEmail} />;
}
