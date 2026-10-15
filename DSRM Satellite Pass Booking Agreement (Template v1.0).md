# DSRM Satellite Pass Booking Agreement

*Template v1.0 for the DSRM marketplace. Bracketed items \[LIKE THIS\] are placeholders to fill or decide. This is a drafting template, not legal advice. Have qualified counsel review it before real funds or real operators are involved.*

---

## How this document is used

The Buyer completes **Part A (Booking Schedule)**, reads **Part B (Terms)**, ticks each acknowledgement in **Part C**, then signs one EIP-712 typed-data message in MetaMask (no gas, no funds moved). The signed message contains the hash of this exact document version. Only after the signature is verified does the Buyer call `depositEscrow`, which records the same hash on-chain.

---

# PART A: BOOKING SCHEDULE (filled by the Buyer)

| # | Field | Source | Required |
| --- | --- | --- | --- |
| A1 | Booking ID (bytes32) | Auto-generated | Yes |
| A2 | Buyer wallet address | Auto-filled from wallet | Yes |
| A3 | Buyer type: Individual / Company / Institution / Autonomous Agent | Select | Yes |
| A4 | Legal name or entity name | Typed | Yes |
| A5 | Country of residence or incorporation | Select | Yes |
| A6 | Contact email for notices | Typed | Yes |
| A7 | If Autonomous Agent: name and legal address of the responsible human or entity (the Principal) | Typed | Yes, if A3 is Agent |
| A8 | Operator wallet address and satellite identifier (NORAD ID) | Auto-filled from listing | Yes |
| A9 | Service type: Bandwidth / Observation Pass / Edge Compute | Auto-filled | Yes |
| A10 | Pass window start and end (UTC, Unix seconds) | Auto-filled | Yes |
| A11 | Target ground station or target region (lat/long or named area) | Typed or map | Yes |
| A12 | Requested parameters: frequency band, minimum elevation angle, data volume, latency target | Typed | Yes |
| A13 | Intended use category (see Schedule C) | Select | Yes |
| A14 | Price in wei, platform fee, estimated gas | Auto-filled | Yes |
| A15 | Network and contract address | Auto-filled | Yes |
| A16 | Terms version and termsHash | Auto-filled | Yes |
| A17 | Signature deadline and nonce | Auto-filled | Yes |

---

# PART B: TERMS

## Article 1. Definitions

1.1 **Agreement**: Part A, this Part B, and Schedules A to F, in the version identified by the Terms Hash.

1.2 **Platform**: the DSRM web application, backend services and APIs operated by \[DSRM LEGAL ENTITY NAME\].

1.3 **Operator**: the party that owns or controls the Satellite and has listed the Window.

1.4 **Buyer**: the party identified in A2 to A4, including any Principal in A7.

1.5 **Oracle**: the attestation service, or set of attesters, authorized in the Escrow Contract to submit Attestations.

1.6 **Escrow Contract**: the smart contract at the address in A15.

1.7 **Window**: the pass window in A10.

1.8 **Attestation**: a signed record of Measured Metrics for a Window, including the Evidence Hash.

1.9 **Evidence Hash**: SHA-256 digest of the telemetry evidence bundle described in Schedule E.

1.10 **Delivery Ratio (D)**: the percentage of requested service delivered, computed under Schedule B.

1.11 **Terms Hash**: keccak256 of the canonical text of this Agreement as pinned to IPFS at \[IPFS CID\].

1.12 **Excused Event**: an event listed in Article 10.

1.13 **Business Day**, **Notice**, **Dispute**, **Challenge Window** have the meanings given where first used.

## Article 2. Parties and roles

2.1 The Platform is a technology intermediary. It is not the satellite carrier, does not operate any Satellite, and does not take custody of Buyer funds. Funds are held only by the Escrow Contract.

2.2 The Operator provides the service. The Operator is solely responsible for its licences, spectrum rights, insurance and compliance. The Operator has accepted the Operator Listing Agreement with the Platform, which is separate from this Agreement.

2.3 The Oracle reports measured performance. The Oracle is not a party to the service and does not guarantee the Operator's performance.

2.4 No partnership, agency, employment or joint venture arises between any of the Platform, Operator, Buyer and Oracle.

## Article 3. Formation, signature and version control

3.1 **Acceptance.** The Buyer accepts this Agreement by (a) ticking every acknowledgement in Part C and (b) signing the EIP-712 BookingAgreement message described in Schedule D with the wallet in A2.

