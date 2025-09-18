"""
SQLAlchemy ORM Examples - Demonstrating High-Level API Benefits

This file showcases how SQLAlchemy's ORM provides a Pythonic, high-level API
for database operations without manually writing repetitive SQL queries.

Key Benefits Demonstrated:
1. Pythonic syntax instead of raw SQL
2. Automatic relationship handling
3. Built-in query optimization
4. Type safety and IDE support
5. Easy serialization methods
6. Error handling and transaction management
"""

from app.models import User, Profile, HousegirlProfile, Agency, AgencyProfile
from app import db
from sqlalchemy.orm import joinedload
from sqlalchemy import and_, or_, func

def demonstrate_user_operations():
    """Demonstrate SQLAlchemy ORM benefits for User operations"""
    
    print("=== User Operations with SQLAlchemy ORM ===\n")
    
    # 1. Creating users with class methods (no raw SQL needed)
    print("1. Creating users using class methods:")
    try:
        user = User.create_user(
            firebase_uid="demo_123",
            email="demo@example.com",
            user_type="housegirl",
            first_name="Jane",
            last_name="Doe"
        )
        print(f"   ✓ Created user: {user.email}")
    except Exception as e:
        print(f"   ✗ Error: {e}")
    
    # 2. Finding users with class methods (clean, readable queries)
    print("\n2. Finding users using class methods:")
    user_by_email = User.find_by_email("demo@example.com")
    user_by_firebase = User.find_by_firebase_uid("demo_123")
    print(f"   ✓ Found by email: {user_by_email.email if user_by_email else 'Not found'}")
    print(f"   ✓ Found by Firebase UID: {user_by_firebase.email if user_by_firebase else 'Not found'}")
    
    # 3. Searching users (complex queries made simple)
    print("\n3. Searching users:")
    search_results = User.search_users("Jane")
    print(f"   ✓ Search results: {len(search_results)} users found")
    
    # 4. Serialization (no manual dictionary building)
    print("\n4. User serialization:")
    if user:
        user_dict = user.to_dict()
        print(f"   ✓ User data: {user_dict['first_name']} {user_dict['last_name']}")
    
    # 5. Profile updates (transaction handling built-in)
    print("\n5. Profile updates:")
    if user:
        try:
            user.update_profile(
                first_name="Jane Updated",
                phone_number="+254700000000"
            )
            print(f"   ✓ Updated user: {user.first_name}")
        except Exception as e:
            print(f"   ✗ Update error: {e}")

def demonstrate_relationship_loading():
    """Demonstrate SQLAlchemy's relationship loading optimization"""
    
    print("\n=== Relationship Loading Optimization ===\n")
    
    # 1. Eager loading with joinedload (prevents N+1 queries)
    print("1. Eager loading with joinedload:")
    users_with_profiles = User.get_users_by_type("housegirl")
    print(f"   ✓ Loaded {len(users_with_profiles)} users with profiles in single query")
    
    # 2. Complex relationship loading
    print("\n2. Complex relationship loading:")
    user_with_full_profile = User.get_user_with_profile("user_demo_123")
    if user_with_full_profile:
        print(f"   ✓ Loaded user with complete profile data")
        full_data = user_with_full_profile.get_full_profile_data()
        print(f"   ✓ Profile data includes: {list(full_data.keys())}")
    
    # 3. Dynamic relationship queries
    print("\n3. Dynamic relationship queries:")
    if user_with_full_profile and user_with_full_profile.profile:
        # SQLAlchemy handles the relationship automatically
        photos_count = user_with_full_profile.profile.photos.count()
        print(f"   ✓ User has {photos_count} photos (dynamic query)")

def demonstrate_housegirl_queries():
    """Demonstrate complex queries for housegirl profiles"""
    
    print("\n=== Housegirl Profile Queries ===\n")
    
    # 1. Simple filtered queries
    print("1. Simple filtered queries:")
    available_workers = HousegirlProfile.find_available_workers()
    print(f"   ✓ Found {len(available_workers)} available workers")
    
    # 2. Location-based queries (case-insensitive)
    print("\n2. Location-based queries:")
    nairobi_workers = HousegirlProfile.find_by_location("Nairobi")
    print(f"   ✓ Found {len(nairobi_workers)} workers in Nairobi")
    
    # 3. Salary range queries
    print("\n3. Salary range queries:")
    mid_range_workers = HousegirlProfile.find_by_salary_range(15000, 25000)
    print(f"   ✓ Found {len(mid_range_workers)} workers in salary range 15k-25k")
    
    # 4. Complex search queries
    print("\n4. Complex search queries:")
    experienced_workers = HousegirlProfile.search_workers("experienced")
    print(f"   ✓ Found {len(experienced_workers)} experienced workers")
    
    # 5. Optimized relationship loading
    print("\n5. Optimized relationship loading:")
    workers_with_profiles = HousegirlProfile.get_workers_with_profile()
    print(f"   ✓ Loaded {len(workers_with_profiles)} workers with user profiles")

