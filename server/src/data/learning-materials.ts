// Learning Materials Dataset for Quiz Generation
// This provides structured content for AI to generate contextual quizzes

export interface LearningMaterial {
  id: string;
  subject: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  content: string;
  keyPoints: string[];
  sampleQuestions: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export const learningMaterials: LearningMaterial[] = [
  {
    id: 'cs-001',
    subject: 'Computer Science',
    topic: 'Data Structures',
    difficulty: 'intermediate',
    content: `Data structures are specialized formats for organizing, processing, retrieving and storing data. Common data structures include arrays, linked lists, stacks, queues, trees, and graphs. Each structure has specific use cases and performance characteristics.`,
    keyPoints: [
      'Arrays provide O(1) access time but fixed size',
      'Linked lists allow dynamic sizing but O(n) access time',
      'Stacks follow LIFO (Last In First Out) principle',
      'Queues follow FIFO (First In First Out) principle',
      'Trees enable hierarchical data organization',
      'Graphs represent networks and relationships'
    ],
    sampleQuestions: [
      {
        question: 'Which data structure follows the LIFO principle?',
        options: ['A) Queue', 'B) Stack', 'C) Array', 'D) Linked List'],
        correctAnswer: 'B',
        explanation: 'Stack follows Last In First Out (LIFO) principle, where the last element added is the first to be removed.',
        difficulty: 'easy'
      },
      {
        question: 'What is the time complexity of accessing an element in an array by index?',
        options: ['A) O(n)', 'B) O(log n)', 'C) O(1)', 'D) O(n²)'],
        correctAnswer: 'C',
        explanation: 'Arrays provide constant time O(1) access when using an index because elements are stored in contiguous memory.',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'cs-002',
    subject: 'Computer Science',
    topic: 'Algorithms',
    difficulty: 'intermediate',
    content: `Algorithms are step-by-step procedures for solving problems. Common algorithm paradigms include divide and conquer, dynamic programming, greedy algorithms, and backtracking. Algorithm efficiency is measured using Big O notation.`,
    keyPoints: [
      'Big O notation describes worst-case time complexity',
      'Sorting algorithms: Bubble Sort O(n²), Merge Sort O(n log n)',
      'Binary search requires sorted data and runs in O(log n)',
      'Dynamic programming optimizes by storing subproblem results',
      'Greedy algorithms make locally optimal choices',
      'Recursion breaks problems into smaller subproblems'
    ],
    sampleQuestions: [
      {
        question: 'What is the time complexity of binary search?',
        options: ['A) O(n)', 'B) O(log n)', 'C) O(n log n)', 'D) O(1)'],
        correctAnswer: 'B',
        explanation: 'Binary search divides the search space in half each iteration, resulting in logarithmic time complexity O(log n).',
        difficulty: 'medium'
      },
      {
        question: 'Which sorting algorithm has the best average-case time complexity?',
        options: ['A) Bubble Sort', 'B) Selection Sort', 'C) Merge Sort', 'D) Insertion Sort'],
        correctAnswer: 'C',
        explanation: 'Merge Sort has O(n log n) average-case complexity, which is optimal for comparison-based sorting.',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'math-001',
    subject: 'Mathematics',
    topic: 'Calculus - Derivatives',
    difficulty: 'intermediate',
    content: `Derivatives measure the rate of change of a function. The derivative of f(x) at point x is the slope of the tangent line. Common rules include power rule, product rule, quotient rule, and chain rule.`,
    keyPoints: [
      'Power rule: d/dx(xⁿ) = nxⁿ⁻¹',
      'Product rule: d/dx(uv) = u\'v + uv\'',
      'Quotient rule: d/dx(u/v) = (u\'v - uv\')/v²',
      'Chain rule: d/dx(f(g(x))) = f\'(g(x))·g\'(x)',
      'Derivative of eˣ is eˣ',
      'Derivative of sin(x) is cos(x)'
    ],
    sampleQuestions: [
      {
        question: 'What is the derivative of x³?',
        options: ['A) 3x²', 'B) x²', 'C) 3x', 'D) x³'],
        correctAnswer: 'A',
        explanation: 'Using the power rule d/dx(xⁿ) = nxⁿ⁻¹, the derivative of x³ is 3x².',
        difficulty: 'easy'
      },
      {
        question: 'Which rule is used to find the derivative of sin(x²)?',
        options: ['A) Power rule', 'B) Product rule', 'C) Chain rule', 'D) Quotient rule'],
        correctAnswer: 'C',
        explanation: 'Chain rule is used for composite functions. Here, sin is the outer function and x² is the inner function.',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'bio-001',
    subject: 'Biology',
    topic: 'Cell Structure',
    difficulty: 'beginner',
    content: `Cells are the basic units of life. Eukaryotic cells contain membrane-bound organelles including nucleus, mitochondria, endoplasmic reticulum, and Golgi apparatus. Prokaryotic cells lack these structures.`,
    keyPoints: [
      'Nucleus contains genetic material (DNA)',
      'Mitochondria produce ATP (cellular energy)',
      'Ribosomes synthesize proteins',
      'Endoplasmic reticulum transports materials',
      'Golgi apparatus packages and modifies proteins',
      'Cell membrane controls what enters and exits'
    ],
    sampleQuestions: [
      {
        question: 'Which organelle is known as the powerhouse of the cell?',
        options: ['A) Nucleus', 'B) Mitochondria', 'C) Ribosome', 'D) Golgi apparatus'],
        correctAnswer: 'B',
        explanation: 'Mitochondria produce ATP through cellular respiration, providing energy for the cell.',
        difficulty: 'easy'
      },
      {
        question: 'What is the primary function of ribosomes?',
        options: ['A) Energy production', 'B) Protein synthesis', 'C) DNA storage', 'D) Waste removal'],
        correctAnswer: 'B',
        explanation: 'Ribosomes are the sites of protein synthesis, translating mRNA into amino acid chains.',
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'chem-001',
    subject: 'Chemistry',
    topic: 'Chemical Bonding',
    difficulty: 'intermediate',
    content: `Chemical bonds form when atoms share or transfer electrons. Ionic bonds involve electron transfer, covalent bonds involve electron sharing, and metallic bonds involve delocalized electrons.`,
    keyPoints: [
      'Ionic bonds form between metals and nonmetals',
      'Covalent bonds form between nonmetals',
      'Electronegativity difference determines bond type',
      'Polar covalent bonds have unequal electron sharing',
      'Lewis structures represent valence electrons',
      'VSEPR theory predicts molecular geometry'
    ],
    sampleQuestions: [
      {
        question: 'What type of bond forms between sodium and chlorine in NaCl?',
        options: ['A) Covalent', 'B) Ionic', 'C) Metallic', 'D) Hydrogen'],
        correctAnswer: 'B',
        explanation: 'Sodium (metal) transfers an electron to chlorine (nonmetal), forming an ionic bond.',
        difficulty: 'easy'
      },
      {
        question: 'Which factor determines whether a bond is polar or nonpolar?',
        options: ['A) Atomic mass', 'B) Electronegativity difference', 'C) Number of electrons', 'D) Atomic radius'],
        correctAnswer: 'B',
        explanation: 'Electronegativity difference between atoms determines bond polarity. Large differences create polar bonds.',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'phys-001',
    subject: 'Physics',
    topic: 'Newton\'s Laws of Motion',
    difficulty: 'beginner',
    content: `Newton's three laws describe the relationship between forces and motion. First law: objects at rest stay at rest unless acted upon. Second law: F = ma. Third law: every action has an equal and opposite reaction.`,
    keyPoints: [
      'First law: Law of Inertia',
      'Second law: F = ma (Force = mass × acceleration)',
      'Third law: Action-reaction pairs',
      'Net force determines acceleration',
      'Mass is resistance to acceleration',
      'Forces are vectors with magnitude and direction'
    ],
    sampleQuestions: [
      {
        question: 'According to Newton\'s second law, what happens to acceleration if force is doubled?',
        options: ['A) Halved', 'B) Doubled', 'C) Quadrupled', 'D) Unchanged'],
        correctAnswer: 'B',
        explanation: 'From F = ma, if force doubles and mass stays constant, acceleration doubles.',
        difficulty: 'medium'
      },
      {
        question: 'Which law explains why a book on a table doesn\'t fall through?',
        options: ['A) First law', 'B) Second law', 'C) Third law', 'D) Law of gravity'],
        correctAnswer: 'C',
        explanation: 'The table exerts an upward normal force equal to the book\'s weight (action-reaction pair).',
        difficulty: 'medium'
      }
    ]
  },
  {
    id: 'stat-001',
    subject: 'Statistics',
    topic: 'Probability Distributions',
    difficulty: 'intermediate',
    content: `Probability distributions describe how probabilities are distributed over values. Normal distribution is bell-shaped and symmetric. Binomial distribution models success/failure trials. Poisson distribution models rare events.`,
    keyPoints: [
      'Normal distribution: mean = median = mode',
      'Standard deviation measures spread',
      '68-95-99.7 rule for normal distribution',
      'Binomial: fixed trials, two outcomes',
      'Poisson: models count of rare events',
      'Central Limit Theorem: sample means approach normal'
    ],
    sampleQuestions: [
      {
        question: 'In a normal distribution, what percentage of data falls within one standard deviation of the mean?',
        options: ['A) 50%', 'B) 68%', 'C) 95%', 'D) 99.7%'],
        correctAnswer: 'B',
        explanation: 'The 68-95-99.7 rule states that 68% of data falls within ±1 standard deviation.',
        difficulty: 'medium'
      },
      {
        question: 'Which distribution is best for modeling coin flips?',
        options: ['A) Normal', 'B) Poisson', 'C) Binomial', 'D) Uniform'],
        correctAnswer: 'C',
        explanation: 'Binomial distribution models fixed trials with two outcomes (heads/tails).',
        difficulty: 'easy'
      }
    ]
  },
  {
    id: 'db-001',
    subject: 'Database Systems',
    topic: 'SQL and Relational Databases',
    difficulty: 'intermediate',
    content: `Relational databases organize data in tables with rows and columns. SQL (Structured Query Language) is used to query and manipulate data. Key concepts include primary keys, foreign keys, joins, and normalization.`,
    keyPoints: [
      'Primary key uniquely identifies each row',
      'Foreign key references another table\'s primary key',
      'INNER JOIN returns matching rows from both tables',
      'LEFT JOIN returns all rows from left table',
      'Normalization reduces data redundancy',
      'ACID properties ensure transaction reliability'
    ],
    sampleQuestions: [
      {
        question: 'What SQL command is used to retrieve data from a database?',
        options: ['A) INSERT', 'B) UPDATE', 'C) SELECT', 'D) DELETE'],
        correctAnswer: 'C',
        explanation: 'SELECT statement retrieves data from one or more tables in a database.',
        difficulty: 'easy'
      },
      {
        question: 'Which type of JOIN returns all rows from the left table even if no match exists?',
        options: ['A) INNER JOIN', 'B) LEFT JOIN', 'C) RIGHT JOIN', 'D) FULL JOIN'],
        correctAnswer: 'B',
        explanation: 'LEFT JOIN (or LEFT OUTER JOIN) returns all rows from the left table, with NULLs for non-matching right table rows.',
        difficulty: 'medium'
      }
    ]
  }
];

// Helper function to get materials by subject
export const getMaterialsBySubject = (subject: string): LearningMaterial[] => {
  return learningMaterials.filter(m => 
    m.subject.toLowerCase().includes(subject.toLowerCase())
  );
};

// Helper function to get materials by difficulty
export const getMaterialsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): LearningMaterial[] => {
  return learningMaterials.filter(m => m.difficulty === difficulty);
};

// Helper function to get random materials
export const getRandomMaterials = (count: number): LearningMaterial[] => {
  const shuffled = [...learningMaterials].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Helper function to search materials by topic
export const searchMaterialsByTopic = (searchTerm: string): LearningMaterial[] => {
  const term = searchTerm.toLowerCase();
  return learningMaterials.filter(m => 
    m.topic.toLowerCase().includes(term) ||
    m.subject.toLowerCase().includes(term) ||
    m.content.toLowerCase().includes(term)
  );
};