3.2 **Electronic signature.** The parties agree that a valid wallet signature over the typed data is an electronic signature with the same effect as a handwritten signature, to the extent permitted by applicable law, including \[IT Act 2000 (India) / ESIGN and UETA (US) / eIDAS (EU)\].

3.3 **Binding version.** The binding text is the document whose hash equals the Terms Hash recorded in the signature and in the `depositEscrow` transaction. If the displayed text and the pinned text differ, the pinned text controls.

3.4 **No silent changes.** The Platform will not alter a version after publication. Changes are published as a new version with a new Terms Hash and apply only to bookings signed after publication.

3.5 **Order of precedence.** If documents conflict: (1) the Escrow Contract's settlement logic as to movement of funds, (2) Part A, (3) Schedules, (4) Part B, (5) Platform documentation.

3.6 **Signature expiry.** A signature is valid only until the deadline in A17 and may be used once (nonce).

3.7 **Agent signatures.** Where an Autonomous Agent signs, the Principal in A7 is bound as if it signed personally. The Principal warrants the Agent is authorized, rate-limited and monitored.

## Article 4. Eligibility and representations

4.1 The Buyer represents that: (a) it is at least 18 years old and has legal capacity, or is a duly organized entity with authority; (b) it controls the wallet in A2 and the funds used; (c) information in Part A is true and complete; (d) the funds are not proceeds of unlawful activity.

4.2 The Buyer represents that neither it nor any owner, controller or Principal is (a) on, or owned or controlled by anyone on, any sanctions or restricted-party list of the UN, US, EU, UK, India or any other applicable authority, or (b) located in or ordinarily resident in a comprehensively sanctioned jurisdiction.

4.3 The Buyer will promptly notify the Platform if any representation becomes untrue.

4.4 The Platform may refuse a booking before deposit if screening fails. Any funds already deposited are then refunded under Article 8.5.

## Article 5. The service

5.1 **Service.** The Operator will make the Satellite available during the Window for the service type in A9 and parameters in A12, subject to this Agreement.

5.2 **Best-effort physical limits.** The parties acknowledge that satellite service depends on orbital mechanics, elevation angle, atmospheric and space weather, and ground equipment. The Operator will use commercially reasonable efforts to meet A12, but outcomes are measured only by Schedule B.

5.3 **Orbital data.** Pass times shown on the Platform are predictions from public orbital elements (TLE) and may differ from actual passes. The Operator's confirmed schedule at the start of the Window controls.

5.4 **Scope exclusions.** Unless stated in A12, the service excludes: ground terminals, antennas, licensing for the Buyer's own transmissions, downstream data processing, and any guarantee of imagery content, cloud-free conditions or target visibility.

5.5 **Buyer responsibilities.** The Buyer will provide accurate parameters, operate only authorized equipment, and comply with Schedule C. Failure to follow Operator technical procedures in Schedule E is an Excused Event for the affected portion.

## Article 6. Price, escrow and fees

6.1 **Deposit.** The Buyer will deposit the amount in A14 into the Escrow Contract. Funds are locked until settlement under Article 8.

6.2 **Fees.** The Platform fee in A14 is \[x\]% of the price and is \[deducted at release / paid separately\]. The Buyer pays network gas fees. Gas fees are non-refundable.

6.3 **No custody.** Neither the Platform nor the Operator can withdraw escrowed funds except as the Escrow Contract's code permits.

6.4 **Currency and value risk.** Prices are fixed in the asset and amount in A14. The Buyer bears exchange-rate risk.

6.5 **Testnet notice.** If A15 identifies a test network, funds have no monetary value and no real service will be delivered, and Articles 8 to 10 and 14 to 16 apply only to the extent of simulated outcomes. **This notice must be removed for production versions.**

6.6 **Taxes.** Each party is responsible for its own taxes. Where required by law, the Platform may collect or report \[GST/VAT/other\].

## Article 7. Performance measurement and attestation

7.1 **Metrics.** Performance is measured by the metrics in Schedule B, including packet error rate, signal integrity, Doppler stability, contact duration and data volume delivered.

7.2 **Attestation.** After the Window ends, the Oracle will submit an Attestation to the Escrow Contract within the Attestation Deadline in Schedule B.

