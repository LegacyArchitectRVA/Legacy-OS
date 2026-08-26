import type { ReactNode } from "react";
import { ElaraGuide } from "../../components/ElaraGuide";

export default function SuccessorLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="lg:ml-64 px-5 pt-5 sm:px-8">
        <ElaraGuide />
      </div>
      {children}
    </>
  );
}
