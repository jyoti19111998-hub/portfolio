import sys
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation

NAVY, YEL = "1F3A5F", "FFF4D6"
thin = Side(style="thin", color="BFC7D1")
B = Border(left=thin, right=thin, top=thin, bottom=thin)

SHEETS = {
    "Data Inventory": (
        ["Data category", "Data Principals", "Examples of fields", "Source", "Purpose", "Lawful basis", "Exemption relied on", "Where stored", "Who has access", "Processors / vendors", "Stored outside India?", "Retention (see Retention sheet)", "Security notes"],
        [
            ["Client identity & contact", "Clients", "Name, phone, email, address, PAN, masked Aadhaar", "Client", "Matter opening, KYC, filings", "Consent + s.7(a)", "None", "Shared drive /Clients", "Partners, associates on matter", "Google Workspace", "Yes (cloud)", "Matter closure + 7 yrs", "MFA, folder permissions"],
            ["Litigation file", "Clients, opposite parties, witnesses", "Pleadings, evidence, statements", "Client, court, opponent", "Representation", "s.17(1)(a)", "s.17(1)(a)", "Physical file + drive", "Matter team", "Typist, photocopy vendor", "Yes (cloud)", "Matter closure + 7 yrs", "Locked cabinet, encrypted laptops"],
            ["Advisory / transactional file", "Clients, counterparties", "Agreements, due diligence data", "Client", "Advice, drafting", "Consent + s.7(a)", "None", "Drive", "Matter team", "Google Workspace", "Yes (cloud)", "Matter closure + 7 yrs", ""],
            ["Enquiries", "Prospective clients", "Name, phone, short facts", "Website, phone", "Respond, conflict check", "s.7(a)", "None", "Enquiry mailbox", "Front office", "Website host", "", "6 months", ""],
            ["Billing", "Clients", "Invoices, bank details, GSTIN", "Client", "Fees, accounts, tax", "s.7(a) / legal obligation", "None", "Accounting software", "Accounts", "CA firm", "", "8 yrs", ""],
            ["Personnel", "Staff, associates, interns", "KYC, bank, salary, attendance", "Employee", "Employment", "s.7(i)", "None", "HR folder", "Managing partner", "Payroll provider", "", "Exit + 8 yrs", ""],
        ],
    ),
    "Retention": (
        ["Category", "Trigger", "Retention period", "Legal basis / reason", "Disposal method", "Owner", "Last review"],
        [
            ["Closed client matter file", "Matter closure", "7 years", "Limitation + tax + buffer", "Shred / secure delete", "Office manager", ""],
            ["Client original documents", "Matter closure", "Return to client", "Client's property", "Return with acknowledgement", "Responsible partner", ""],
            ["Conflict-check record", "Matter closure", "Permanent (minimal)", "BCI Rules — conflicts", "N/A", "Privacy Contact", ""],
            ["Billing & books", "End of FY", "8 years", "Income-tax / GST", "Shred / secure delete", "Accounts", ""],
            ["Enquiries not engaged", "Last contact", "6 months", "No continuing purpose", "Delete", "Front office", ""],
            ["System & access logs", "Creation", "Minimum 1 year", "DPDP Rules", "Auto-delete", "IT", ""],
            ["Personnel files", "Exit", "8 years", "Labour & tax law", "Shred / secure delete", "Managing partner", ""],
            ["CCTV", "Recording", "30 days", "Security", "Overwrite", "Office manager", ""],
        ],
    ),
    "Rights Requests": (
        ["Ref (DPR-YYYY-NN)", "Date received", "Channel", "Requester name", "Requester type", "Right exercised", "Identity verified? (date)", "s.17 / other exemption considered", "Partner reviewing", "Acknowledged on", "Due date", "Response date", "Outcome", "Processors instructed?", "Notes"],
        [],
    ),
    "Breach Register": (
        ["Ref (BR-YYYY-NN)", "Date/time occurred", "Date/time Firm aware", "Discovered by", "Description", "Data categories", "No. of Data Principals", "Encrypted?", "Containment steps & time", "Board initial intimation (date/time)", "Board detailed report (date/time) — within 72h", "Data Principals informed (date, mode)", "Police / CERT-In / insurer", "Root cause", "Remedial actions", "Closed on", "Near-miss? (Y/N)"],
        [],
    ),
    "Vendors": (
        ["Vendor", "Service", "Data accessed", "Location of data", "DPA signed? (Doc 07 / own terms)", "Date signed", "Sub-processors", "Breach contact", "Next review", "Notes"],
        [["[Email & cloud provider]", "Email, drive", "All client data", "", "Own terms on file", "", "", "", "", ""],
         ["[IT support vendor]", "AMC, support", "Devices", "", "", "", "", "", "", ""],
         ["[Typist / stenographer]", "Typing", "Drafts", "", "Short-form undertaking", "", "", "", "", ""]],
    ),
    "Training & Acknowledgements": (
        ["Name", "Role", "Joined", "Doc 08 signed on", "Training attended (date)", "Breach drill (date)", "Access removed on (leavers)", "Devices returned / data deleted confirmed", "Notes"],
        [],
    ),
}