7.3 **Independence.** \[PRODUCTION: Attestations require signatures from at least \[2\] of \[3\] independent attesters, and no attester may be controlled by the Operator.\] \[SIMULATED PHASE: the Oracle is operated by the Platform and results are simulated; the Buyer acknowledges this limitation.\]

7.4 **Evidence.** The Evidence Hash commits to the evidence bundle. The Platform will retain the bundle for at least \[24\] months and make it available to the Buyer, Operator and any arbitrator on request.

7.5 **Integrity limit.** A hash proves evidence was not altered after attestation. It does not by itself prove the event occurred. The parties accept the attestation process in this Article as the agreed method of measurement.

7.6 **Attester conduct.** Attesters must disclose conflicts of interest. An attester that signs a false Attestation may be removed and, where staking applies, penalized under the Platform's Oracle Rules.

## Article 8. Settlement: release, partial payment and refund

8.1 **Outcome tiers.** Settlement follows the Delivery Ratio D and the table in Schedule B.

8.2 **Release.** When an Attestation shows D at or above the Full Release threshold and the Challenge Window closes without a valid Dispute, the Escrow Contract releases the price to the Operator, less the Platform fee.

8.3 **Partial settlement.** Where D falls in the partial band, the Escrow Contract pays the Operator the price multiplied by D and refunds the remainder to the Buyer.

8.4 **Failure.** Where D is below the refund threshold, the Escrow Contract refunds the full price to the Buyer, less non-refundable gas.

8.5 **Pre-window cancellation or screening failure.** Refund follows the schedule in Article 17.

8.6 **Oracle silence fallback.** If no Attestation is submitted by the Fallback Deadline in Schedule B, the Buyer may call the refund function and recover the full price. The Operator is not paid unless a later valid Attestation is accepted through the Dispute process before the refund executes.

8.7 **Finality.** Settlement executed by the Escrow Contract is final as to the movement of funds. Remedies beyond escrowed funds are governed by Articles 9 and 15.

8.8 **Rounding.** Amounts are computed in wei with integer division. Any remainder of less than one unit goes to the Buyer.

## Article 9. Disputes

9.1 **Challenge Window.** After an Attestation, the Buyer or Operator may open a Dispute during the Challenge Window in Schedule B by calling the dispute function and posting a bond of \[amount\].

9.2 **Effect.** A Dispute pauses settlement for that booking. Funds stay in escrow.

9.3 **Evidence.** Each party may submit evidence within \[5\] days. The Platform will provide the evidence bundle to both.

9.4 **Resolution.** Disputes are decided by \[a panel of independent attesters / a named arbitration service / the arbitrator under Article 19\]. The decision instructs the Escrow Contract how to settle. The losing party forfeits its bond to the winner.

9.5 **Frivolous disputes.** A Dispute opened without reasonable grounds may be penalized by loss of bond and suspension from the Platform.

9.6 **Negotiation first.** Before any proceeding outside the Platform, the parties will attempt good-faith resolution for \[15\] days after Notice of the claim.

## Article 10. Excused events

10.1 A party is not in breach, and the affected portion of the Window is excluded from the Delivery Ratio denominator or treated per Schedule B, to the extent performance is prevented by:

- (a) severe space weather, solar storm or radiation event affecting the Satellite or link;
- (b) collision-avoidance or station-keeping maneuvers, or safe-mode events, that the Operator reasonably undertakes to protect the spacecraft;
- (c) governmental order, spectrum authority direction or lawful interference;
- (d) failure of public networks, power or ground infrastructure outside the Operator's control;
- (e) the Buyer's error, incorrect parameters, or non-compliance with Schedule E procedures;
- (f) war, hostilities, terrorism, or natural disaster.

10.2 The Operator must give Notice of an Excused Event through the Platform as soon as practicable and within \[24\] hours after the Window. Unnotified events are not excused.

10.3 If an Excused Event prevents more than \[50\]% of the Window, the Buyer may elect refund of the unused portion.

10.4 Excused Events do not excuse payment obligations already satisfied by escrow settlement under Article 8.

## Article 11. Acceptable use, export controls and sanctions

11.1 The Buyer will use the service only for the intended-use category in A13 and in compliance with Schedule C.

11.2 **Prohibited uses.** The Buyer will not use the service for: (a) military, intelligence or weapons-related purposes unless expressly licensed and disclosed; (b) surveillance of individuals without lawful basis; (c) interference with other satellites or services; (d) any activity unlawful where the service is received or the data used; (e) circumventing sanctions or export controls.

