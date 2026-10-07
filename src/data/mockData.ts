import { PopularSkillCategory, TokenPackageItem, SubscriptionPlanItem } from '@/types';

export const POPULAR_SKILL_CATEGORIES: PopularSkillCategory[] = [
  {
    id: 'programming',
    name: 'Programming',
    slug: 'programming',
    description: 'Software architecture, backend, mobile & algorithms',
    icon: 'Code'
  },
  {
    id: 'web-dev',
    name: 'Web Development',
    slug: 'web-dev',
    description: 'Frontend, full-stack, Next.js, React, Node.js',
    icon: 'Globe'
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'LLMs, PyTorch, prompt engineering, data science',
    icon: 'Cpu'
  },
  {
    id: 'ui-ux',
    name: 'UI/UX & Product Design',
    slug: 'ui-ux',
    description: 'Figma, user research, wireframing, design systems',
    icon: 'Layers'
  },
  {
    id: 'marketing',
    name: 'Marketing & Growth',
    slug: 'marketing',
    description: 'SEO, performance marketing, content strategy, copy',
    icon: 'TrendingUp'
  },
  {
    id: 'business',
    name: 'Business & Strategy',
    slug: 'business',
    description: 'Product management, startups, pitch decks, finance',
    icon: 'Briefcase'
  },
  {
    id: 'media',
    name: 'Photography & Video',
    slug: 'media',
    description: 'Editing, DaVinci Resolve, lighting, cinematography',
    icon: 'Video'
  },
  {
    id: 'languages',
    name: 'Languages',
    slug: 'languages',
    description: 'English, Spanish, French, German, Japanese, Mandarin',
    icon: 'Languages'
  },
  {
    id: 'music',
    name: 'Music & Audio',
    slug: 'music',
    description: 'Production, guitar, piano, mixing & mastering',
    icon: 'Music'
  },
  {
    id: 'career',
    name: 'Career Development',
    slug: 'career',
    description: 'Resume reviews, interview prep, leadership coaching',
    icon: 'Award'
  }
];

export const TOKEN_PACKAGES: TokenPackageItem[] = [
  { id: 'starter', name: 'Starter', tokens: 50, price_inr: 100, is_popular: false, badge: 'Beginner' },
  { id: 'standard', name: 'Standard', tokens: 105, price_inr: 200, is_popular: false, badge: '+5 Bonus' },
  { id: 'popular', name: 'Popular', tokens: 275, price_inr: 500, is_popular: true, badge: 'Most Popular (+25 Bonus)' },
  { id: 'pro', name: 'Pro Pack', tokens: 600, price_inr: 1000, is_popular: false, badge: '+100 Bonus' },
  { id: 'premium', name: 'Premium Pack', tokens: 1300, price_inr: 2000, is_popular: false, badge: 'Best Value (+300 Bonus)' },
];

export const SUBSCRIPTION_PLANS: SubscriptionPlanItem[] = [
  {
    id: 'basic',
    name: 'Basic',
    slug: 'basic',
    price_inr: 0,
    tokens_per_month: 15,
    ai_requests_per_month: 15,
    is_popular: false,
    features: [
      '15 Welcome Tokens',
      'Basic Skill Exchange',
      'Community Discovery',
      'Standard Messaging',
      '15 Monthly AI Requests'
    ]
  },
  {
    id: 'go',
    name: 'Skill Swap Go',
    slug: 'go',
    price_inr: 399,
    tokens_per_month: 200,
    ai_requests_per_month: 100,
    is_popular: true,
    features: [
      '200 Tokens Included / month',
      'AI Skill Matching Engine',
      'AI Profile Optimization',
      'Advanced Skill Discovery',
      'Priority Matching Status',
      'AI Learning Roadmaps',
      'Basic Analytics Dashboard'
    ]
  },
  {
    id: 'plus',
    name: 'Skill Swap Plus',
    slug: 'plus',
    price_inr: 1999,
    tokens_per_month: 1000,
    ai_requests_per_month: 500,
    is_popular: false,
    features: [
      '1,000 Tokens Included / month',
      'Advanced AI Matching & Recommendations',
      'Dedicated AI Learning Mentor',
      'Skill Gap Analysis & Roadmap',
      'Verified Skill Profile Badge',
      'Advanced Skill Passport',
      'Private Peer Communities',
      'Project Collaboration Spaces',
      'Advanced Analytics & Feedback'
    ]
  },
  {
    id: 'pro',
    name: 'Skill Swap Pro',
    slug: 'pro',
    price_inr: 10699,
    tokens_per_month: 6000,
    ai_requests_per_month: 2500,
    is_popular: false,
    features: [
      '6,000 Tokens Included / month',
      'Everything in Plus tier',
      'Highest Marketplace Visibility',
      'Expert Verification & Badging',
      'Autonomous AI Agents & Career Strategy',
      'Premium Inner Circle Communities',
      'Professional Collaboration Tools',
      'Enterprise Level Analytics',
      '24/7 Priority Support',
      'Expert Marketplace Monetization Tools'
    ]
  }
];
