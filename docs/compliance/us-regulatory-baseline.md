# Legacy OS US Compliance Baseline

Status: engineering baseline, not a legal opinion or certification.

## Scope

Legacy OS is designed as a privacy-first evidence and memory system that may process health, financial, identity, location, communications, signatures, family/relationship, business, and digital-legacy information. Regulatory applicability depends on the product's actual role, customers, contracts, data flows, and jurisdictions.

The system therefore uses the strictest applicable control where practical and never represents a voluntary framework or engineering control as legal certification.

## Federal baseline

| Domain | Baseline | Engineering requirement |
|---|---|---|
| Health | HIPAA Privacy/Security/Breach Notification where applicable; HITECH | Explicit role/authorization, minimum-necessary access, auditability, integrity, availability, transmission security, incident response, BAAs where applicable |
| SUD | 42 CFR Part 2 where applicable | Separate sensitive classification and disclosure/consent controls; never assume ordinary health authorization is sufficient |
| Consumer health | FTC Health Breach Notification Rule where applicable | Health-data inventory, breach detection, notification workflow, truthful privacy disclosures |
| Financial | GLBA/Safeguards Rule where applicable | Written security program, vendor controls, access controls, encryption, monitoring, incident response |
| Consumer protection | FTC Act | No deceptive privacy/security/compliance claims; product claims must match actual controls |
| AI | NIST AI RMF 1.0 + GenAI Profile as engineering baseline | Govern, map, measure, manage; provenance, human oversight, evaluation, transparency, security, privacy, bias/risk controls |
| Cybersecurity | NIST CSF 2.0 | Govern, identify, protect, detect, respond, recover; evidence-backed control mapping |
| Privacy | NIST Privacy Framework | Data processing inventory, privacy risk assessment, data minimization, purpose limitation, individual participation, governance |
| Electronic records/signatures | Applicable federal/state e-signature laws and contract requirements | Preserve signature artifact, signer identity, timestamp, consent/disclosure version, integrity hash, audit trail |

## State baseline

The product must maintain a jurisdiction matrix for all 50 states and DC, updated whenever privacy, health, financial, biometric, breach, recording, electronic-signature, AI, consumer-protection, or sector-specific law changes.

At minimum, the matrix must track:

- comprehensive consumer privacy laws and sensitive-data rules
- health-data laws outside HIPAA
- biometric/privacy laws
- genetic/privacy laws
- breach-notification requirements
- data-sale/share/targeted-advertising opt-outs
- universal opt-out mechanisms where required
- minors/children requirements
- medical-record and health-record requirements
- mental-health, reproductive-health, HIV/STI and other specially protected records
- SUD/Part 2 interactions
- financial-data/privacy requirements
- communications and recording consent
- location/precise-geolocation requirements
- electronic-signature and electronic-record requirements
- AI-specific obligations
- data retention/deletion requirements
- contracts, notices, consumer-request workflows and response deadlines

## Virginia launch baseline

Virginia is the initial operating jurisdiction and must receive a dedicated control profile covering the Virginia Consumer Data Protection Act and other applicable Virginia privacy, breach, health, financial, recording, electronic-signature and consumer-protection requirements.

## Data classification

Before retrieval or model processing, classify data at least as:

- public
- personal
- sensitive personal
- health/PHI
- SUD/Part 2
- financial
- credential/authentication secret
- biometric
- precise location
- communications/content
- child/minor data
- legal/estate
- business-confidential

Multiple classifications may apply. The strictest applicable handling policy wins.

## Mandatory access pipeline

```text
identity
  -> relationship resolution
  -> jurisdiction
  -> data classification
  -> purpose
  -> authorization
  -> active consent
  -> minimum necessary
  -> source policy
  -> retrieval
  -> corroboration
  -> AI reasoning
  -> response policy
  -> audit event
```

Unauthorized evidence must never reach the model merely to be filtered afterward.

## Evidence and AI requirements

Every substantive Echo finding must retain:

- claim
- evidence IDs
- source IDs
- source type
- acquisition timestamp
- evidence timestamp when known
- authorization basis
- consent version/ID where applicable
- jurisdiction/policy decision
- model/version used
- knowledge state
- confidence
- unresolved gaps
- human confirmation where required

Echo must distinguish **known**, **reconstructed**, **inferred**, and **unknown**. It must not convert missing evidence into a factual claim.

## Security requirements

Engineering target: controls mapped to NIST CSF 2.0 and applicable sector rules, including:

- strong authentication and session security
- least privilege
- encryption in transit and at rest
- secrets management
- immutable or tamper-evident audit logs
- key rotation
- secure deletion where required
- backup and disaster recovery
- vulnerability management
- dependency/SBOM monitoring
- incident detection and response
- breach assessment and notification workflows
- vendor/subprocessor inventory and due diligence
- secure development lifecycle
- penetration/security testing before regulated production

## Compliance claims

Do not state that Legacy OS is "HIPAA compliant," "legally compliant in all 50 states," "certified," or equivalent solely because these engineering controls exist. Such claims require an applicability analysis, documented operational controls, contractual review, and appropriate independent legal/security assessment.

The engineering goal is **compliance-by-design and evidence-ready controls that meet or exceed applicable requirements**, with jurisdiction-specific legal review before production deployment in regulated use cases.