11.3 **Export controls.** The Buyer is responsible for any licence or authorization needed to receive, process, re-export or transfer data or technology obtained through the service, under laws including \[US EAR/ITAR, EU Dual-Use Regulation, India SCOMET and applicable space-sector rules\].

11.4 **Right to suspend.** The Platform and Operator may suspend or cancel a booking and trigger refund, if they reasonably suspect breach of this Article or screening failure. Where cancellation is for Buyer breach, the Buyer bears gas and any documented costs.

11.5 **Reporting.** The Platform may disclose information to authorities where required by law.

## Article 12. Data, intellectual property and confidentiality

12.1 **Buyer data rights.** Subject to payment settlement and Schedule C, the Operator grants the Buyer a \[non-exclusive, worldwide, perpetual\] licence to use the data delivered in the Window for the declared intended use. Ownership of the Satellite, its systems and underlying technology remains with the Operator.

12.2 **Restrictions.** Unless A12 states otherwise, the Buyer may not resell raw data or redistribute it as a competing satellite service without Operator consent.

12.3 **Platform materials.** The Platform retains all rights in the DSRM software, interface, trademarks and aggregated analytics.

12.4 **Confidentiality.** Each party will keep the other's non-public technical or commercial information confidential and use it only for this Agreement, except as required by law. This does not apply to information that is public, independently developed, or lawfully received from a third party. Obligations last \[3\] years after the Window.

12.5 **On-chain data.** The parties acknowledge that wallet addresses, booking IDs, amounts and Terms Hash are public and permanent on the blockchain and cannot be deleted.

## Article 13. Privacy and data protection

13.1 The Platform processes personal data per its Privacy Notice and applicable law, including \[India DPDP Act 2023, GDPR where applicable\].

13.2 Personal data in Part A (name, country, email) is stored off-chain with access controls. Only hashes are placed on-chain.

13.3 The Platform will not sell personal data. It may share data with the Operator, Oracle attesters, screening providers and authorities only as needed to perform this Agreement or comply with law.

13.4 The Buyer may request access, correction or deletion of off-chain personal data, subject to legal retention duties and the permanence of on-chain records.

13.5 The parties will notify each other without undue delay and within \[72\] hours of becoming aware of a personal data breach affecting this Agreement.

## Article 14. Warranties and disclaimers

14.1 The Operator warrants that it has the right and licences to provide the service and will provide it with reasonable skill and care.

14.2 Except as stated, the service, the Platform and the Oracle are provided **as is** and **as available**. To the maximum extent allowed by law, all implied warranties are disclaimed, including merchantability, fitness for a particular purpose and non-infringement.

14.3 The Platform does not warrant that the Platform, Escrow Contract or Oracle will be uninterrupted, error-free or free from vulnerabilities.

14.4 Nothing excludes any warranty or liability that cannot lawfully be excluded.

## Article 15. Limitation of liability

15.1 To the maximum extent permitted by law, no party is liable for indirect, incidental, special, consequential or punitive damages, or loss of profit, revenue, data or goodwill.

15.2 Each party's total liability under this Agreement is limited to the price in A14.

15.3 The Platform is not liable for the Operator's acts or omissions, or for losses caused by user error, wrong network, lost keys, wallet compromise, or third-party wallet and node software.

15.4 The limits in this Article do not apply to: fraud or wilful misconduct, breach of Article 11, breach of confidentiality, or any liability that cannot be limited by law.

## Article 16. Indemnification

16.1 The Buyer will indemnify the Platform and Operator against third-party claims and costs arising from the Buyer's breach of Articles 4 and 11, or its unlawful use of the service or data.

16.2 The Operator will indemnify the Platform and Buyer against third-party claims arising from the Operator's lack of licence or its breach of Article 14.1.

16.3 The indemnified party will give prompt Notice, reasonable cooperation, and control of the defence to the indemnifying party, who may not settle in a way that binds the indemnified party without consent.

## Article 17. Term, cancellation and termination

17.1 **Term.** This Agreement begins on the deposit transaction and ends when settlement completes and all claims are resolved.

17.2 **Buyer cancellation.** Refund of the price, less gas and the platform fee where stated: more than \[24\] hours before the Window start, \[100\]%; between \[24\] hours and \[2\] hours before, \[50\]%; less than \[2\] hours before, \[0\]% unless Article 10 applies.

