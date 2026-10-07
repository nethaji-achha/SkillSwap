import json
from typing import Dict, Any, List
from backend.app.core.config import settings

# Pre-curated high quality question banks for popular skills
SKILL_QUESTION_BANKS: Dict[str, List[Dict[str, Any]]] = {
    "react": [
        {
            "id": "q_1",
            "question": "What is the primary benefit of using the React useEffect dependency array?",
            "options": [
                "It restricts the component from re-rendering entirely",
                "It specifies which state or prop changes should re-trigger the side-effect",
                "It compiles JSX into virtual DOM nodes faster",
                "It automatically cancels pending HTTP requests"
            ],
            "correct_idx": 1,
            "explanation": "The dependency array tells React to only re-run the effect if the listed values have changed between renders."
        },
        {
            "id": "q_2",
            "question": "Which hook should be used to memoize expensive computations between renders in React?",
            "options": [
                "useCallback",
                "useRef",
                "useMemo",
                "useLayoutEffect"
            ],
            "correct_idx": 2,
            "explanation": "useMemo caches the calculated result of a function and only recalculates it when its dependencies change."
        },
        {
            "id": "q_3",
            "question": "Why should keys in React lists be unique and stable?",
            "options": [
                "To satisfy CSS selector uniqueness requirements",
                "To enable React's reconciliation algorithm to accurately identify which items changed, were added, or were removed",
                "To prevent memory leaks in localStorage",
                "To bind event listeners directly to the window object"
            ],
            "correct_idx": 1,
            "explanation": "Stable keys help React identify which items have changed, allowing efficient DOM updates during reconciliation."
        },
        {
            "id": "q_4",
            "question": "What happens when you update state using a setter function with the updater function pattern setCount(prev => prev + 1)?",
            "options": [
                "It causes a synchronous DOM repaint immediately",
                "It accesses the latest pending state value reliably even during batched updates",
                "It bypasses shouldComponentUpdate checks",
                "It converts state into a global Zustand store"
            ],
            "correct_idx": 1,
            "explanation": "Passing a function ensures you read the most recent up-to-date state when multiple state updates are queued."
        },
        {
            "id": "q_5",
            "question": "What is the key difference between Controlled and Uncontrolled components in React?",
            "options": [
                "Controlled components store form data in DOM elements; uncontrolled use React state",
                "Controlled components have their form data handled by React state; uncontrolled store data in the DOM via refs",
                "Uncontrolled components cannot trigger submit handlers",
                "Controlled components do not support TypeScript"
            ],
            "correct_idx": 1,
            "explanation": "In a controlled component, form input value is controlled by React state; in uncontrolled components, input data is handled by the DOM itself."
        }
    ],
    "python": [
        {
            "id": "q_1",
            "question": "What is the difference between a Python list and a tuple?",
            "options": [
                "Lists are immutable, while tuples are mutable",
                "Lists are mutable and defined with square brackets, while tuples are immutable and defined with parentheses",
                "Tuples cannot contain mixed data types",
                "Lists have fixed size, while tuples can grow dynamically"
            ],
            "correct_idx": 1,
            "explanation": "Lists are mutable sequences, whereas tuples cannot be modified in place once created (immutable)."
        },
        {
            "id": "q_2",
            "question": "How does a Python generator differ from a standard function that returns a list?",
            "options": [
                "Generators run on a separate CPU thread automatically",
                "Generators use the yield keyword to produce values lazily on-demand, saving memory",
                "Generators cannot take arguments",
                "Generators return JSON strings rather than Python objects"
            ],
            "correct_idx": 1,
            "explanation": "yield produces a generator that evaluates and yields items one at a time, providing great memory efficiency for large datasets."
        },
        {
            "id": "q_3",
            "question": "What is the purpose of the *args and **kwargs syntax in Python function definitions?",
            "options": [
                "To declare pointer variables as in C/C++",
                "To accept arbitrary numbers of positional and keyword arguments respectively",
                "To enforce strict static typing during runtime",
                "To define private class variables"
            ],
            "correct_idx": 1,
            "explanation": "*args captures extra positional arguments as a tuple, and **kwargs captures extra keyword arguments as a dictionary."
        },
        {
            "id": "q_4",
            "question": "What is the Global Interpreter Lock (GIL) in standard CPython?",
            "options": [
                "A database locking mechanism for SQLite",
                "A mutex that prevents multiple native threads from executing Python bytecodes simultaneously",
                "A security feature that blocks unauthorized file system writes",
                "A garbage collection algorithm that clears unused variables"
            ],
            "correct_idx": 1,
            "explanation": "The GIL is a mutex in CPython that protects access to Python objects, preventing multiple native threads from executing Python bytecodes in parallel."
        },
        {
            "id": "q_5",
            "question": "Which built-in Python function is used to pair elements from multiple iterables together?",
            "options": [
                "map()",
                "filter()",
                "zip()",
                "enumerate()"
            ],
            "correct_idx": 2,
            "explanation": "zip(*iterables) aggregates elements from each of the iterables into tuples."
        }
    ],
    "machine learning": [
        {
            "id": "q_1",
            "question": "What is the primary indicator of overfitting in a machine learning model?",
            "options": [
                "High training loss and high validation loss",
                "Very low training loss but significantly higher validation/test loss",
                "Model predictions that run too slowly in production",
                "Zero gradient during backpropagation"
            ],
            "correct_idx": 1,
            "explanation": "Overfitting occurs when a model learns noise and specific details of the training data so closely that it fails to generalize to unseen validation data."
        },
        {
            "id": "q_2",
            "question": "Which regularization technique randomly disables a proportion of neurons during neural network training?",
            "options": [
                "Batch Normalization",
                "L2 Weight Decay",
                "Dropout",
                "Gradient Clipping"
            ],
            "correct_idx": 2,
            "explanation": "Dropout randomly sets a fraction of input units to 0 at each update during training time, which helps prevent overfitting."
        },
        {
            "id": "q_3",
            "question": "What does the Area Under the ROC Curve (AUC-ROC) measure for binary classification?",
            "options": [
                "The training speed per epoch",
                "The model's capability of distinguishing between positive and negative classes across various classification thresholds",
                "The exact number of false positives divided by false negatives",
                "The compression ratio of the neural network weights"
            ],
            "correct_idx": 1,
            "explanation": "AUC-ROC evaluates how well a classifier separates positive and negative classes independent of a single specific threshold."
        },
        {
            "id": "q_4",
            "question": "What is the main advantage of the Transformer architecture over traditional Recurrent Neural Networks (RNNs)?",
            "options": [
                "Transformers do not require floating-point arithmetic",
                "Self-attention allows parallel processing across the entire sequence rather than sequential step-by-step recurrence",
                "Transformers can only be trained with unsupervised clustering",
                "Transformers require fewer hyperparameters"
            ],
            "correct_idx": 1,
            "explanation": "The self-attention mechanism processes all tokens simultaneously in parallel, allowing better capture of long-range dependencies and scalable GPU training."
        },
        {
            "id": "q_5",
            "question": "Why is feature scaling (e.g., StandardScaler or MinMaxScaler) crucial for distance-based algorithms like KNN and SVM?",
            "options": [
                "To convert all categorical data into strings",
                "To ensure features with large numerical magnitudes do not disproportionately dominate distance calculations",
                "To eliminate all outliers automatically",
                "To reduce the number of features by half"
            ],
            "correct_idx": 1,
            "explanation": "Without scaling, features with large scales dominate Euclidean distance metrics over equally important features with smaller scales."
        }
    ]
}

