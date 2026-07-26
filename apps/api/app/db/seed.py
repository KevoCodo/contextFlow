from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource
from app.models.status import RecordStatus

REMOTE_WORK_SOURCE_TITLE = "Remote Work Policy"
REMOTE_WORK_SOURCE_DESCRIPTION = (
    "Public-safe demo source covering remote work eligibility, equipment, temporary work "
    "locations, and meeting expectations."
)
PRODUCT_SUPPORT_SOURCE_TITLE = "Product Support Guide"
PRODUCT_SUPPORT_SOURCE_DESCRIPTION = (
    "Public-safe demo source covering bug report intake, support escalation, and release note "
    "guidance."
)


@dataclass(frozen=True)
class DemoDocument:
    title: str
    content: str


@dataclass(frozen=True)
class DemoSource:
    title: str
    description: str
    legacy_prefix: str
    documents: tuple[DemoDocument, ...]


DEMO_SOURCES: tuple[DemoSource, ...] = (
    DemoSource(
        title=REMOTE_WORK_SOURCE_TITLE,
        description=REMOTE_WORK_SOURCE_DESCRIPTION,
        legacy_prefix="Final Demo Remote Work Policy",
        documents=(
            DemoDocument(
                title="Remote work eligibility",
                content=(
                    "Remote Work Eligibility\n\n"
                    "Employees may work remotely up to three days per week when their role "
                    "responsibilities can be completed without onsite equipment. Before working "
                    "from a temporary location, employees should confirm manager approval, "
                    "reliable internet access, and a quiet workspace. Remote work does not change "
                    "data handling expectations or meeting participation requirements."
                ),
            ),
            DemoDocument(
                title="Equipment policy",
                content=(
                    "Employee Equipment Policy\n\n"
                    "The company provides a standard laptop, charger, headset, and access to "
                    "approved collaboration tools. Employees should not store company data on "
                    "personal USB drives. Damaged or lost equipment must be reported to the "
                    "operations team within one business day."
                ),
            ),
            DemoDocument(
                title="Meeting expectations",
                content=(
                    "Meeting Expectations\n\n"
                    "Remote participants should join scheduled meetings on time, use the shared "
                    "agenda, and summarize decisions in the project channel. Meetings that include "
                    "external attendees should avoid private customer information unless the "
                    "correct agreement and approval are in place."
                ),
            ),
        ),
    ),
    DemoSource(
        title=PRODUCT_SUPPORT_SOURCE_TITLE,
        description=PRODUCT_SUPPORT_SOURCE_DESCRIPTION,
        legacy_prefix="Final Demo Product Support Guide",
        documents=(
            DemoDocument(
                title="Bug report intake",
                content=(
                    "Bug Report Intake\n\n"
                    "For bug reports, support specialists should collect the browser, operating "
                    "system, affected account type, steps to reproduce, expected result, actual "
                    "result, screenshots when appropriate, and relevant timestamps. The report "
                    "should include severity and whether a workaround exists."
                ),
            ),
            DemoDocument(
                title="Support escalation",
                content=(
                    "Support Escalation\n\n"
                    "Urgent production issues should be acknowledged within two business hours "
                    "and escalated to engineering when there is user-visible impact. Product "
                    "questions should first be checked against public documentation before "
                    "escalation."
                ),
            ),
            DemoDocument(
                title="Release note guidance",
                content=(
                    "Release Note Guidance\n\n"
                    "Release notes should describe customer-visible changes, known limitations, "
                    "and any required user action. Internal implementation details should stay out "
                    "of public release notes unless they affect customer behavior."
                ),
            ),
        ),
    ),
)


def _find_source(db: Session, demo_source: DemoSource) -> KnowledgeSource | None:
    clean_source = db.scalar(
        select(KnowledgeSource).where(KnowledgeSource.title == demo_source.title).limit(1)
    )
    if clean_source is not None:
        return clean_source

    return db.scalar(
        select(KnowledgeSource)
        .where(KnowledgeSource.title.startswith(demo_source.legacy_prefix))
        .order_by(KnowledgeSource.id)
        .limit(1)
    )


def _upsert_source(db: Session, demo_source: DemoSource) -> KnowledgeSource:
    source = _find_source(db, demo_source)
    if source is None:
        source = KnowledgeSource(
            title=demo_source.title,
            description=demo_source.description,
            status=RecordStatus.draft,
        )
        db.add(source)
        db.flush()
        return source

    source.title = demo_source.title
    source.description = demo_source.description
    db.add(source)
    db.flush()
    return source


def _upsert_document(db: Session, source: KnowledgeSource, demo_document: DemoDocument) -> None:
    document = db.scalar(
        select(KnowledgeDocument)
        .where(
            KnowledgeDocument.source_id == source.id,
            KnowledgeDocument.title == demo_document.title,
        )
        .limit(1)
    )
    if document is None:
        db.add(
            KnowledgeDocument(
                source_id=source.id,
                title=demo_document.title,
                content=demo_document.content,
                status=RecordStatus.draft,
            )
        )
        return

    if document.content != demo_document.content:
        document.content = demo_document.content
        document.status = RecordStatus.draft
        db.add(document)


def seed_demo_data(db: Session) -> None:
    for demo_source in DEMO_SOURCES:
        source = _upsert_source(db, demo_source)
        for demo_document in demo_source.documents:
            _upsert_document(db, source, demo_document)
    db.commit()