17.3 **Operator cancellation.** If the Operator cancels or reschedules outside the Window, the Buyer receives a full refund and the Operator may be penalized under its Listing Agreement.

17.4 **Termination for breach.** Either party may terminate on Notice if the other materially breaches and fails to cure within \[5\] days, or immediately for breach of Article 11.

17.5 **Survival.** Articles 1, 7 (evidence), 8, 9, 11 to 13, 15, 16, 19 and 20 survive.

## Article 18. Smart contract and blockchain risk acknowledgements

18.1 The Buyer acknowledges that: (a) blockchain transactions are irreversible; (b) sending funds from the wrong wallet, to a wrong address, or on the wrong network may result in permanent loss; (c) smart contracts may contain bugs despite testing or audit; (d) oracle failure, compromise or collusion could cause incorrect settlement; (e) network congestion, gas spikes, reorganizations or front-running may delay or alter transaction outcomes; (f) loss of wallet keys cannot be recovered by the Platform; (g) regulation of digital assets may change.

18.2 **Audit status.** The Escrow Contract \[has / has not\] been independently audited. Audit report: \[LINK or NONE\].

18.3 **Upgradeability and admin powers.** The Escrow Contract \[is immutable / is upgradeable via \[multisig address, threshold\]\]. Admin powers are limited to: \[pause new deposits, rotate attesters\]. Admin cannot withdraw escrowed funds.

18.4 **Emergency pause.** The Platform may pause new deposits for security reasons. A pause does not block refund or settlement of existing bookings.

18.5 **Code and text.** Where this Agreement and contract code differ on fund movement, Article 3.5 applies.

## Article 19. Governing law, jurisdiction and arbitration

19.1 **Governing law:** \[LAW, e.g. laws of India\], without regard to conflict-of-law rules.

19.2 **Arbitration:** Disputes not resolved under Article 9 will be finally resolved by arbitration under \[SIAC / ICC / LCIA / Arbitration and Conciliation Act 1996 rules\], seat \[CITY\], language English, by \[1 / 3\] arbitrator(s).

19.3 **Courts:** For interim relief and enforcement, courts of \[CITY, COUNTRY\] have non-exclusive jurisdiction.

19.4 **Consumer carve-out:** Nothing here removes mandatory consumer rights where the Buyer is a consumer under local law.

19.5 **Class waiver:** To the extent permitted by law, claims are brought individually and not as a class or representative action.

## Article 20. General

20.1 **Entire agreement.** This Agreement, the Operator Listing Agreement as it relates to the service, the Platform Terms of Use and Privacy Notice form the whole agreement on its subject.

20.2 **Amendments.** Only by a new version under Article 3.4.

20.3 **Severability.** If a provision is unenforceable, the rest remains in force and the provision is modified to the minimum extent needed.

20.4 **Assignment.** The Buyer may not assign without consent. The Platform may assign to a successor of its business on Notice.

20.5 **Notices.** By email to A6 or the Platform's notice address, and through the Platform dashboard. Notices are effective on sending, unless a delivery failure is received.

20.6 **No waiver.** Failure to enforce a right is not waiver.

20.7 **Third parties.** No one other than the parties and the Operator has rights under this Agreement.

20.8 **Language and translations.** The English version controls.

20.9 **Counterparts and electronic records.** Electronic records of this Agreement, signatures and Platform logs are admissible evidence.

---

# PART C: BUYER ACKNOWLEDGEMENTS (each must be ticked)

- [ ] C1. I have read this Agreement and the Terms Hash shown matches the version pinned at \[IPFS CID\].
- [ ] C2. I understand the Platform is not the satellite carrier and holds no funds.
- [ ] C3. I understand service quality is measured only by Schedule B and that partial or zero delivery leads to partial payment or refund.
- [ ] C4. I understand the Oracle's role and limits (Article 7), including that \[PRODUCTION: attesters are independent / SIMULATED: results are simulated\].
- [ ] C5. I confirm that I am not subject to sanctions and will comply with export-control law (Articles 4 and 11).
- [ ] C6. I confirm my intended use matches Schedule C and I will not use the service for prohibited purposes.
- [ ] C7. I accept blockchain risks, including irreversibility and smart contract risk (Article 18).
- [ ] C8. I accept the cancellation and refund schedule (Article 17) and the liability limits (Article 15).
- [ ] C9. I consent to processing of my personal data as described (Article 13).
- [ ] C10. If I am an Autonomous Agent operator: I am the Principal and accept responsibility for the Agent's actions.

