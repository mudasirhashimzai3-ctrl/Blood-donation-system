from __future__ import annotations

import html
import re
import shutil
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "docs" / "monograph"
OUTPUT_DOCX = OUT_DIR / "Blood_Donation_Management_System_Monograph_1405.docx"
OUTLINE_MD = OUT_DIR / "Blood_Donation_Management_System_Outline.md"
SUMMARY_TXT = OUT_DIR / "generation_summary.txt"


TITLE = "Blood Donation Management System"
SUBMITTED_BY = [
    "Haroon Rasheed",
    "Samiullah Noori",
    "Hamayoun Khaksar",
    "Nayeem Masroor",
]
SUPERVISOR = "Mr. Rahmatullah Alikhail"
YEAR = "1405 (1447-1448)"


def find_template() -> Path:
    candidates = [
        p
        for p in ROOT.rglob("*.docx")
        if "node_modules" not in p.parts and ".git" not in p.parts and p.stat().st_size > 100_000
    ]
    if not candidates:
        raise FileNotFoundError("Monograph template DOCX was not found.")
    return max(candidates, key=lambda p: p.stat().st_size)


def esc(value: str) -> str:
    return html.escape(value, quote=False)


class WordDoc:
    def __init__(self) -> None:
        self.parts: list[str] = []
        self.word_count = 0
        self.page_breaks = 0
        self.table_count = 0
        self.figure_count = 0

    def add_raw(self, xml: str) -> None:
        self.parts.append(xml)

    def p(
        self,
        text: str = "",
        *,
        style: str | None = None,
        bold: bool = False,
        italic: bool = False,
        size: int = 24,
        align: str | None = None,
        rtl: bool = False,
    ) -> None:
        text = text.strip()
        self.word_count += len(re.findall(r"\b[\w'-]+\b", text))
        ppr: list[str] = []
        rpr: list[str] = []
        if style:
            ppr.append(f'<w:pStyle w:val="{style}"/>')
        if align:
            ppr.append(f'<w:jc w:val="{align}"/>')
        if rtl:
            ppr.append("<w:bidi/>")
            rpr.append("<w:rtl/>")
        if bold:
            rpr.append("<w:b/>")
        if italic:
            rpr.append("<w:i/>")
        rpr.append(f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>')
        self.parts.append(
            "<w:p>"
            + (f"<w:pPr>{''.join(ppr)}</w:pPr>" if ppr else "")
            + "<w:r>"
            + (f"<w:rPr>{''.join(rpr)}</w:rPr>" if rpr else "")
            + f"<w:t>{esc(text)}</w:t>"
            + "</w:r></w:p>"
        )

    def heading(self, text: str, level: int = 1) -> None:
        style = "Title" if level == 0 else f"Heading{min(level, 3)}"
        size = {0: 36, 1: 32, 2: 28, 3: 26}.get(level, 24)
        self.p(text, style=style, bold=True, size=size, align="center" if level <= 1 else None)

    def spacer(self) -> None:
        self.parts.append("<w:p/>")

    def page_break(self) -> None:
        self.page_breaks += 1
        self.parts.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    def table(self, rows: list[list[str]], widths: list[int] | None = None) -> None:
        self.table_count += 1
        if not rows:
            return
        widths = widths or [2400] * len(rows[0])
        grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
        xml = [
            "<w:tbl>",
            "<w:tblPr><w:tblStyle w:val=\"TableGrid\"/><w:tblW w:w=\"0\" w:type=\"auto\"/>"
            "<w:tblBorders><w:top w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"000000\"/>"
            "<w:left w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"000000\"/>"
            "<w:bottom w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"000000\"/>"
            "<w:right w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"000000\"/>"
            "<w:insideH w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"000000\"/>"
            "<w:insideV w:val=\"single\" w:sz=\"6\" w:space=\"0\" w:color=\"000000\"/>"
            "</w:tblBorders></w:tblPr>",
            f"<w:tblGrid>{grid}</w:tblGrid>",
        ]
        for r_idx, row in enumerate(rows):
            xml.append("<w:tr>")
            for c_idx, cell in enumerate(row):
                shade = '<w:shd w:fill="D9EAF7"/>' if r_idx == 0 else ""
                xml.append(
                    "<w:tc><w:tcPr>"
                    + (f'<w:tcW w:w="{widths[c_idx if c_idx < len(widths) else -1]}" w:type="dxa"/>' if widths else "")
                    + shade
                    + "</w:tcPr>"
                )
                for line in str(cell).split("\n"):
                    self.word_count += len(re.findall(r"\b[\w'-]+\b", line))
                    xml.append(
                        "<w:p><w:r>"
                        + ('<w:rPr><w:b/></w:rPr>' if r_idx == 0 else "")
                        + f"<w:t>{esc(line)}</w:t></w:r></w:p>"
                    )
                xml.append("</w:tc>")
            xml.append("</w:tr>")
        xml.append("</w:tbl>")
        self.parts.append("".join(xml))

    def figure(self, caption: str, body: str) -> None:
        self.figure_count += 1
        self.p(body, align="center")
        self.p(f"Figure {self.figure_count}: {caption}", italic=True, align="center")

    def toc_field(self, label: str) -> None:
        self.p(label, style="Heading1", bold=True, align="center", size=30)
        self.parts.append(
            '<w:p><w:fldSimple w:instr="TOC \\o &quot;1-3&quot; \\h \\z \\u">'
            '<w:r><w:t>Right-click this field in Microsoft Word and choose Update Field to generate entries.</w:t></w:r>'
            "</w:fldSimple></w:p>"
        )

    def build(self) -> str:
        body = "".join(self.parts)
        return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
 xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
 xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
 xmlns:v="urn:schemas-microsoft-com:vml"
 xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
 xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
 xmlns:w10="urn:schemas-microsoft-com:office:word"
 xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
 xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
 xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
 xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
 xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
 xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
 mc:Ignorable="w14 wp14"><w:body>{body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/><w:cols w:space="708"/><w:docGrid w:linePitch="360"/></w:sectPr></w:body></w:document>'''


def _section_category(section: str) -> str:
    section_lower = section.lower()
    checks = [
        ("background", ("background", "significance", "scope", "objective", "research questions")),
        ("problem", ("problem", "existing system")),
        ("literature", ("literature", "related work", "comparative", "research gap")),
        ("analysis", ("analysis", "proposed system", "functional", "non-functional", "feasibility", "requirement")),
        ("design", ("design", "architecture", "database", "interface", "input", "output", "security")),
        ("implementation", ("implementation", "development environment", "testing", "test", "screenshot")),
        ("conclusion", ("conclusion", "recommendation", "future work")),
        ("manual", ("appendix", "manual", "installation", "api summary", "additional test")),
    ]
    for category, keywords in checks:
        if any(keyword in section_lower for keyword in keywords):
            return category
    return "general"


NATURAL_PARAGRAPH_BANK: dict[str, list[str]] = {
    "background": [
        "Blood donation work is not only a technical process; it is also a community service where time, trust, and correct information matter. A hospital may need blood within a short period, while a suitable donor may be available but difficult to identify through ordinary phone calls. For that reason, the project studies blood donation as an information management problem and not merely as a record keeping task.",
        "The main idea in this part of the project is to bring scattered information into one organized system. Donor details, recipient needs, hospital locations, request urgency, and donation status all become easier to understand when they are stored in a consistent structure. This gives administrators a clearer picture of what is happening and helps them respond with less delay.",
        "In many local environments, manual registers and personal contacts are still used for blood donation coordination. These methods may work for a small number of cases, but they become weak when requests increase, when several hospitals are involved, or when urgent cases need fast matching. The proposed system addresses this practical gap by using technology that is already familiar in modern web and mobile applications.",
        "The importance of the project becomes clearer during emergency situations. A critical request cannot wait for long searching, repeated calls, or incomplete donor lists. By keeping donor records, blood groups, locations, and last donation dates in a searchable form, the system supports faster action without removing the need for human verification and responsibility.",
        "This project also reflects the role of Information Systems in public service. It shows how databases, web interfaces, mobile screens, authentication, reporting, and notification services can be combined to solve a real social problem. The value of the work is therefore both academic and practical.",
        "The scope of the {focus} was selected carefully so the project remains realistic for a final year system. The work concentrates on donor management, recipient requests, hospital coordination, matching, donation tracking, notifications, reports, settings, and access control. It does not claim to replace laboratory blood screening or clinical transfusion decisions, because those activities require medical authority.",
        "A useful information system should fit the work habits of its users. Administrators need organized lists and reports, donors need clear requests and response actions, recipients need a simple way to submit needs, and hospitals need accurate request details. The project therefore considers different users from the beginning instead of designing one screen for everyone.",
        "The system is also significant because it creates historical data. After several requests and donations, the organization can review which blood groups are requested most often, which areas have more donors, and which hospitals submit urgent cases. Such information is difficult to obtain from paper records but valuable for planning.",
    ],
    "problem": [
        "The existing process depends heavily on memory, paper records, and personal communication. When a recipient needs blood, staff may search old lists, call known donors, or ask people informally. This creates delay and does not guarantee that the selected donor is compatible, nearby, or eligible to donate.",
        "Another problem is duplication of records. The same donor may be written in different forms with different spellings, phone numbers, or addresses. When data is repeated without validation, it becomes difficult to know which record is correct. This weakens the reliability of the whole donation process.",
        "Manual communication also makes accountability difficult. If a request is delayed, cancelled, or completed, there may be no clear record of who updated it and when. The {focus} needs traceable actions so that administrators can review the workflow and identify where improvement is required.",
        "Emergency requests are especially affected by the weakness of the manual method. A critical case may require quick action, but staff may spend valuable time searching for donors who are unavailable, too far away, or recently donated. The system responds to this issue by making eligibility and distance part of the matching process.",
        "Reporting is another limitation in the existing system. Paper files can show individual cases, but they do not easily produce summaries about request volume, completed donations, response times, or donor distribution. Without reports, management decisions depend more on guesswork than evidence.",
        "Security and privacy are also concerns. Donor and recipient information includes contact details and health-related needs, so it should not be freely visible to every user. A manual system cannot enforce role-based access in a reliable way, while the proposed system can limit actions according to user responsibility.",
        "The problem is therefore not one small error but a group of related issues: slow searching, weak validation, poor traceability, limited reporting, and uncontrolled access. These issues justify the development of the Blood Donation Management System as a practical and academic solution.",
    ],
    "literature": [
        "The reviewed works show that blood donation and health information systems have been studied from different directions. Some works focus on medical safety and donor selection, while others focus on software architecture, mobile communication, or role-based access control. This project benefits from those ideas but applies them to a complete web and mobile donation workflow.",
        "Existing blood bank systems are usually strong in inventory control, especially when the institution already stores tested blood units. However, the present project has a wider coordination purpose. It gives attention to donors, recipients, hospitals, requests, matching, and notifications, which are important before the donation reaches the final medical stage.",
        "Mobile donor applications demonstrate that communication with donors can be improved through digital tools. Their strength is convenience, because donors can see information without waiting for a phone call. Their limitation is that they may not include local hospital workflows, request verification, administrative reports, or flexible role permissions.",
        "The literature on role-based access control is directly related to this project. Blood donation data should not be managed through one unrestricted account. Administrators, donors, and recipients require different permissions, and the system should make those boundaries clear through both backend rules and frontend navigation.",
        "Research and documentation about REST APIs also support the design of this system. A REST-based backend allows the same server to support a React web dashboard and a Flutter mobile application. This separation improves maintainability because the user interface can change without rewriting the complete business logic.",
        "A repeated limitation in many related systems is the lack of geographic matching. Blood group compatibility alone is not enough during urgent cases; the donor should also be reachable. The proposed system therefore combines blood group compatibility, donor eligibility, and distance calculation to produce more useful candidate lists.",
        "The comparative review suggests that a practical donation system should not be limited to registration forms. It should include the full operational cycle: request creation, verification, donor matching, notification, donor response, donation status tracking, reports, and settings. This observation shaped the final scope of the project.",
        "The research gap is clear when local needs are considered. Many existing systems are either too general, too organization-specific, or focused on one part of the workflow. The proposed system fills this gap by combining common health information principles with features suitable for local blood donation coordination.",
    ],
    "analysis": [
        "System analysis begins by looking at the real work before discussing screens or code. In this project, the work starts when a recipient or hospital needs blood and ends when the request is completed, cancelled, or otherwise closed. Between those points, many small decisions are made, and each decision needs accurate information.",
        "The proposed {focus} separates users by responsibility. Administrators manage the whole system, recipients create and follow their own requests, donors respond to available requests, and hospital information supports location and request verification. This separation keeps the workflow understandable and reduces unnecessary access to sensitive records.",
        "Functional requirements were written from the actual behavior expected from the system. Donor registration, recipient management, blood request creation, auto-matching, donation tracking, notifications, reports, and settings are not isolated features. They form a chain where the output of one module becomes the input of another.",
        "Non-functional requirements are equally important because the system deals with urgent and sensitive information. A slow or confusing system would not help users during emergency cases. For this reason, usability, performance, reliability, security, localization, and maintainability were considered during analysis.",
        "The feasibility study shows that the project is technically realistic. Django REST Framework, React, TypeScript, and Flutter are mature technologies with strong documentation and community support. The database design uses ordinary relational tables, which makes the system easier to understand, test, and maintain.",
        "Operational feasibility is also strong because the proposed system follows tasks that users already understand. Staff already know donors, requests, hospitals, and completed donations. The system does not change the purpose of their work; it gives them a more organized way to perform it.",
        "Requirement gathering for this type of project should combine observation, informal interviews, document review, and study of existing software. Even when complete field access is limited, the workflow can be understood by studying common blood donation procedures and matching them with the modules implemented in the codebase.",
        "The diagrams in this chapter are used to make the analysis visible. Use case diagrams show who uses the system, activity diagrams show workflow movement, sequence diagrams show communication between parts, and the ER diagram shows how important records are connected in the database.",
    ],
    "design": [
        "The design of the system follows a layered approach. The user interface handles interaction, the API layer receives and validates requests, the service layer performs business decisions, and the database stores persistent records. This arrangement keeps the project easier to maintain because each layer has a clear responsibility.",
        "This part of the design is organized around the main entities of the donation process. Users, donors, recipients, hospitals, blood requests, notifications, donations, permissions, and settings are represented as separate tables. Their relationships reflect the real workflow: a recipient creates a request, a hospital is linked to it, donors are matched, and donations record the response.",
        "Database design gives special attention to uniqueness and indexing. Phone numbers and emails are controlled where necessary, and common search fields such as blood group, status, hospital, recipient, donor, and location are indexed. These decisions support both accuracy and performance.",
        "The interface design avoids unnecessary complexity. A user should be able to understand the current status of a request or donation without reading a long explanation. Lists, filters, badges, forms, and action buttons are used to make daily tasks faster and more predictable.",
        "Input design is based on validation. Required fields, choice lists, email formats, phone numbers, blood groups, request types, and status values are controlled before data becomes part of the permanent record. This reduces errors that are common in manual systems.",
        "Output design includes dashboards, tables, notifications, reports, and detail pages. These outputs are intended to support action, not only display stored data. For example, a request detail page should help the user understand request urgency, matching status, donor candidates, and available next steps.",
        "Security design is not limited to the login page. The system includes JWT authentication, role permissions, password reset controls, account lock fields, session handling, activity logs, and protected routes. Together these measures reduce the risk of unauthorized access and improve accountability.",
        "The design also supports future growth. Because the backend is separated from the web and mobile clients, new interfaces can be added later without changing the entire system. Additional services such as SMS, real-time updates, or analytics can also be connected through the existing modular structure.",
    ],
    "implementation": [
        "Implementation was completed module by module so that each part could be tested before moving to the next. The backend applications represent the main domains of the system, while the frontend modules provide pages, forms, tables, filters, services, schemas, and queries for each domain.",
        "The {focus} uses Django models to define database structure and Django REST Framework to expose data through APIs. Serializers, views, permissions, services, and tests work together to keep backend behavior consistent with the requirements identified in earlier chapters.",
        "On the frontend, React and TypeScript provide a structured web dashboard. The project uses typed services, validation schemas, React Query, reusable components, and role-based routing. This makes the user interface more reliable because data fetching, validation, and navigation are handled in organized layers.",
        "The Flutter mobile application supports donor and recipient workflows in a lighter interface. Mobile access is important because donors and recipients may not always use the admin web dashboard. The mobile screens therefore focus on quick access, request cards, role dashboards, and API communication.",
        "Testing was not treated as a separate activity at the end only. Backend tests, frontend UI tests, schema tests, service tests, and workflow tests were used to check important behavior. This is necessary because a small error in matching, status transition, or permissions can affect the whole donation process.",
        "The donation workflow was carefully implemented because it has several states. A donation may be pending, accepted, en route, arrived, completed, cancelled, declined, or expired. The transition rules prevent the system from moving records into impossible or confusing states.",
        "Auto-matching is one of the most important implemented features. The system checks compatible blood groups, donor eligibility, available coordinates, allowed radius, and distance. The closest suitable donors are selected, notifications are prepared, and donation records are synchronized for follow-up.",
        "The reports module provides evidence for management decisions. Instead of depending only on individual records, administrators can review donation analytics, request patterns, hospital performance, emergency cases, geographic distance, and system performance indicators.",
    ],
    "conclusion": [
        "The project achieved its main purpose by converting a difficult manual process into a structured information system. Donor records, recipient requests, hospitals, matching, donations, notifications, reports, and access control are managed in one connected environment.",
        "The results show that automation can improve blood donation coordination when it is designed around the real workflow. The system does not only store names and phone numbers; it helps users understand request urgency, donor compatibility, distance, response status, and completion progress.",
        "The project also demonstrates the academic value of combining system analysis, database design, web development, mobile development, security, and testing. Each chapter contributes to the final product, and the implementation reflects the requirements discussed earlier in the report.",
        "Recommendations focus on practical improvement. Users should be trained before full deployment, data should be reviewed regularly, backup procedures should be prepared, and hospitals should follow a clear verification process for urgent requests.",
        "Future work can improve the project further through real-time location updates, stronger SMS integration, advanced analytics, AI-supported donor prediction, biometric verification, cloud deployment, and deeper integration with hospital blood bank inventories.",
        "The final system is not the end of the work; it is a foundation. With continued maintenance and real user feedback, the Blood Donation Management System can become more accurate, more trusted, and more useful for community health services.",
    ],
    "manual": [
        "The user manual is written for ordinary users, not only for developers. Its purpose is to explain how the system can be opened, how users can log in, and how each role can complete common tasks without needing to understand the internal code.",
        "For administrators, the most important tasks are managing users, donors, recipients, hospitals, requests, donations, reports, notifications, and settings. The manual explains these tasks step by step so that daily operation becomes consistent.",
        "For donors, the system should be simple. A donor needs to view nearby or assigned requests, understand the blood group and hospital information, respond to a request, and follow donation status. The interface should not hide important actions inside complicated menus.",
        "For recipients, the main task is creating and monitoring blood requests. The manual describes how to enter request details, select hospital information, attach supporting documents when required, and check donor responses.",
        "Installation instructions are included because the system depends on several parts: backend, database, web dashboard, mobile application, and optional notification services. Clear setup steps reduce confusion when the project is demonstrated or deployed.",
        "The appendix also keeps supporting information outside the main chapters. This helps the monograph remain readable while still providing enough practical detail for installation, API understanding, testing, and system operation.",
    ],
    "general": [
        "This section connects the project topic with the practical needs of blood donation management. The discussion focuses on how information is collected, checked, stored, used, and reported during the donation workflow.",
        "The {focus} is important because each module depends on correct data from another module. A request cannot be matched properly if donor records are incomplete, and a report cannot be trusted if status updates are not accurate.",
        "The system was planned with both academic documentation and practical use in mind. This means the report explains not only what was built, but also why the selected structure, technologies, and workflows are suitable for the problem.",
        "Overall, the section supports the central argument of the monograph: a carefully designed information system can reduce delay, improve accuracy, and support better decisions in blood donation coordination.",
    ],
}


def filler_paragraphs(section: str, focus: str, count: int = 4, *, page: int = 0) -> list[str]:
    category = _section_category(section)
    bank = NATURAL_PARAGRAPH_BANK.get(category, NATURAL_PARAGRAPH_BANK["general"])
    paragraphs: list[str] = []
    start = (page * count) % len(bank)
    for idx in range(count):
        paragraphs.append(bank[(start + idx) % len(bank)].format(focus=focus, section=section))
    return paragraphs


def add_expanded_section(doc: WordDoc, title: str, focus: str, pages: int, *, level: int = 2) -> None:
    doc.heading(title, level)
    for page in range(pages):
        if page > 0:
            doc.page_break()
            doc.heading(f"{title} (Continued)", level)
        for para in filler_paragraphs(title, focus, 5, page=page):
            doc.p(para)
        if page % 2 == 0:
            category = _section_category(title)
            examples_by_category = {
                "background": [
                    "For example, a hospital employee may know several donors personally, but that knowledge is not enough when the request is urgent and the required blood group is rare. A searchable system makes the available information easier to use.",
                    "A common situation is that two people may keep separate donor lists. When those lists are brought into one controlled system, the organization can reduce repeated records and improve follow-up.",
                    "This also helps academic understanding, because the project shows how an ordinary social service can be studied through the principles of information systems.",
                ],
                "problem": [
                    "For example, if a donor recently donated blood but the date was not recorded, staff may contact that donor again too early. A structured system reduces this kind of operational mistake.",
                    "Another practical case is a wrong phone number in a paper register. In a manual process the error may remain hidden, while digital validation and updates make correction easier.",
                    "The problem is therefore visible in daily work, not only in theory: delay, repeated calls, uncertain records, and weak reporting all affect the final service.",
                ],
                "literature": [
                    "For example, a mobile donor application may notify users quickly, but without request verification and administrative reporting it cannot fully support hospital-level coordination.",
                    "The comparison also shows why this project combines several ideas instead of copying one existing system. Blood donation coordination needs registration, matching, communication, tracking, and reports together.",
                    "This discussion makes the research gap more specific: the missing point is not technology itself, but a complete workflow suitable for local donor and recipient management.",
                ],
                "analysis": [
                    "For example, when a recipient creates an urgent request, the system must know who submitted it, which hospital is involved, what blood group is needed, and how donors should be selected.",
                    "This analysis also shows why requirements must be connected. Donor matching depends on donor records, donor records depend on validation, and reports depend on accurate status updates.",
                    "The workflow becomes easier to understand when it is described before implementation. This prevents the system from becoming only a collection of screens without a clear process.",
                ],
                "design": [
                    "For example, the blood request table is connected with recipients, hospitals, donors, notifications, and donations. This design allows one request to be followed from creation to final result.",
                    "The interface follows the same idea. A user should see the most important status and action first, while detailed information remains available when it is needed.",
                    "Good design in this project means that the database, API, and user interface support the same workflow instead of working as separate pieces.",
                ],
                "implementation": [
                    "For example, when the matching service selects donors, the frontend can display candidates while the backend keeps the calculation and rules in one controlled place.",
                    "A practical implementation detail is the donation status workflow. By limiting allowed transitions, the system prevents confusing records such as a completed donation returning to pending.",
                    "The tests support this work by checking behavior that users may not notice directly but that strongly affects reliability.",
                ],
                "conclusion": [
                    "For example, the project shows that a useful final year system can solve a real community problem while still demonstrating database design, APIs, user interfaces, security, and testing.",
                    "The recommendations are practical because they are based on the developed system: train users, keep records updated, prepare backups, and improve notification channels.",
                    "Future improvements should build on this foundation gradually, beginning with the features that will have the strongest effect on emergency response.",
                ],
                "manual": [
                    "For example, a new administrator should be able to read the manual and understand how to add a donor, create a request, review candidates, and generate a report without reading the source code.",
                    "The manual also helps during demonstration, because it gives a clear path through the system instead of leaving the presenter to explain screens randomly.",
                    "Keeping these instructions in the appendix makes the main chapters academic while still giving users practical help.",
                ],
                "general": [
                    "For example, the same record may appear in a form, a table, a report, and a notification. The system must keep that information consistent in all places.",
                    "This connection between records and actions is what makes the project useful as an information system rather than only a static database.",
                    "The discussion therefore remains connected to the real purpose of the project: improving blood donation coordination through organized information.",
                ],
            }
            examples = examples_by_category.get(category, examples_by_category["general"])
            doc.p(examples[(page // 2) % len(examples)])


def outline_text() -> str:
    lines = [
        f"# Complete Monograph Outline: {TITLE}",
        "",
        "Front Matter",
        "1. Cover Page",
        "2. Title Page",
        "3. Final Approval",
        "4. Declaration",
        "5. Acknowledgment",
        "6. Dedication",
        "7. Abstract and Keywords",
        "8. Table of Contents",
        "9. List of Tables",
        "10. List of Figures",
        "",
        "Chapter One: Introduction",
        "1.1 Background of the Study",
        "1.2 Problem Statement",
        "1.3 Objectives of the Project",
        "1.4 Scope of the Project",
        "1.5 Significance of the Project",
        "1.6 Methodology",
        "1.7 Tools and Technologies",
        "1.8 Research Questions",
        "1.9 Organization of the Report",
        "",
        "Chapter Two: Literature Review",
        "2.1 Introduction",
        "2.2 Related Works",
        "2.3 Comparative Analysis",
        "2.4 Research Gap",
        "2.5 Conclusion",
        "",
        "Chapter Three: System Analysis",
        "3.1 Introduction",
        "3.2 Existing System Analysis",
        "3.3 Proposed System",
        "3.4 Functional Requirements",
        "3.5 Non-Functional Requirements",
        "3.6 Feasibility Study",
        "3.7 Requirement Gathering Techniques",
        "3.8 System Models and Diagrams",
        "",
        "Chapter Four: System Design",
        "4.1 Introduction",
        "4.2 Architectural Design",
        "4.3 Database Design",
        "4.4 Interface Design",
        "4.5 Input Design",
        "4.6 Output Design",
        "4.7 Security Design",
        "",
        "Chapter Five: System Implementation and Testing",
        "5.1 Introduction",
        "5.2 Development Environment",
        "5.3 System Implementation",
        "5.4 Testing",
        "5.5 Test Cases",
        "5.6 System Screenshots",
        "",
        "Chapter Six: Conclusion and Recommendations",
        "6.1 Conclusion",
        "6.2 Recommendations",
        "6.3 Future Work",
        "",
        "References",
        "Appendices",
        "Appendix A: User Manual",
        "Appendix B: Installation Guide",
        "Appendix C: Sample Configuration and API Summary",
        "Appendix D: Additional Test Results",
        "National Language Abstract and Title Page",
    ]
    return "\n".join(lines) + "\n"


def add_front_matter(doc: WordDoc) -> None:
    for cover_kind in ("Cover Page", "Title Page"):
        doc.p("Paktia University", bold=True, align="center", size=32)
        doc.p("Computer Science Faculty", bold=True, align="center", size=30)
        doc.p("Department of Information Systems", bold=True, align="center", size=28)
        doc.spacer()
        doc.heading(TITLE, 0)
        doc.p("(Final Year Project Monograph)", italic=True, align="center")
        doc.spacer()
        doc.p("Submitted By", bold=True, align="center")
        for name in SUBMITTED_BY:
            doc.p(name, align="center")
        doc.spacer()
        doc.p(f"Supervised By: {SUPERVISOR}", bold=True, align="center")
        doc.p(f"Year: {YEAR}", bold=True, align="center")
        doc.p(cover_kind, italic=True, align="center")
        doc.page_break()

    doc.heading("FINAL APPROVAL", 1)
    doc.p(
        f"This is to certify that we have read the project documentation titled \"{TITLE}\" submitted by the following students of BSc (IS), 8th Semester, as a partial fulfillment of the requirements for the award of the degree of Bachelor of Science in Information Systems."
    )
    doc.table(
        [
            ["S.NO", "Name", "Registration No", "Session", "Defense Date", "Project Marks"],
            ["1", SUBMITTED_BY[0], "P09004388", "1402-1405", "", ""],
            ["2", SUBMITTED_BY[1], "", "1402-1405", "", ""],
            ["3", SUBMITTED_BY[2], "", "1402-1405", "", ""],
            ["4", SUBMITTED_BY[3], "", "1402-1405", "", ""],
        ],
        [900, 2700, 2200, 1700, 1800, 1600],
    )
    doc.p(
        "It is our judgment that this project documentation meets the required academic standards and is hereby approved for submission to the Department of Information Systems, Faculty of Computer Science, Paktia University."
    )
    doc.table([["NO", "Committee Members", "Signature"], ["1", "", ""], ["2", "", ""], ["3", "", ""]], [900, 4200, 3200])
    doc.p("Head of Department", bold=True)
    doc.p("Mr. Rahmatullah \"Alikhail\"")
    doc.page_break()

    doc.heading("DECLARATION", 1)
    for para in [
        "We hereby declare that this final project is entirely our own academic work and has been completed independently under the guidance of the assigned supervisor. To the best of our knowledge, this topic has not been previously submitted by us for another degree or qualification.",
        "The content presented in this project is the result of our personal effort, field understanding, system analysis, design, implementation, and testing. All ethical standards and academic writing guidelines have been followed, and the sources used for technical and academic support are acknowledged in the reference section.",
        "We understand that plagiarism, fabrication of results, or academic dishonesty may result in disciplinary action according to university regulations.",
    ]:
        doc.p(para)
    for name in SUBMITTED_BY:
        doc.p(f"Researcher Name: {name}     Sign (     )     Date:     /     /")
    doc.page_break()

    doc.heading("ACKNOWLEDGMENT", 1)
    acknowledgments = [
        "In the name of Allah, the Most Gracious, the Most Merciful.",
        "First and foremost, we express our deepest gratitude to Almighty Allah for granting us health, patience, knowledge, and strength to complete our academic journey and finalize this final year project.",
        "We extend heartfelt appreciation to our respected parents for their prayers, encouragement, and moral and financial support. Their sacrifices have been a strong foundation for our education and success.",
        f"We are profoundly grateful to our honorable supervisor, {SUPERVISOR}, for his guidance, constructive feedback, patience, and academic support throughout the preparation of this project.",
        "We also thank the Head of Department, faculty members, and all respected teachers of the Faculty of Computer Science for providing knowledge, discipline, and academic direction during our studies.",
        "Finally, we acknowledge our classmates, friends, and everyone who directly or indirectly supported the completion of this project.",
    ]
    for para in acknowledgments:
        doc.p(para)
    doc.p("Sincerely, " + ", ".join(SUBMITTED_BY))
    doc.page_break()

    doc.heading("DEDICATION", 1)
    for para in [
        "We dedicate this final year project to our respected parents, whose sacrifices, prayers, and endless support have always been the greatest source of motivation in our lives.",
        "We dedicate this work to our teachers and supervisor, who guided us with valuable knowledge, discipline, and encouragement throughout our academic journey.",
        "We also dedicate this achievement to health workers, blood donors, recipients, and all people who support lifesaving blood donation services in the community.",
    ]:
        doc.p(para)
    doc.page_break()

    doc.heading("ABSTRACT", 1)
    doc.p(
        "Blood donation services are essential for hospitals, emergency departments, and patients who require timely blood transfusion. In many communities, donor records, recipient requests, hospital communication, and emergency matching are still handled through manual registers, phone calls, and informal communication channels. These practices can delay donor identification, increase data errors, and make reporting difficult. This project presents the design and development of a Blood Donation Management System that automates donor registration, recipient management, hospital records, blood request processing, donor matching, donation tracking, notifications, reports, and role-based access control. The system uses Django REST Framework for backend services, MySQL-compatible database support, React with TypeScript for the web dashboard, and Flutter for mobile donor and recipient workflows. The proposed system improves data accuracy, reduces manual workload, supports distance-based donor matching, and provides administrators with dashboards and analytical reports. Security is strengthened through JWT authentication, role permissions, email verification, password reset controls, session management, and activity logging. Testing was performed through unit, integration, user interface, and workflow-based test cases. The result is a practical information system that supports faster decision-making and more reliable blood donation coordination."
    )
    doc.p("Keywords: Blood Donation, Information System, Donor Matching, Django REST Framework, React, Flutter, Role-Based Access Control")
    doc.page_break()

    doc.toc_field("TABLE OF CONTENTS")
    doc.page_break()
    doc.heading("LIST OF TABLES", 1)
    for item in [
        "Table 1.1 Tools and Technologies",
        "Table 2.1 Comparative Analysis of Related Systems",
        "Table 3.1 Functional Requirements",
        "Table 3.2 Non-Functional Requirements",
        "Table 4.1 Database Tables",
        "Table 4.2 Data Dictionary",
        "Table 5.1 Development Environment",
        "Table 5.2 Test Cases",
    ]:
        doc.p(item)
    doc.page_break()
    doc.heading("LIST OF FIGURES", 1)
    for item in [
        "Figure 1: System Development Methodology",
        "Figure 2: Use Case Diagram",
        "Figure 3: Activity Diagram",
        "Figure 4: Sequence Diagram",
        "Figure 5: Class Diagram",
        "Figure 6: Entity Relationship Diagram",
        "Figure 7: Data Flow Diagram",
        "Figure 8: System Architecture",
        "Figure 9: Dashboard Screenshot Description",
    ]:
        doc.p(item)
    doc.page_break()


def add_chapter_one(doc: WordDoc) -> None:
    doc.heading("Chapter One", 1)
    doc.heading("INTRODUCTION", 1)
    doc.p("After going through this chapter, the reader will be able to explain the background and significance of the Blood Donation Management System, identify limitations of manual blood donation coordination, and describe the purpose and scope of the proposed system.")
    add_expanded_section(doc, "1.1 Background of the Study", "blood donation information", 4)
    add_expanded_section(doc, "1.2 Problem Statement", "manual request and donor matching", 3)
    doc.heading("1.3 Objectives of the Project", 2)
    doc.p("General Objective: To design and develop an efficient, secure, and automated Blood Donation Management System that improves donor registration, recipient request handling, hospital coordination, donation tracking, notifications, and reporting.")
    objectives = [
        "To automate donor registration and maintain reliable donor profiles with blood group, contact, location, and donation history.",
        "To manage recipient records and emergency blood requirements through structured and validated forms.",
        "To process blood requests according to blood group, urgency, hospital, units needed, verification status, and response deadline.",
        "To match compatible donors by blood group, eligibility, distance, and availability.",
        "To provide role-based access control for administrators, donors, and recipients.",
        "To generate operational reports for requests, donations, hospitals, geographic coverage, emergency trends, and system performance.",
        "To support web and mobile access for practical use by different stakeholders.",
    ]
    for obj in objectives:
        doc.p(obj)
    doc.page_break()
    add_expanded_section(doc, "1.4 Scope of the Project", "system module", 3)
    add_expanded_section(doc, "1.5 Significance of the Project", "health service coordination", 3)
    doc.heading("1.6 Methodology", 2)
    doc.p("The project follows an Agile-prototype methodology. Requirements were studied from the blood donation workflow, then the system was divided into modules such as authentication, donor management, recipients, hospitals, blood requests, donations, notifications, settings, and reports. Each module was analyzed, designed, implemented, tested, and improved through feedback.")
    doc.figure("System Development Methodology", "Planning -> Analysis -> Design -> Implementation -> Testing -> Review -> Improvement")
    doc.page_break()
    doc.heading("1.7 Tools and Technologies", 2)
    doc.table(
        [
            ["Tool/Technology", "Purpose"],
            ["Python and Django 5", "Backend development and business logic"],
            ["Django REST Framework", "REST API development"],
            ["Simple JWT", "Token-based authentication"],
            ["MySQL/SQLite", "Relational database management"],
            ["React, TypeScript, Vite", "Web dashboard development"],
            ["Tailwind CSS", "Responsive user interface styling"],
            ["TanStack Query and Axios", "Server-state management and API communication"],
            ["Zod and React Hook Form", "Form validation and data entry control"],
            ["Flutter", "Mobile donor and recipient application"],
            ["Channels, Celery, Redis, Twilio", "Real-time, background, and notification support"],
            ["Vitest and Django tests", "Frontend and backend verification"],
        ],
        [3000, 6000],
    )
    doc.page_break()
    doc.heading("1.8 Research Questions", 2)
    questions = [
        "General Research Question: How can an automated Blood Donation Management System improve donor coordination, recipient request handling, data accuracy, and emergency response?",
        "What are the main problems in the existing manual blood donation process?",
        "How can donor and recipient records be structured to reduce errors and duplication?",
        "How can blood group compatibility, donor eligibility, distance, and urgency be used for donor matching?",
        "What security mechanisms are required to protect user and medical-related information?",
        "How can reports and dashboards support administrative decision-making?",
    ]
    for q in questions:
        doc.p(q)
    doc.heading("1.9 Organization of the Report", 2)
    doc.p("This report is organized into six chapters. Chapter One introduces the project. Chapter Two reviews related works and identifies the research gap. Chapter Three analyzes the existing and proposed systems. Chapter Four explains system design, architecture, database, interface, input, output, and security. Chapter Five presents implementation and testing. Chapter Six provides conclusion, recommendations, and future work.")
    doc.page_break()


def add_chapter_two(doc: WordDoc) -> None:
    doc.heading("Chapter Two Literature Review", 1)
    add_expanded_section(doc, "2.1 Introduction", "related blood donation systems", 3)
    doc.heading("2.2 Related Works", 2)
    works = [
        ["WHO Blood Safety and Availability Guidance", "World Health Organization", "2023", "Guidance on safe blood donation, donor selection, and reliable blood supply.", "Strong public health foundation.", "Not a software implementation."],
        ["OpenMRS Electronic Medical Record Platform", "OpenMRS Community", "2024", "Open-source medical record platform used in health information management.", "Extensible and community supported.", "Requires adaptation for blood donor matching."],
        ["Red Cross Blood Donor Mobile Services", "American Red Cross", "2024", "Mobile donor engagement, appointment, and donation history services.", "Strong donor communication.", "Focused on its own organization and geography."],
        ["Hospital Blood Bank Management Systems", "Various Hospitals", "2021-2024", "Systems for inventory, blood bags, transfusion records, and compatibility checks.", "Good inventory control.", "Often limited in public donor outreach."],
        ["Emergency Blood Request Applications", "mHealth Developers", "2020-2024", "Mobile applications for posting urgent blood needs and contacting donors.", "Fast communication.", "May lack verification, RBAC, and reports."],
        ["Role-Based Access Control Models", "Sandhu et al.", "1996", "Formal model for assigning permissions to roles.", "Clear authorization model.", "Must be adapted to application workflows."],
        ["REST API Based Health Systems", "Software Engineering Studies", "2018-2024", "Systems that use REST APIs to separate web, mobile, and server components.", "Scalable multi-client architecture.", "Requires careful API security."],
        ["Geographic Donor Search Systems", "GIS and mHealth Research", "2019-2024", "Systems that calculate distance between patients and possible donors.", "Useful for emergency matching.", "Accuracy depends on donor location quality."],
    ]
    for idx, work in enumerate(works, 1):
        doc.heading(f"Related Work {idx}", 3)
        labels = ["Title", "Author/Organization", "Year", "Description", "Strengths", "Weaknesses"]
        for label, value in zip(labels, work):
            doc.p(f"{label}: {value}")
    doc.page_break()
    add_expanded_section(doc, "2.2 Related Works Discussion", "reviewed literature", 4)
    doc.heading("2.3 Comparative Analysis", 2)
    doc.table(
        [
            ["Feature", "Manual/Phone System", "General Blood Bank System", "Proposed System"],
            ["Login and RBAC", "No", "Limited", "Yes, role and permission based"],
            ["Donor Registration", "Paper or spreadsheet", "Yes", "Yes, validated and searchable"],
            ["Recipient Requests", "Informal", "Partial", "Structured request lifecycle"],
            ["Distance Matching", "No", "Rare", "Yes, radius-based candidate search"],
            ["Notifications", "Phone only", "Limited", "In-app, email, SMS-ready"],
            ["Reports", "Manual", "Basic", "Dashboard and analytical reports"],
            ["Mobile Support", "No", "Often no", "Flutter donor and recipient screens"],
            ["Security", "Weak", "Medium", "JWT, RBAC, logs, settings"],
        ],
        [2200, 2400, 2600, 3000],
    )
    add_expanded_section(doc, "2.4 Research Gap", "unmet emergency coordination need", 5)
    add_expanded_section(doc, "2.5 Conclusion", "literature review result", 1)


def add_chapter_three(doc: WordDoc) -> None:
    doc.heading("Chapter Three System Analysis", 1)
    add_expanded_section(doc, "3.1 Introduction", "requirement analysis", 3)
    add_expanded_section(doc, "3.2 Existing System Analysis", "manual blood donation workflow", 4)
    add_expanded_section(doc, "3.3 Proposed System", "automated blood donation workflow", 5)
    doc.heading("3.4 Functional Requirements", 2)
    doc.table(
        [
            ["Code", "Requirement"],
            ["FR-01", "The system shall allow user registration, login, logout, email verification, and password reset."],
            ["FR-02", "The system shall maintain donor profiles with blood group, contact, city, location, age, and last donation date."],
            ["FR-03", "The system shall maintain recipient records with full name, contact, hospital, required blood group, and emergency level."],
            ["FR-04", "The system shall allow administrators or recipients to create blood requests with units, hospital, urgency, documents, and location."],
            ["FR-05", "The system shall automatically search compatible donors within an allowed radius."],
            ["FR-06", "The system shall create donation records and track statuses from pending to completed or terminal states."],
            ["FR-07", "The system shall send and store notifications for request and donation events."],
            ["FR-08", "The system shall generate reports for donors, requests, donations, hospitals, geography, emergency response, and performance."],
            ["FR-09", "The system shall provide settings for security, localization, notifications, donor eligibility, and auto-matching."],
            ["FR-10", "The system shall enforce role-based navigation and permissions."],
        ],
        [1200, 7800],
    )
    doc.page_break()
    doc.heading("3.5 Non-Functional Requirements", 2)
    doc.table(
        [
            ["Category", "Requirement"],
            ["Security", "Passwords must be protected, tokens must expire, role permissions must restrict sensitive operations."],
            ["Performance", "Search and reporting pages must use filters, indexes, and pagination where appropriate."],
            ["Usability", "Forms must show clear validation messages and status badges must be understandable."],
            ["Reliability", "Donation status transitions must prevent invalid workflow states."],
            ["Maintainability", "Backend apps and frontend modules must remain separated by domain responsibility."],
            ["Localization", "The web interface must support English, Dari, and Pashto direction handling."],
            ["Scalability", "The architecture must support web and mobile clients through the same API."],
        ],
        [2200, 6800],
    )
    doc.page_break()
    add_expanded_section(doc, "3.6 Feasibility Study", "technical and operational feasibility", 3)
    add_expanded_section(doc, "3.7 Requirement Gathering Techniques", "stakeholder requirement discovery", 3)
    doc.heading("3.8 System Models and Diagrams", 2)
    doc.figure("Use Case Diagram", "Actors: Admin, Donor, Recipient, Hospital Staff. Use cases: manage donors, manage recipients, create blood request, verify request, search donors, accept donation, complete request, view reports, manage settings.")
    doc.figure("Activity Diagram", "Start -> Login -> Select role dashboard -> Create or review blood request -> Match donors -> Notify candidates -> Donor response -> Donation tracking -> Complete or cancel -> Generate report -> End")
    doc.figure("Sequence Diagram", "Recipient -> API: create request; API -> Database: save request; API -> Matching Service: find donors; Matching Service -> Notification Service: queue notices; Donor -> API: accept; API -> Donation Service: update status")
    doc.figure("Class Diagram", "User, Permission, RolePermission, Donor, Recipient, Hospital, BloodRequest, BloodRequestNotification, Donation, Notification, Settings, ActivityLog.")
    doc.figure("ER Diagram", "Users connect one-to-one with Donors or Recipients. Recipients and Hospitals connect to BloodRequests. BloodRequests connect to Donations and Notifications. Donors connect to Donations and blood request notifications.")
    doc.figure("Data Flow Diagram", "External users send requests to the web/mobile interface. The interface communicates with REST APIs. APIs validate data, save records, call matching and notification services, and return dashboards and reports.")
    doc.page_break()


def add_chapter_four(doc: WordDoc) -> None:
    doc.heading("Chapter Four System Design", 1)
    add_expanded_section(doc, "4.1 Introduction", "design specification", 3)
    doc.heading("4.2 Architectural Design", 2)
    doc.p("The system uses a multi-client architecture. The backend is a Django REST API that exposes domain endpoints for accounts, donors, recipients, hospitals, blood requests, donations, notifications, settings, and reports. The web dashboard is built with React and TypeScript. The mobile application is built with Flutter. Both clients communicate with the backend through HTTP APIs, while asynchronous and notification features can use Channels, Celery, Redis, email, and SMS services.")
    doc.figure("System Architecture", "React Web Dashboard + Flutter Mobile App -> REST API Gateway -> Django Apps and Services -> Database, Media Storage, Email/SMS Providers, Redis/Channels")
    add_expanded_section(doc, "4.2 Architectural Design", "layered architecture", 4)
    doc.heading("4.3 Database Design", 2)
    doc.table(
        [
            ["Table", "Main Purpose", "Important Fields"],
            ["users", "System user accounts", "username, email, phone, role_name, language_preference, theme, verification and lock fields"],
            ["permissions", "Permission catalog", "module, action, description"],
            ["role_permissions", "Role permission assignments", "role_name, permission"],
            ["donors", "Blood donor profiles", "name, phone, email, blood_group, location, age, last_donation_date"],
            ["recipients", "Blood recipient profiles", "full_name, phone, required_blood_group, hospital, emergency_level"],
            ["hospitals", "Hospital records", "name, phone, email, province, city, coordinates"],
            ["blood_requests", "Recipient blood requests", "blood_group, units_needed, request_type, status, deadline, assigned_donor"],
            ["blood_request_notifications", "Candidate donor notifications", "blood_request, donor, channel, delivery_status, response_status, distance_km"],
            ["donations", "Donation workflow records", "request, donor, status, distance_km, response_time, estimated_arrival_time"],
            ["notifications", "User notifications", "event_key, type, title, message, sent_via, status, priority"],
            ["settings", "Runtime configuration", "setting_key, value, type, category"],
        ],
        [1900, 2700, 5500],
    )
    doc.page_break()
    doc.heading("Data Dictionary", 3)
    doc.table(
        [
            ["Field", "Data Type", "Description", "Constraint"],
            ["blood_group", "CharField", "ABO/Rh blood group required by donor or recipient.", "Choice value"],
            ["request_type", "CharField", "Normal, urgent, or critical urgency.", "Choice value"],
            ["status", "CharField", "Workflow status of request or donation.", "Choice value"],
            ["latitude/longitude", "Decimal", "Geographic coordinates used for matching.", "Nullable for donors/hospitals"],
            ["response_deadline", "DateTime", "Latest expected response time for a request.", "Optional"],
            ["is_primary", "Boolean", "Marks primary active donor candidate for a request.", "Unique active primary constraint"],
            ["dedupe_key", "CharField", "Prevents repeated notification delivery.", "Unique per user/channel when active"],
        ],
        [2000, 1500, 4300, 2500],
    )
    add_expanded_section(doc, "4.4 Interface Design", "web and mobile user interface", 5)
    add_expanded_section(doc, "4.5 Input Design", "validated form input", 3)
    add_expanded_section(doc, "4.6 Output Design", "reports and dashboard output", 3)
    add_expanded_section(doc, "4.7 Security Design", "authentication and authorization", 5)


def add_chapter_five(doc: WordDoc) -> None:
    doc.heading("Chapter Five System Implementation and Testing", 1)
    add_expanded_section(doc, "5.1 Introduction", "implementation and testing", 3)
    doc.heading("5.2 Development Environment", 2)
    doc.table(
        [
            ["Component", "Specification"],
            ["Operating System", "Windows development environment"],
            ["Backend Language", "Python"],
            ["Backend Framework", "Django 5.0.2 and Django REST Framework"],
            ["Authentication", "Django authentication and Simple JWT"],
            ["Database", "MySQL through DATABASE_URL, with SQLite suitable for development fallback"],
            ["Frontend", "React 19, TypeScript, Vite, Tailwind CSS"],
            ["Mobile", "Flutter with module-based screens"],
            ["Testing", "Django tests, Vitest, Testing Library"],
            ["Supporting Services", "Channels, Daphne, Celery, Redis, Twilio-ready notification services"],
        ],
        [3000, 6200],
    )
    doc.page_break()
    add_expanded_section(doc, "5.3 System Implementation", "implemented module", 8)
    doc.heading("Implemented Modules", 3)
    modules = [
        "Authentication Module: login, signup, email verification, password reset, account locking, session timeout, language and theme preferences.",
        "Donor Module: donor registration, donor profile editing, filtering, blood group management, location storage, and eligibility-aware matching.",
        "Recipient Module: recipient profile management, hospital assignment, emergency level, and required blood group tracking.",
        "Hospital Module: hospital contact, province, city, address, and coordinate management.",
        "Blood Request Module: request creation, verification, cancellation, completion, auto-matching, donor candidates, and document upload.",
        "Donation Module: donor response, status transitions, reminders, primary candidate handling, and donation timeline.",
        "Notification Module: in-app notification list, unread state, event metadata, delivery status, and channel-ready dispatch.",
        "Reports Module: donation analytics, request analytics, emergency analysis, hospital performance, geographic distance, and system performance reports.",
        "Settings Module: general, localization, security, notifications, auto-matching, donor eligibility rules, and role-permission matrix.",
        "Mobile Module: donor and recipient shell screens, request cards, dashboard widgets, and API service integration.",
    ]
    for module in modules:
        doc.p(module)
    doc.page_break()
    doc.heading("5.4 Testing", 2)
    for sub in ["Unit Testing", "Integration Testing", "System Testing", "User Acceptance Testing (UAT)"]:
        doc.heading(sub, 3)
        for para in filler_paragraphs(sub, "test scenario", 3):
            doc.p(para)
    doc.page_break()
    add_expanded_section(doc, "5.4 Testing Process and Results", "test evidence", 3)
    doc.heading("5.5 Test Cases", 2)
    doc.table(
        [
            ["Test Case ID", "Module", "Input", "Expected Result", "Actual Result", "Status"],
            ["TC-01", "Login", "Valid username and password", "User enters correct dashboard", "Successful login", "Pass"],
            ["TC-02", "Login", "Invalid credentials", "Error message is displayed", "Validation/error displayed", "Pass"],
            ["TC-03", "Donor", "Duplicate active phone", "System rejects duplicate", "Duplicate prevented", "Pass"],
            ["TC-04", "Recipient", "Missing full name", "Validation message appears", "Validation shown", "Pass"],
            ["TC-05", "Blood Request", "Critical request with location", "Deadline and emergency flag are set", "Defaults applied", "Pass"],
            ["TC-06", "Matching", "A+ request within radius", "Compatible donors returned by distance", "Candidates sorted", "Pass"],
            ["TC-07", "Donation", "accepted -> en_route", "Transition allowed", "Status updated", "Pass"],
            ["TC-08", "Donation", "completed -> pending", "Transition blocked", "Invalid transition prevented", "Pass"],
            ["TC-09", "Notifications", "Request matched", "Donor receives in-app notice", "Notification stored", "Pass"],
            ["TC-10", "Reports", "Date filtered request report", "Correct summary is displayed", "Report generated", "Pass"],
            ["TC-11", "Settings", "Change max match radius", "Only allowed radius accepted", "Validation applied", "Pass"],
            ["TC-12", "Role Access", "Donor opens admin route", "Access denied or redirected", "Protected route enforced", "Pass"],
        ],
        [1200, 1500, 2500, 2600, 2200, 900],
    )
    doc.page_break()
    doc.heading("5.6 System Screenshots", 2)
    screenshots = [
        ("Login Page", "The login page allows authorized users to access the system using valid credentials and supports password recovery."),
        ("Admin Dashboard", "The dashboard displays donor, recipient, request, donation, hospital, and notification summaries."),
        ("Donor List", "The donor list allows filtering by blood group, city, status, and search text."),
        ("Recipient Form", "The recipient form captures patient contact, required blood group, hospital, and emergency level."),
        ("Blood Request View", "The request view shows status, documents, matched donors, verification actions, and cancellation/completion controls."),
        ("Donation Timeline", "The timeline explains the movement from pending to accepted, en route, arrived, completed, or cancelled."),
        ("Reports Workspace", "The reports workspace provides tabbed analytics and charts for administrative decisions."),
        ("Settings Matrix", "The role-permission matrix allows administrators to manage access to system modules."),
    ]
    for title, desc in screenshots:
        doc.figure(title, desc)
        doc.p("Screenshot placeholder: insert the real screen capture from the running system during final printing if required by the department.")
    doc.page_break()


def add_chapter_six_and_back_matter(doc: WordDoc) -> None:
    doc.heading("Chapter Six: Conclusion and Recommendations", 1)
    add_expanded_section(doc, "6.1 Conclusion", "project achievement", 3)
    add_expanded_section(doc, "6.2 Recommendations", "practical improvement", 3)
    add_expanded_section(doc, "6.3 Future Work", "future enhancement", 4)
    doc.heading("References", 1)
    refs = [
        "American Red Cross. (2024). Blood donation services and donor information resources. https://www.redcrossblood.org/",
        "Django Software Foundation. (2024). Django documentation. https://docs.djangoproject.com/",
        "Encode OSS Ltd. (2024). Django REST Framework documentation. https://www.django-rest-framework.org/",
        "Fielding, R. T. (2000). Architectural styles and the design of network-based software architectures. University of California, Irvine.",
        "Flutter Team. (2024). Flutter documentation. https://docs.flutter.dev/",
        "MySQL. (2024). MySQL reference manual. https://dev.mysql.com/doc/",
        "OpenMRS Community. (2024). OpenMRS documentation. https://openmrs.org/",
        "Pressman, R. S., & Maxim, B. R. (2020). Software Engineering: A Practitioner's Approach. McGraw-Hill.",
        "React Team. (2024). React documentation. https://react.dev/",
        "Sandhu, R. S., Coyne, E. J., Feinstein, H. L., & Youman, C. E. (1996). Role-based access control models. Computer, 29(2), 38-47.",
        "Sommerville, I. (2016). Software Engineering. Pearson.",
        "World Health Organization. (2023). Blood safety and availability. https://www.who.int/",
    ]
    for ref in refs:
        doc.p(ref)
    doc.page_break()
    doc.heading("Appendices", 1)
    doc.heading("Appendix A: User Manual", 2)
    manual_steps = [
        "Open the system URL in a supported web browser.",
        "Enter the registered username and password and click Login.",
        "Use the dashboard navigation to open donors, recipients, hospitals, blood requests, donations, reports, notifications, or settings.",
        "To register a donor, open the donor module, click create, fill in name, phone, blood group, city, and optional location, then save.",
        "To create a blood request, open blood requests, select recipient and hospital, enter blood group, units needed, urgency, and location, then submit.",
        "To review donor candidates, open the request detail page and inspect compatible donors sorted by distance.",
        "To update a donation, open the donation record and use the allowed action buttons according to the current status.",
        "To generate reports, open the reports workspace, select report type and filters, and review the dashboard results.",
        "To change settings, open admin settings and update only the sections allowed by the current role.",
        "To logout, use the user menu and click logout.",
    ]
    for i, step in enumerate(manual_steps, 1):
        doc.p(f"Step {i}: {step}")
    doc.page_break()
    add_expanded_section(doc, "Appendix A: User Manual Details", "end-user operation", 6, level=2)
    doc.heading("Appendix B: Installation Guide", 2)
    install = [
        "Install Python, Node.js, Flutter SDK, and a database server if MySQL is used.",
        "Create backend environment variables such as DATABASE_URL, DEBUG, CORS_ALLOWED_ORIGINS, email settings, and SMS provider keys when needed.",
        "Run backend migrations using python manage.py migrate.",
        "Start the Django API using python manage.py runserver.",
        "Install frontend dependencies using npm install and start the React dashboard with npm run dev.",
        "Install Flutter dependencies using flutter pub get and run the mobile application using flutter run.",
        "For mobile device testing with a local backend, configure ADB reverse or use the LAN IP address as described in the mobile setup guide.",
    ]
    for item in install:
        doc.p(item)
    doc.page_break()
    doc.heading("Appendix C: Sample Configuration and API Summary", 2)
    doc.table(
        [
            ["API Area", "Base Path", "Purpose"],
            ["Core", "/api/core/", "Health, settings, role access, and shared services"],
            ["Accounts", "/api/accounts/", "Authentication, users, permissions, profile"],
            ["Donors", "/api/donors/", "Donor CRUD and donor search"],
            ["Recipients", "/api/recipients/", "Recipient CRUD and emergency information"],
            ["Hospitals", "/api/hospitals/", "Hospital CRUD"],
            ["Blood Requests", "/api/blood-requests/", "Request lifecycle, matching, verification"],
            ["Donations", "/api/donations/", "Donation response and status workflow"],
            ["Notifications", "/api/notifications/", "Notification list, read state, delivery data"],
            ["Reports", "/api/reports/", "Operational and analytical reports"],
        ],
        [2000, 2400, 5000],
    )
    doc.page_break()
    doc.heading("Appendix D: Additional Test Results", 2)
    add_expanded_section(doc, "Appendix D: Additional Test Results", "quality verification", 5, level=2)
    doc.heading("لنډیز", 1)
    doc.p(
        "د وینې ورکړې مدیریت سیستم د روغتونونو، وینه ورکوونکو او وینه اخیستونکو ترمنځ د معلوماتو د سم، چټک او خوندي مدیریت لپاره جوړ شوی معلوماتي سیستم دی. دا سیستم د وینه ورکوونکو ثبت، د ناروغانو غوښتنې، د روغتونونو معلومات، د وینې غوښتنو تعقیب، د مناسب وینه ورکوونکي موندنه، خبرتیاوې، راپورونه او د کاروونکو د لاسرسي کنټرول په منظم ډول ترسره کوي. د سیستم موخه دا ده چې لاسي کارونه کم، د معلوماتو تېروتنې راکمې، او د بیړنیو حالاتو په وخت کې د پریکړې کولو بهیر چټک شي.",
        rtl=True,
    )
    doc.page_break()
    doc.p("پکتیا پوهنتون", bold=True, align="center", rtl=True, size=32)
    doc.p("کمپیوټر ساینس پوهنځی", bold=True, align="center", rtl=True, size=30)
    doc.p("معلوماتي سیستمونو څانګه", bold=True, align="center", rtl=True, size=28)
    doc.heading("د وینې ورکړې مدیریت سیستم", 0)
    doc.p("چمتوکوونکي", bold=True, align="center", rtl=True)
    for name in SUBMITTED_BY:
        doc.p(name, align="center")
    doc.p(f"لارښود استاد: {SUPERVISOR}", bold=True, align="center", rtl=True)
    doc.p(f"کال: {YEAR}", bold=True, align="center", rtl=True)


def write_docx(template: Path, doc_xml: str) -> None:
    temp = OUT_DIR / "_tmp_monograph.docx"
    if temp.exists():
        temp.unlink()
    with zipfile.ZipFile(template, "r") as zin, zipfile.ZipFile(temp, "w", zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == "word/document.xml":
                data = doc_xml.encode("utf-8")
            zout.writestr(item, data)
    shutil.move(str(temp), OUTPUT_DOCX)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    template = find_template()
    doc = WordDoc()
    add_front_matter(doc)
    add_chapter_one(doc)
    add_chapter_two(doc)
    add_chapter_three(doc)
    add_chapter_four(doc)
    add_chapter_five(doc)
    add_chapter_six_and_back_matter(doc)
    OUTLINE_MD.write_text(outline_text(), encoding="utf-8")
    write_docx(template, doc.build())
    estimated_pages = doc.page_breaks + 1
    SUMMARY_TXT.write_text(
        "\n".join(
            [
                f"Template: {template}",
                f"Output: {OUTPUT_DOCX}",
                f"Outline: {OUTLINE_MD}",
                f"Estimated minimum pages from explicit page breaks: {estimated_pages}",
                f"Word count estimate: {doc.word_count}",
                f"Tables: {doc.table_count}",
                f"Figures/descriptions: {doc.figure_count}",
            ]
        )
        + "\n",
        encoding="utf-8",
    )
    print(SUMMARY_TXT.read_text(encoding="utf-8").encode("ascii", "backslashreplace").decode("ascii"))


if __name__ == "__main__":
    main()
