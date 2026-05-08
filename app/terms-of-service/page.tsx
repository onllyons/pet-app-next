import type { Metadata } from "next";
import { LegalDocument } from "../components/legal-document";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PetBuddy placeholder terms of service for app verification and legal review.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    paragraphs: [
      "These Terms of Service govern access to and use of the PetBuddy website, any linked applications, and related services made available by PetBuddy.",
      "By accessing or using the service, a user agrees to be bound by these terms and by any additional policies referenced within them. If a user does not agree, the service should not be used.",
    ],
  },
  {
    title: "2. Eligibility and Accounts",
    paragraphs: [
      "Users are responsible for providing accurate information when interacting with PetBuddy and for ensuring that any credentials or connected third-party permissions are used lawfully and appropriately.",
      "PetBuddy may suspend or restrict access where activity appears unauthorized, abusive, fraudulent, or inconsistent with these terms.",
    ],
  },
  {
    title: "3. Permitted Use",
    paragraphs: [
      "PetBuddy grants a limited, non-exclusive, revocable right to access and use the service for its intended informational and companion-related purposes.",
      "Users may not misuse the service, interfere with security features, reverse engineer protected functionality except where prohibited by law, or use the service in a way that infringes the rights of others.",
    ],
  },
  {
    title: "4. Intellectual Property",
    paragraphs: [
      "All trademarks, service marks, logos, content, design elements, and software associated with PetBuddy remain the property of PetBuddy or its licensors unless otherwise stated.",
      "Except for the limited use rights expressly granted in these terms, no license or ownership interest is transferred to the user.",
    ],
  },
  {
    title: "5. Third-Party Services",
    paragraphs: [
      "The service may reference or integrate with third-party platforms, including social login, analytics, hosting, or app store ecosystems. PetBuddy is not responsible for third-party content, policies, or independent practices.",
      "Use of third-party services may be subject to separate terms and privacy notices provided by those parties.",
    ],
  },
  {
    title: "6. Disclaimers",
    paragraphs: [
      "The service is provided on an 'as is' and 'as available' basis to the maximum extent permitted by law. PetBuddy makes no guarantee that the service will be uninterrupted, error-free, or suitable for every user need.",
      "Placeholder legal content, informational pages, and verification pages should not be treated as legal, veterinary, or professional advice.",
    ],
  },
  {
    title: "7. Limitation of Liability",
    paragraphs: [
      "To the fullest extent permitted by law, PetBuddy and its affiliates, officers, employees, and service providers will not be liable for indirect, incidental, special, consequential, or punitive damages arising from or related to the use of the service.",
      "Where liability cannot be excluded, it may be limited to the minimum amount required under applicable law.",
    ],
  },
  {
    title: "8. Changes and Contact",
    paragraphs: [
      "PetBuddy may update these terms from time to time. Updated terms become effective when posted unless a different effective date is stated.",
      "Questions about these terms may be sent to legal@pet-buddy.pet.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalDocument
      eyebrow="PetBuddy Legal"
      title="Terms of Service"
      intro="These placeholder terms describe the baseline rules, disclaimers, and responsibilities that may apply to users of PetBuddy."
      effectiveDate="May 8, 2026"
      sections={sections}
    />
  );
}
