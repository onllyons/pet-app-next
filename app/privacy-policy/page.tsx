import type { Metadata } from "next";
import { LegalDocument } from "../components/legal-document";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PetBuddy placeholder privacy policy for app verification and legal review.",
};

const sections = [
  {
    title: "1. Overview",
    paragraphs: [
      "This Privacy Policy explains how PetBuddy may collect, use, disclose, and safeguard personal information when users access the PetBuddy website, related mobile experiences, and connected support channels.",
      "This document is provided as production-style placeholder content for review and editing. It is intended to describe a typical privacy framework for a consumer-facing pet services application.",
    ],
  },
  {
    title: "2. Information We May Collect",
    paragraphs: [
      "PetBuddy may collect information that users provide directly, such as name, email address, pet profile details, support messages, and other content voluntarily submitted through forms or connected platform permissions.",
      "PetBuddy may also receive limited technical information automatically, including browser type, device information, approximate location derived from IP address, referring URLs, and site interaction data used for analytics and security.",
    ],
  },
  {
    title: "3. How We Use Information",
    paragraphs: [
      "PetBuddy may use collected information to operate the service, personalize user experiences, maintain account integrity, respond to support requests, improve product quality, and communicate service-related updates.",
      "Where platform permissions are involved, PetBuddy may use approved data only for the purposes disclosed to the user and permitted by the applicable platform policies.",
    ],
  },
  {
    title: "4. Sharing and Disclosure",
    paragraphs: [
      "PetBuddy may share information with service providers that support hosting, analytics, customer support, security monitoring, and operational administration, subject to contractual confidentiality obligations.",
      "PetBuddy may also disclose information when reasonably necessary to comply with law, enforce terms, protect rights and safety, or respond to lawful requests from public authorities.",
    ],
  },
  {
    title: "5. Data Retention",
    paragraphs: [
      "PetBuddy may retain personal information only for as long as reasonably necessary to fulfill the purposes described in this policy, comply with legal obligations, resolve disputes, and enforce agreements.",
      "Retention periods may vary depending on the nature of the information, the user relationship, and applicable regulatory requirements.",
    ],
  },
  {
    title: "6. User Choices and Rights",
    paragraphs: [
      "Depending on the user's jurisdiction, individuals may have the right to request access, correction, deletion, restriction, or portability of certain personal information, or to object to specific processing activities.",
      "Requests may be submitted using the contact details provided below. PetBuddy may need to verify identity before completing a request.",
    ],
  },
  {
    title: "7. Children's Privacy",
    paragraphs: [
      "PetBuddy is not intended for direct use by children without appropriate parental or guardian involvement. PetBuddy does not knowingly collect personal information from children in violation of applicable law.",
      "If PetBuddy becomes aware that such information has been collected improperly, reasonable steps may be taken to delete it promptly.",
    ],
  },
  {
    title: "8. Contact Information",
    paragraphs: [
      "Questions or requests regarding this Privacy Policy may be directed to PetBuddy at privacy@pet-buddy.pet.",
      "Mailing address and jurisdiction-specific disclosures may be added in a final production version of this policy.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      eyebrow="PetBuddy Legal"
      title="Privacy Policy"
      intro="This placeholder policy explains how PetBuddy may handle user information in connection with its website, verification flows, and companion app experiences."
      effectiveDate="May 8, 2026"
      sections={sections}
    />
  );
}
