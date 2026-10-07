from sqlalchemy.orm import Session
from backend.app.db.session import engine, Base
from backend.app.models.all_models import SkillCategory, TokenPackage, SubscriptionPlan

def init_db(db: Session) -> None:
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # 1. Seed Categories if empty
    if db.query(SkillCategory).count() == 0:
        categories = [
            {"name": "Programming", "slug": "programming", "description": "Software architecture, backend, mobile & algorithms", "icon": "Code"},
            {"name": "Web Development", "slug": "web-dev", "description": "Frontend, full-stack, Next.js, React, Node.js", "icon": "Globe"},
            {"name": "AI & Machine Learning", "slug": "ai-ml", "description": "LLMs, PyTorch, prompt engineering, data science", "icon": "Cpu"},
            {"name": "UI/UX & Product Design", "slug": "ui-ux", "description": "Figma, user research, wireframing, design systems", "icon": "Layers"},
            {"name": "Marketing & Growth", "slug": "marketing", "description": "SEO, performance marketing, content strategy, copy", "icon": "TrendingUp"},
            {"name": "Business & Strategy", "slug": "business", "description": "Product management, startups, pitch decks, finance", "icon": "Briefcase"},
            {"name": "Photography & Video", "slug": "media", "description": "Editing, DaVinci Resolve, lighting, cinematography", "icon": "Video"},
            {"name": "Languages", "slug": "languages", "description": "English, Spanish, French, German, Japanese, Mandarin", "icon": "Languages"},
            {"name": "Music & Audio", "slug": "music", "description": "Production, guitar, piano, mixing & mastering", "icon": "Music"},
            {"name": "Career Development", "slug": "career", "description": "Resume reviews, interview prep, leadership coaching", "icon": "Award"},
        ]
        for cat in categories:
            db.add(SkillCategory(**cat))
        db.commit()

    # 2. Seed Token Packages if empty
    if db.query(TokenPackage).count() == 0:
        packages = [
            {"name": "Starter", "tokens": 50, "price_inr": 100, "is_popular": False, "badge": "Beginner"},
            {"name": "Standard", "tokens": 105, "price_inr": 200, "is_popular": False, "badge": "+5 Bonus"},
            {"name": "Popular", "tokens": 275, "price_inr": 500, "is_popular": True, "badge": "Most Popular (+25 Bonus)"},
            {"name": "Pro Pack", "tokens": 600, "price_inr": 1000, "is_popular": False, "badge": "+100 Bonus"},
            {"name": "Premium Pack", "tokens": 1300, "price_inr": 2000, "is_popular": False, "badge": "Best Value (+300 Bonus)"},
        ]
        for pkg in packages:
            db.add(TokenPackage(**pkg))
        db.commit()

    # 3. Seed Subscription Plans if empty
    if db.query(SubscriptionPlan).count() == 0:
        plans = [
            {
                "name": "Basic",
                "slug": "basic",
                "price_inr": 0,
                "tokens_per_month": 15,
                "ai_requests_per_month": 15,
                "is_popular": False,
                "features": [
                    "15 Welcome Tokens",
                    "Basic Skill Exchange",
                    "Community Discovery",
                    "Standard Messaging",
                    "15 Monthly AI Requests"
                ]
            },
            {
                "name": "Skill Swap Go",
                "slug": "go",
                "price_inr": 399,
                "tokens_per_month": 200,
                "ai_requests_per_month": 100,
                "is_popular": True,
                "features": [
                    "200 Tokens Included / month",
                    "AI Skill Matching Engine",
                    "AI Profile Optimization",
                    "Advanced Skill Discovery",
                    "Priority Matching Status",
                    "AI Learning Roadmaps",
                    "Basic Analytics Dashboard"
                ]
            },
            {
                "name": "Skill Swap Plus",
                "slug": "plus",
                "price_inr": 1999,
                "tokens_per_month": 1000,
                "ai_requests_per_month": 500,
                "is_popular": False,
                "features": [
                    "1,000 Tokens Included / month",
                    "Advanced AI Matching & Recommendations",
                    "Dedicated AI Learning Mentor",
                    "Skill Gap Analysis & Roadmap",
                    "Verified Skill Profile Badge",
                    "Advanced Skill Passport",
                    "Private Peer Communities",
                    "Project Collaboration Spaces",
                    "Advanced Analytics & Feedback"
                ]
            },
            {
                "name": "Skill Swap Pro",
                "slug": "pro",
                "price_inr": 10699,
                "tokens_per_month": 6000,
                "ai_requests_per_month": 2500,
                "is_popular": False,
                "features": [
                    "6,000 Tokens Included / month",
                    "Everything in Plus tier",
                    "Highest Marketplace Visibility",
                    "Expert Verification & Badging",
                    "Autonomous AI Agents & Career Strategy",
                    "Premium Inner Circle Communities",
                    "Professional Collaboration Tools",
                    "Enterprise Level Analytics",
                    "24/7 Priority Support",
                    "Expert Marketplace Monetization Tools"
                ]
            }
        ]
        for plan in plans:
            db.add(SubscriptionPlan(**plan))
        db.commit()
