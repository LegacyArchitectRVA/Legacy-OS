# Legacy OS US Regulatory Control Matrix

Status: engineering baseline, not a legal opinion or certification.

## Policy

Legacy OS is designed to support the strictest applicable US privacy, security, healthcare, financial-data, consumer-protection, electronic-signature, AI-governance, and breach-response requirements that apply to a particular data flow. Applicability is determined by jurisdiction, data category, purpose, customer relationship, and operational role. No feature may claim universal legal compliance without legal review.

## Baseline control families

| Control | Required engineering behavior |
|---|---|
| Data classification | Classify sensitive data before retrieval, processing, export, playback, or model access. |
| Identity | Verify the requesting person before protected-data access. |
| Relationship | Resolve relationship aliases only through the verified relationship graph. |
| Authorization | Enforce subject, role, purpose, scope, and directional relationship before retrieval. |
| Consent | Require active, purpose-specific consent where the applicable policy requires it; honor expiration and revocation. |
| Minimum necessary | Retrieve only the fields/evidence required for the stated purpose. |
| Segmentation | Keep health, financial, credentials, communications, minors, biometrics, and other sensitive classes separately enforceable. |
| Encryption | Encrypt sensitive data in transit and at rest; manage keys separately from application data. |
| Audit | Record protected-data access, authorization decisions, disclosures, changes, exports, signatures, and administrative actions. |
| Integrity | Preserve evidence hashes and provenance; never silently alter source records. |
| Retention | Apply jurisdiction- and record-class-specific retention/deletion policies. |
| Incident response | Maintain detection, containment, investigation, notification, and recovery workflows. |
| Vendor governance | Track processors/subprocessors, data locations, contracts, and required agreements. |
| AI governance | Log model/version, retrieval context, evidence, confidence, policy decisions, and material human approvals. |
| Human review | Escalate ambiguous identity, authorization, high-impact conclusions, and legally sensitive disclosures. |
| User rights | Support applicable access, correction, deletion, portability, restriction, and disclosure workflows. |
| Signature integrity | Store signed artifact, signer identity, timestamp, consent text/version, and cryptographic integrity metadata. |
| Localization | Apply state/jurisdiction policy based on the subject, requester, data, and applicable legal nexus. |
| Change management | Version policies and require re-evaluation when laws, regulations, vendors, models, or data flows change. |

## Federal reference families

This matrix is intended to map implementation controls to applicable requirements including, where applicable:

- HIPAA Privacy, Security, and Breach Notification Rules and HITECH.
- 42 CFR Part 2 for applicable substance-use-disorder records.
- FTC consumer-protection and health-data breach requirements where applicable.
- GLBA and FTC Safeguards Rule where the product acts in a covered financial-data context.
- E-SIGN and applicable UETA state law for electronic records/signatures.
- COPPA and applicable child/minor privacy requirements.
- Applicable federal communications, employment, consumer-reporting, and sector-specific requirements based on the actual use case.

## Engineering standards baseline

The security/privacy program should be designed against NIST CSF, NIST Privacy Framework, NIST AI RMF, and NIST AI RMF Generative AI Profile, with stronger controls where the risk profile warrants them.

## State coverage

Maintain a versioned state profile for all 50 states and DC. At minimum, evaluate comprehensive privacy laws, health-data laws, biometric laws, data-breach laws, electronic-signature rules, recording/communications consent rules, minor-data requirements, and sector-specific requirements for each deployment/data flow.

The state registry must record:

- jurisdiction
- effective date
- applicability thresholds
- covered data classes
- consumer/user rights
- consent requirements
- sensitive-data requirements
- sale/share/targeting restrictions
- retention/deletion rules
- breach obligations
- processor/controller obligations
- contractual requirements
- implementation controls
- policy version
- last legal review
- next review date

## Release gate

A regulated-data feature is not production-ready until:

1. Data classes are identified.
2. Applicable jurisdictions are determined.
3. Applicable federal and state controls are mapped.
4. Authorization and consent paths are tested.
5. Auditability is demonstrated.
6. Retention/deletion behavior is tested.
7. Incident handling is documented.
8. Vendors and subprocessors are mapped.
9. AI evaluation and provenance controls pass QA.
10. Security/privacy/legal review is recorded for the applicable deployment.

This document is an engineering control baseline. It does not substitute for counsel, regulatory filings, BAAs, contracts, certifications, or an independent security/privacy assessment.