DROPDOWNS = {
    "Rights Requests": {"F": "Access,Correction,Erasure,Withdraw consent,Nomination,Grievance", "E": "Client,Former client,Opposite party,Witness,Employee,Applicant,Website user,Other", "M": "Fulfilled,Partly fulfilled,Refused,Withdrawn"},
    "Breach Register": {"H": "Yes,No,Partly", "Q": "Y,N"},
    "Data Inventory": {"G": "None,s.17(1)(a),Other — note"},
}

wb = Workbook()
ws0 = wb.active
ws0.title = "Read Me"
ws0["A1"] = "DPDP Registers — [Firm name]"
ws0["A1"].font = Font(bold=True, size=16, color=NAVY)
lines = [
    "This workbook is part of the DPDP Compliance Kit for Law Firms. Keep it in a restricted folder; it is itself confidential.",
    "Data Inventory — what personal data the Firm holds, why, where, and on what lawful basis (Guide s.3).",
    "Retention — final retention schedule adopted under Doc 04.",
    "Rights Requests — every access/correction/erasure/withdrawal/grievance/nomination request (Doc 05). Grievances: max. 90 days.",
    "Breach Register — every breach and near-miss (Doc 06). Detailed Board report due within 72 hours of becoming aware.",
    "Vendors — every processor and the contract in place (Doc 07).",
    "Training & Acknowledgements — Doc 08 sign-offs, training, drills, leavers.",
    "Example rows are illustrative; replace them with your own. Review all sheets quarterly.",
]
for i, t in enumerate(lines, start=3):
    ws0.cell(row=i, column=1, value=t).alignment = Alignment(wrap_text=True)
ws0.column_dimensions["A"].width = 120

for name, (headers, rows) in SHEETS.items():
    ws = wb.create_sheet(name)
    for c, h in enumerate(headers, 1):
        cell = ws.cell(row=1, column=c, value=h)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill("solid", fgColor=NAVY)
        cell.alignment = Alignment(wrap_text=True, vertical="center")
        cell.border = B
        ws.column_dimensions[cell.column_letter].width = max(14, min(32, len(h) + 4))
    ws.row_dimensions[1].height = 42
    for r, row in enumerate(rows, 2):
        for c, v in enumerate(row, 1):
            cell = ws.cell(row=r, column=c, value=v)
            cell.alignment = Alignment(wrap_text=True, vertical="top")
            cell.border = B
            cell.fill = PatternFill("solid", fgColor=YEL)
    for r in range(len(rows) + 2, 60):
        for c in range(1, len(headers) + 1):
            ws.cell(row=r, column=c).border = B
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions
    for col, opts in DROPDOWNS.get(name, {}).items():
        dv = DataValidation(type="list", formula1=f'"{opts}"', allow_blank=True)
        ws.add_data_validation(dv)
        dv.add(f"{col}2:{col}500")

wb.save(sys.argv[1])
print("wrote", sys.argv[1])