def generate_session_summary_data(
    skill_name: str,
    teacher_name: str,
    learner_name: str,
    duration_minutes: int,
    objective: str = ""
) -> Dict[str, Any]:
    """
    Generates a structured learning summary for a completed session.
    Uses Gemini API if available, or rich structured educational synthesis.
    """
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            You are an educational AI mentor on Skill Swap platform.
            A 1-on-1 mentorship session just completed with these details:
            - Skill: {skill_name}
            - Mentor / Teacher: {teacher_name}
            - Learner: {learner_name}
            - Duration: {duration_minutes} minutes
            - Learning Objective: {objective or f"Master essential core techniques and best practices for {skill_name}"}

            Generate a comprehensive, structured session summary in STRICT JSON format:
            {{
              "title": "{skill_name} 1-on-1 Mastery Session Summary",
              "learning_objective": "...",
              "key_concepts": ["concept 1", "concept 2", "concept 3", "concept 4"],
              "important_points": ["point 1", "point 2", "point 3"],
              "practical_tips": ["tip 1", "tip 2", "tip 3"],
              "questions_discussed": ["question 1", "question 2", "question 3"],
              "main_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
              "suggested_revision_points": ["revision item 1", "revision item 2"],
              "suggested_next_steps": ["next step 1", "next step 2", "next step 3"],
              "raw_summary": "Comprehensive overview paragraph of the session discussions and learnings."
            }}
            Return ONLY the valid JSON object.
            """
            res = model.generate_content(prompt)
            clean_text = res.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            data = json.loads(clean_text.strip())
            return data
        except Exception:
            pass

    # High quality structured default summary
    obj_text = objective.strip() if objective else f"Master fundamental concepts, practical application patterns, and debugging workflows in {skill_name}."
    return {
        "title": f"{skill_name} Mastery Exchange Session",
        "learning_objective": obj_text,
        "key_concepts": [
            f"Core architecture and design patterns in {skill_name}",
            f"State management, lifecycle, and data flow principles",
            f"Industry-standard best practices and idiomatic conventions",
            f"Hands-on debugging and performance considerations"
        ],
        "important_points": [
            f"Emphasized clean code structure and modular design when building in {skill_name}",
            f"Discussed common anti-patterns to avoid during practical implementation",
            f"Reviewed real-world problem solving strategies shared by {teacher_name}"
        ],
        "practical_tips": [
            f"Maintain focused, single-responsibility components and functions in {skill_name}",
            "Write descriptive variable names and document non-obvious design choices",
            "Set up automated linting and formatting in your local development environment"
        ],
        "questions_discussed": [
            f"What is the most effective approach to structuring projects in {skill_name}?",
            "How do you handle edge cases and state synchronization reliably?",
            "What tools and libraries are recommended for profiling and testing?"
        ],
        "main_takeaways": [
            f"Gained clarity on core principles of {skill_name}",
            f"Received personalized feedback and insights directly from {teacher_name}",
            "Established a concrete roadmap for further self-directed practice and revision"
        ],
        "suggested_revision_points": [
            f"Review code examples and exercises covered during the {duration_minutes}-minute session",
            f"Build a mini practice project utilizing the key {skill_name} concepts discussed",
            "Prepare for the upcoming Skill Assessment scheduled in 2 days"
        ],
        "suggested_next_steps": [
            f"Implement a small hands-on feature applying today's {skill_name} lessons",
            "Complete your scheduled Skill Assessment to upgrade from Bronze to Silver or Gold badge",
            f"Schedule a follow-up swap or review session to evaluate progress"
        ],
        "raw_summary": f"In this {duration_minutes}-minute interactive session, {learner_name} and {teacher_name} engaged in a comprehensive deep dive into {skill_name}. The session focused on '{obj_text}', covering core theoretical concepts alongside actionable real-world tips and hands-on exercises."
    }

def generate_skill_assessment_questions(skill_name: str, topic: str = "") -> List[Dict[str, Any]]:
    """
    Generates 5 multiple choice questions for a skill assessment.
    """
    clean_skill = skill_name.strip().lower()
    
    # Check pre-curated bank first
    for key, questions in SKILL_QUESTION_BANKS.items():
        if key in clean_skill or clean_skill in key:
            return questions

    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel("gemini-1.5-flash")
            prompt = f"""
            You are an educational assessment creator for Skill Swap.
            Generate 5 high quality multiple-choice assessment questions for the skill '{skill_name}' (Topic: {topic or 'Core Concepts'}).
            
            Return STRICTLY a JSON array of 5 question objects:
            [
              {{
                "id": "q_1",
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_idx": 0,
                "explanation": "Clear explanation why Option A is correct."
              }}
            ]
            Return ONLY the valid JSON array.
            """
            res = model.generate_content(prompt)
            clean_text = res.text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            data = json.loads(clean_text.strip())
            if isinstance(data, list) and len(data) >= 3:
                return data
        except Exception:
            pass

    # Generic high quality questions customized for the skill
    return [
        {
            "id": "q_1",
            "question": f"What is a primary architectural principle when building systems with {skill_name}?",
            "options": [
                "Tight coupling between all system modules",
                "Separation of concerns and modular component structure",
                "Hardcoding configuration values directly in business logic",
                "Avoiding version control systems"
            ],
            "correct_idx": 1,
            "explanation": f"Modular structure and separation of concerns ensure {skill_name} projects remain maintainable and scalable."
        },
        {
            "id": "q_2",
            "question": f"How should state and data transitions typically be handled in {skill_name}?",
            "options": [
                "Through global mutable variables without encapsulation",
                "Using predictable, well-defined data flows and error handling",
                "By ignoring edge cases and unexpected input states",
                "By restarting the entire process on any error"
            ],
            "correct_idx": 1,
            "explanation": "Predictable data flow with structured error resilience ensures reliable execution across varied user inputs."
        },
        {
            "id": "q_3",
            "question": f"Which practice is most effective for optimizing performance in {skill_name} applications?",
            "options": [
                "Profiling bottlenecks with measurements before optimizing, and avoiding unnecessary redundant operations",
                "Adding more nested loops for increased precision",
                "Disabling caching layers entirely",
                "Increasing the size of every payload"
            ],
            "correct_idx": 0,
            "explanation": "Measuring and identifying actual computational and I/O bottlenecks is essential for targeted performance gains."
        },
        {
            "id": "q_4",
            "question": f"What is the recommended approach for handling external dependencies and APIs in {skill_name}?",
            "options": [
                "Making synchronous blocking calls on the main thread",
                "Abstracting integrations through client interfaces with timeouts and retry mechanisms",
                "Hardcoding production credentials in public repositories",
                "Assuming external networks never experience latency"
            ],
            "correct_idx": 1,
            "explanation": "Interface abstraction combined with resilience policies (timeouts, graceful error handling) protects against external service failures."
        },
        {
            "id": "q_5",
            "question": f"Why are automated tests and code reviews valuable in {skill_name} development?",
            "options": [
                "They slow down shipping without catching bugs",
                "They verify functional correctness, prevent regression bugs, and facilitate continuous improvement",
                "They replace the need for documentation and architecture design",
                "They are only applicable to legacy monolithic codebases"
            ],
            "correct_idx": 1,
            "explanation": "Automated testing catches regressions early, while peer code reviews spread knowledge and improve overall software quality."
        }
    ]

def evaluate_badge_level(score_percentage: float) -> str:
    """
    Evaluates badge level based on percentage:
    80-100% -> GOLD
    60-79% -> SILVER
    0-59% -> BRONZE
    """
    if score_percentage >= 80.0:
        return "GOLD"
    elif score_percentage >= 60.0:
        return "SILVER"
    return "BRONZE"

def is_badge_upgrade(current_badge: str, new_badge: str) -> bool:
    """
    Checks if new_badge is a higher tier than current_badge.
    Tiers: GOLD (3) > SILVER (2) > BRONZE (1)
    """
    badge_ranks = {
        "BRONZE": 1,
        "SILVER": 2,
        "GOLD": 3
    }
    cur_rank = badge_ranks.get((current_badge or "").upper(), 0)
    new_rank = badge_ranks.get((new_badge or "").upper(), 0)
    return new_rank > cur_rank