---

# SCHEDULES

## Schedule A. Parties and addresses

| Role | Name | Address / Wallet | Notice contact |
| --- | --- | --- | --- |
| Platform | \[DSRM ENTITY\] | \[ADDRESS\] | \[EMAIL\] |
| Operator | From listing | From listing | From listing |
| Buyer | A4 | A2 | A6 |
| Escrow Contract | SatelliteEscrow | 0x5CDcB7F47De1aE89A24Adb55b0876C765C437735 (Sepolia) | n/a |
| Oracle address | From contract | 0xc25f9F0Ce27A2D248c43563a32cDC4886D069176 | n/a |

## Schedule B. Service levels, metrics and settlement table

**Measured Metrics (examples, set per service type)**

| Metric | Definition | Target |
| --- | --- | --- |
| Contact duration | Seconds of valid link above minimum elevation | at least \[90\]% of the Window's predicted contact |
| Packet error rate | Failed frames divided by total frames | at most \[1\]% |
| Signal integrity | SNR or Eb/N0 above threshold | at least \[X\] dB for \[90\]% of contact |
| Doppler stability | Residual Doppler error after correction | within \[X\] Hz |
| Data volume | Bytes delivered | at least \[90\]% of requested |
| Latency (if relevant) | Round-trip or downlink delay | at most \[X\] ms |

**Delivery Ratio:** D = weighted average of metric scores, with weights stated in A12 (default: contact 40%, data volume 30%, packet error 20%, signal integrity 10%). Time covered by Excused Events is removed from the denominator.

**Settlement table**

| Delivery Ratio D | Operator receives | Buyer receives |
| --- | --- | --- |
| 95% or more | 100% of price (less platform fee) | 0% |
| 70% to below 95% | Price multiplied by D | Remainder |
| Below 70% | 0% | 100% of price (less gas) |

**Timing**

| Item | Value |
| --- | --- |
| Attestation Deadline | \[24\] hours after Window end |
| Challenge Window | \[12\] hours after Attestation is posted |
| Fallback Deadline (oracle silence) | \[48\] hours after Window end |
| Dispute bond | \[amount\] |

## Schedule C. Acceptable use and export declaration

Intended-use categories (Buyer selects one): (1) Scientific research and education; (2) Commercial communications; (3) Commercial Earth observation (non-defence); (4) Edge compute and experimentation; (5) Government civil use; (6) Other \[describe, subject to Platform approval\].

Buyer declares: no military end-use, no intent to re-export to restricted parties or destinations, and that the target region in A11 is not subject to a legal restriction on observation or communication known to the Buyer. High-risk categories or regions may require enhanced due diligence before booking is accepted.

## Schedule D. EIP-712 signing specification

Domain: name DSRM, version 1, chainId from A15, verifyingContract equal to the Escrow Contract.

Primary type BookingAgreement: bookingId (bytes32), buyer (address), operator (address), windowStart (uint64), windowEnd (uint64), amountWei (uint256), termsHash (bytes32), useDeclarationHash (bytes32), nonce (uint256), deadline (uint64).

Personal data is never in the signed message, only hashes. The backend verifies the signature, stores it with the nonce, and the Escrow Contract rejects a deposit whose termsHash or nonce does not match.

## Schedule E. Evidence bundle and operating procedures

Evidence bundle contains: ground station identifier and location, antenna and receiver metadata, signed per-frame or per-block telemetry, Doppler and SNR logs, pass geometry computed from the TLE epoch used, timestamps from a disclosed time source, and the attester signatures. The bundle is serialized in a canonical format and hashed with SHA-256 for the Evidence Hash. Operator procedures: handshake window, authentication method, and Buyer equipment requirements are listed in A12 or the linked Operator technical sheet.

## Schedule F. Version log

| Version | Date | Terms Hash | IPFS CID | Summary of change |
| --- | --- | --- | --- | --- |
| 1.0 | \[DATE\] | \[HASH\] | \[CID\] | Initial release |

---

*Companion documents still needed for a complete legal set: Operator Listing Agreement, Platform Terms of Use, Privacy Notice, Oracle Rules, and Sanctions and KYC Policy.*