def demonstrate_agency_queries():
    """Demonstrate agency-specific queries"""
    
    print("\n=== Agency Queries ===\n")
    
    # 1. Verification status queries
    print("1. Verification status queries:")
    verified_agencies = Agency.find_verified_agencies()
    print(f"   ✓ Found {len(verified_agencies)} verified agencies")
    
    # 2. Location-based agency search
    print("\n2. Location-based agency search:")
    nairobi_agencies = Agency.find_by_location("Nairobi")
    print(f"   ✓ Found {len(nairobi_agencies)} agencies in Nairobi")
    
    # 3. Rating-based queries with ordering
    print("\n3. Rating-based queries:")
    top_rated_agencies = Agency.find_by_rating(4.5)
    print(f"   ✓ Found {len(top_rated_agencies)} highly-rated agencies")
    
    # 4. Subscription tier queries
    print("\n4. Subscription tier queries:")
    premium_agencies = Agency.find_by_subscription_tier("premium")
    print(f"   ✓ Found {len(premium_agencies)} premium agencies")
    
    # 5. Text search across multiple fields
    print("\n5. Text search across multiple fields:")
    search_results = Agency.search_agencies("domestic")
    print(f"   ✓ Found {len(search_results)} agencies matching 'domestic'")

def demonstrate_advanced_sqlalchemy_features():
    """Demonstrate advanced SQLAlchemy ORM features"""
    
    print("\n=== Advanced SQLAlchemy Features ===\n")
    
    # 1. Complex filtering with and_/or_ operators
    print("1. Complex filtering:")
    complex_query = HousegirlProfile.query.filter(
        and_(
            HousegirlProfile.is_available == True,
            HousegirlProfile.expected_salary >= 20000,
            or_(
                HousegirlProfile.location.ilike('%Nairobi%'),
                HousegirlProfile.location.ilike('%Mombasa%')
            )
        )
    ).all()
    print(f"   ✓ Complex query found {len(complex_query)} workers")
    
    # 2. Aggregation queries
    print("\n2. Aggregation queries:")
    avg_salary = db.session.query(func.avg(HousegirlProfile.expected_salary)).scalar()
    print(f"   ✓ Average expected salary: {avg_salary or 0:.2f}")
    
    # 3. Count queries
    print("\n3. Count queries:")
    total_users = User.query.count()
    total_agencies = Agency.query.count()
    print(f"   ✓ Total users: {total_users}, Total agencies: {total_agencies}")
    
    # 4. Ordering and limiting
    print("\n4. Ordering and limiting:")
    recent_users = User.query.order_by(User.created_at.desc()).limit(5).all()
    print(f"   ✓ Found {len(recent_users)} most recent users")
    
    # 5. Pagination example
    print("\n5. Pagination example:")
    page_size = 10
    page = 1
    offset = (page - 1) * page_size
    paginated_users = User.query.offset(offset).limit(page_size).all()
    print(f"   ✓ Page {page}: {len(paginated_users)} users")

def demonstrate_error_handling():
    """Demonstrate SQLAlchemy's built-in error handling"""
    
    print("\n=== Error Handling and Transaction Management ===\n")
    
    # 1. Automatic rollback on errors
    print("1. Automatic rollback on errors:")
    try:
        # This will fail due to duplicate email
        User.create_user(
            firebase_uid="duplicate_test",
            email="demo@example.com",  # This email already exists
            user_type="employer"
        )
    except Exception as e:
        print(f"   ✓ Transaction automatically rolled back: {type(e).__name__}")
    
    # 2. Safe updates with validation
    print("\n2. Safe updates with validation:")
    user = User.find_by_email("demo@example.com")
    if user:
        try:
            # This will work because we're updating existing user
            user.update_profile(first_name="Updated Name")
            print(f"   ✓ Successfully updated user: {user.first_name}")
        except Exception as e:
            print(f"   ✗ Update failed: {e}")

def main():
    """Run all SQLAlchemy demonstrations"""
    
    print("SQLAlchemy ORM Benefits Demonstration")
    print("=" * 50)
    
    try:
        demonstrate_user_operations()
        demonstrate_relationship_loading()
        demonstrate_housegirl_queries()
        demonstrate_agency_queries()
        demonstrate_advanced_sqlalchemy_features()
        demonstrate_error_handling()
        
        print("\n" + "=" * 50)
        print("✓ All demonstrations completed successfully!")
        print("\nKey Benefits Demonstrated:")
        print("• Pythonic syntax instead of raw SQL")
        print("• Automatic relationship handling")
        print("• Built-in query optimization")
        print("• Type safety and IDE support")
        print("• Easy serialization methods")
        print("• Error handling and transaction management")
        print("• Complex queries made simple")
        print("• Performance optimization with eager loading")
        
    except Exception as e:
        print(f"\n✗ Demonstration failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

