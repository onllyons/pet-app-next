import type { Metadata } from "next";
import { LegalDocument } from "../components/legal-document";

export const metadata: Metadata = {
  title: "Delete Data",
  description: "PetBuddy placeholder data deletion instructions for users and app reviewers.",
};

const sections = [
  {
    title: "1. Requesting Data Deletion",
    paragraphs: [
      "PetBuddy users may request deletion of account-related personal information by emailing privacy@pet-buddy.pet with the subject line 'Data Deletion Request.'",
      "To help protect user privacy, PetBuddy may request verification details before processing a deletion request. Verification may include confirming the email address associated with the relevant account or connected platform.",
    ],
  },
  {
    title: "2. Information to Include",
    paragraphs: [
      "A deletion request should include the user's full name, contact email, the service or platform used to access PetBuddy, and a short description of the request so it can be matched to the correct records.",
      "If the request relates to a social platform connection, the user should also revoke PetBuddy permissions from that platform directly to prevent future data sharing.",
    ],
  },
  {
    title: "3. Processing Timeline",
    paragraphs: [
      "PetBuddy may acknowledge deletion requests within a reasonable period and will aim to complete verified requests within thirty days, unless a longer period is required by law or operational necessity.",
      "Some information may be retained where required for legal compliance, fraud prevention, security investigation, recordkeeping, or dispute resolution.",
    ],
  },
  {
    title: "4. Scope of Deletion",
    paragraphs: [
      "Upon completion of a valid request, PetBuddy may delete or anonymize personal information associated with the requester from active systems, subject to technical and legal limitations.",
      "Residual copies may remain temporarily in backups, archives, or security logs until those systems rotate through normal retention schedules.",
    ],
  },
  {
    title: "5. Platform-Specific Guidance",
    paragraphs: [
      "If a user connected PetBuddy through Facebook, Google, or another third-party provider, the user should also remove PetBuddy from the provider's app permissions dashboard to stop future sharing.",
      "Reviewers evaluating this page for platform compliance should treat this document as placeholder operational guidance pending final legal and product approval.",
    ],
  },
  {
    title: "6. Contact",
    paragraphs: [
      "Questions about deletion requests or privacy rights may be sent to privacy@pet-buddy.pet.",
      "If PetBuddy later introduces an in-app deletion workflow, this page can be updated to include direct step-by-step account controls.",
    ],
  },
];

export default function DeleteDataPage() {
  return (
    <LegalDocument
      eyebrow="PetBuddy Support"
      title="Delete Data"
      intro="This page explains the placeholder process users may follow to request deletion of personal information associated with PetBuddy."
      effectiveDate="May 8, 2026"
      sections={sections}
    />
  );
}
