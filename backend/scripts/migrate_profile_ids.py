import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.firebase_init import db  # noqa: E402


def is_canonical_id(doc_id: str) -> bool:
    return isinstance(doc_id, str) and doc_id.startswith("user_")


def canonical_from_user_id(user_id: str) -> str:
    if not user_id:
        return ""
    if user_id.startswith("user_"):
        return user_id
    return f"user_{user_id}"


def migrate_collection(collection_name: str) -> None:
    print(f"=== Migrating {collection_name} ===")
    migrated = 0
    skipped = 0

    for doc in db.collection(collection_name).stream():
        source_id = doc.id
        data = doc.to_dict() or {}

        if is_canonical_id(source_id):
            skipped += 1
            continue

        user_id = data.get("user_id")
        target_id = canonical_from_user_id(user_id)
        if not target_id:
            print(f"SKIP {source_id}: missing user_id")
            skipped += 1
            continue

        target_ref = db.collection(collection_name).document(target_id)
        if target_ref.get().exists:
            print(f"SKIP {source_id}: target {target_id} already exists")
            skipped += 1
            continue

        payload = dict(data)
        payload["id"] = target_id
        target_ref.set(payload)
        db.collection(collection_name).document(source_id).delete()
        print(f"MIGRATED {source_id} -> {target_id}")
        migrated += 1

    print(f"Done {collection_name}: migrated={migrated}, skipped={skipped}")
    print()


def main() -> None:
    migrate_collection("housegirl_profiles")
    migrate_collection("employer_profiles")


if __name__ == "__main__":
    main()
