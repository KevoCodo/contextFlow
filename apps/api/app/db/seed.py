from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.knowledge_document import KnowledgeDocument
from app.models.knowledge_source import KnowledgeSource
from app.models.status import RecordStatus


def seed_demo_data(db: Session) -> None:
    existing = db.scalar(select(KnowledgeSource.id).limit(1))
    if existing is not None:
        return

    sources = [
        KnowledgeSource(
            title="Operations Knowledge (Demo)",
            description="Public-safe example content for screenshots and walkthroughs.",
            status=RecordStatus.draft,
        ),
        KnowledgeSource(
            title="Onboarding FAQ (Demo)",
            description="Generic onboarding and process FAQs (no private data).",
            status=RecordStatus.draft,
        ),
    ]
    db.add_all(sources)
    db.flush()

    docs = [
        KnowledgeDocument(
            source_id=sources[0].id,
            title="Workflow automation guidelines",
            content=(
                "Purpose\n"
                "Use automation to reduce manual handoffs and improve consistency.\n\n"
                "When to automate\n"
                "- Repetitive tasks with clear rules\n"
                "- Data transforms that are easy to validate\n"
                "- Notifications and reminders based on state changes\n\n"
                "Operational guardrails\n"
                "- Prefer small, observable workflows\n"
                "- Add clear ownership and rollback steps\n"
                "- Log outcomes without storing sensitive content\n"
            ),
            status=RecordStatus.draft,
        ),
        KnowledgeDocument(
            source_id=sources[0].id,
            title="Incident response quick start",
            content=(
                "If an automated workflow fails:\n\n"
                "1) Identify the failing step and last successful action.\n"
                "2) Capture timestamps, inputs, and error messages.\n"
                "3) Apply the smallest safe rollback.\n"
                "4) Re-run only after verifying upstream data.\n\n"
                "Definitions\n"
                "- Incident: unexpected behavior causing user-visible impact\n"
                "- Degraded: partial functionality with a known workaround\n"
            ),
            status=RecordStatus.draft,
        ),
        KnowledgeDocument(
            source_id=sources[1].id,
            title="Team onboarding FAQ",
            content=(
                "Q: Where do I start?\n"
                "A: Start with the dashboard, then review the sources and documents.\n\n"
                "Q: How do I add knowledge?\n"
                "A: Create a source, add a document, then index it to generate chunks and embeddings.\n\n"
                "Q: Does the assistant browse the web?\n"
                "A: No. This is a standalone demo and only uses indexed content.\n"
            ),
            status=RecordStatus.draft,
        ),
    ]
    db.add_all(docs)
    db.commit()
