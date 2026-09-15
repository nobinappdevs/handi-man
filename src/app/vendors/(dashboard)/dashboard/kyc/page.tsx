import { PageShell } from "@/components/dashboard/PageShell";
import { Kyc } from "@/components/dashboard/page/kyc/Kyc";

export const metadata = { title: "Identity verification — Handiman" };

/*
 * The vendor's KYC screen. `role="vendor"` points it at
 * `/vendors/profile/kyc/input-fields` and `/vendors/profile/kyc/submit` on the
 * vendor API root — the only KYC endpoints this backend documents.
 *
 * The form itself is not written here or anywhere else: the endpoint returns
 * `input_fields`, and the screen builds the controls, the options and the
 * validation from that. Adding a document type is an admin change.
 */
export default function Page() {
  return (
    <PageShell page="vendorKyc">
      <Kyc role="vendor" />
    </PageShell>
  );
}
