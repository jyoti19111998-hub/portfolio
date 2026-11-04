# DPDP Compliance Kit for Law Firms

A ready-to-adapt set of documents that helps a small or mid-sized law firm, an advocate's chambers or a solo practice comply with the **Digital Personal Data Protection Act, 2023** and the **DPDP Rules, 2025**. The core duties apply from **May 2027**.

| # | File | What it is |
|---|------|------------|
| 00 | `00_Implementation_Guide.docx` | How the law applies to a practice, who's who, the s.17(1)(a) litigation exemption, privilege, risk hotspots, 30-day plan, checklist, penalties |
| 01 | `01_Client_Privacy_Notice.docx` | Notice under s.5 / Rule 3, given to clients at intake |
| 02 | `02_Engagement_Letter_Data_Clause_and_Consent.docx` | Engagement-letter clause, client consent form, withdrawal form |
| 03 | `03_Website_Privacy_Policy.docx` | Website policy, cookie banner and enquiry-form text |
| 04 | `04_Data_Retention_and_Erasure_Policy.docx` | Retention schedule and secure-destruction process |
| 05 | `05_Data_Principal_Rights_SOP_and_Templates.docx` | SOP and letters R0–R6 for access, correction, erasure, withdrawal, opponent requests and grievances |
| 06 | `06_Breach_Response_Playbook.docx` | 72-hour playbook and Board/client intimation templates |
| 07 | `07_Data_Processing_Agreement_Vendors.docx` | Vendor DPA under s.8(2), plus a short-form undertaking for typists and freelancers |
| 08 | `08_Staff_Associate_Intern_Data_Handling_Policy.docx` | Ten office rules (WhatsApp, email, devices, AI tools, court) and an acknowledgement form |
| 09 | `09_Employee_and_Intern_Privacy_Notice.docx` | Privacy notice for the firm's own staff and interns |
| 10 | `10_Chambers_Security_Checklist.docx` | Rule 6 safeguards as a 20-point checklist |
| 11 | `11_DPDP_Registers.xlsx` | Registers: data inventory, retention, rights requests, breaches, vendors, training |

Text in yellow `[brackets]` is a placeholder to fill in. Shaded boxes are drafting notes for the advocate and should be removed before a document is issued.

## Before selling or issuing

- Check the rule numbers and the Phase 3 commencement date against the official Gazette text on meity.gov.in.
- Check the retention periods against current tax, GST and limitation law.
- Keep any marketing within Bar Council of India Rule 36.

## Regenerating the files

The files are generated from `source/`. To change content, edit the `doc*.js` files and run:

```bash
cd source
node build.js ..                       # needs the `docx` npm package
python3 registers.py ../11_DPDP_Registers.xlsx   # needs openpyxl
```
