/*
 * Seed data, generated from the original Postgres `seed.sql`.
 *
 * This is a faithful table dump: ids are the fixed UUIDs the SQL used, and
 * dates are still ISO strings. `seed.ts` maps these rows onto the Mongo
 * models (string `_id`, embedded likes / question_ids, real Date objects).
 */

export const topics = [
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Programming",
    "slug": "programming",
    "icon": "💻",
    "color": "#3b82f6",
    "description": "Learn programming languages, algorithms, and software development"
  },
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "name": "AI & Machine Learning",
    "slug": "ai-ml",
    "icon": "🤖",
    "color": "#8b5cf6",
    "description": "Explore artificial intelligence, neural networks, and data science"
  },
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "name": "Science",
    "slug": "science",
    "icon": "🔬",
    "color": "#10b981",
    "description": "Discover the wonders of physics, chemistry, biology, and beyond"
  },
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "name": "History",
    "slug": "history",
    "icon": "📜",
    "color": "#f59e0b",
    "description": "Journey through time and explore the events that shaped our world"
  },
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "name": "Geography",
    "slug": "geography",
    "icon": "🌍",
    "color": "#06b6d4",
    "description": "Explore countries, capitals, landscapes, and cultures around the globe"
  },
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "name": "Business",
    "slug": "business",
    "icon": "📊",
    "color": "#ec4899",
    "description": "Learn about entrepreneurship, finance, marketing, and management"
  },
  {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "name": "General Knowledge",
    "slug": "general-knowledge",
    "icon": "🧠",
    "color": "#6366f1",
    "description": "A bit of everything - test your knowledge across all domains"
  }
];

export const concepts = [
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "JavaScript Fundamentals",
    "slug": "javascript-fundamentals",
    "description": "Core JavaScript language concepts"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Python Basics",
    "slug": "python-basics",
    "description": "Introduction to Python programming"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Data Structures",
    "slug": "data-structures",
    "description": "Arrays, linked lists, trees, graphs, and more"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Web Development",
    "slug": "web-development",
    "description": "HTML, CSS, and modern web frameworks"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "name": "Neural Networks",
    "slug": "neural-networks",
    "description": "Fundamentals of artificial neural networks"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "name": "Machine Learning Basics",
    "slug": "ml-basics",
    "description": "Supervised, unsupervised, and reinforcement learning"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "name": "Natural Language Processing",
    "slug": "nlp",
    "description": "Computational processing of human language"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "name": "Physics",
    "slug": "physics",
    "description": "Motion, energy, forces, and the laws of the universe"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "name": "Chemistry",
    "slug": "chemistry",
    "description": "Atoms, molecules, reactions, and the periodic table"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "name": "Biology",
    "slug": "biology",
    "description": "Living organisms, cells, genetics, and ecosystems"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "name": "Ancient Civilizations",
    "slug": "ancient-civilizations",
    "description": "Egypt, Greece, Rome, Mesopotamia, and more"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "name": "World Wars",
    "slug": "world-wars",
    "description": "Causes, events, and consequences of WWI and WWII"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "name": "Modern History",
    "slug": "modern-history",
    "description": "Post-war era to the present day"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "name": "World Capitals",
    "slug": "world-capitals",
    "description": "Capital cities of countries around the world"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "name": "Physical Geography",
    "slug": "physical-geography",
    "description": "Landforms, climate, oceans, and natural features"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "name": "Countries & Cultures",
    "slug": "countries-cultures",
    "description": "Nations, languages, traditions, and customs"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "name": "Entrepreneurship",
    "slug": "entrepreneurship",
    "description": "Starting and growing a business"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "name": "Finance & Investing",
    "slug": "finance-investing",
    "description": "Personal finance, stocks, and investment strategies"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "name": "Marketing",
    "slug": "marketing",
    "description": "Branding, digital marketing, and consumer behavior"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "name": "Sports",
    "slug": "sports",
    "description": "Athletic events, rules, and famous athletes"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "name": "Arts & Literature",
    "slug": "arts-literature",
    "description": "Famous works, artists, and literary movements"
  },
  {
    "id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "name": "Technology",
    "slug": "technology",
    "description": "Gadgets, innovations, and tech history"
  }
];

export const questions = [
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question": "What is the output of typeof null in JavaScript?",
    "options": [
      "null",
      "undefined",
      "object",
      "number"
    ],
    "correct_answer": 2,
    "explanation": "In JavaScript, typeof null returns \"object\". This is a well-known bug in the language that has been kept for backward compatibility.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question": "Which method adds an element to the end of an array?",
    "options": [
      "shift()",
      "unshift()",
      "push()",
      "pop()"
    ],
    "correct_answer": 2,
    "explanation": "push() adds an element to the end of an array. unshift() adds to the beginning, pop() removes from the end, and shift() removes from the beginning.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question": "What does the \"===\" operator do in JavaScript?",
    "options": [
      "Assigns a value",
      "Compares value only",
      "Compares value and type",
      "None of the above"
    ],
    "correct_answer": 2,
    "explanation": "The strict equality operator (===) compares both value and type without type coercion, unlike == which performs type coercion.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question": "What is a closure in JavaScript?",
    "options": [
      "A function that has access to its outer scope",
      "A way to close the browser",
      "A type of loop",
      "A method to end a program"
    ],
    "correct_answer": 0,
    "explanation": "A closure is a function that remembers and can access variables from its outer (enclosing) scope even after the outer function has returned.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question": "Which keyword declares a block-scoped variable in JavaScript?",
    "options": [
      "var",
      "let",
      "function",
      "global"
    ],
    "correct_answer": 1,
    "explanation": "let declares a block-scoped variable. var is function-scoped, and const is also block-scoped but cannot be reassigned.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question": "What is the correct way to create a list in Python?",
    "options": [
      "list = (1, 2, 3)",
      "list = [1, 2, 3]",
      "list = {1, 2, 3}",
      "list = <1, 2, 3>"
    ],
    "correct_answer": 1,
    "explanation": "Lists in Python are created using square brackets []. Parentheses create tuples, curly braces create sets or dictionaries.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question": "What does the len() function do in Python?",
    "options": [
      "Returns the length of an object",
      "Creates a new list",
      "Sorts a list",
      "Converts to lowercase"
    ],
    "correct_answer": 0,
    "explanation": "len() returns the number of items in an object, such as the length of a string, list, tuple, or dictionary.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question": "Which of the following is a mutable data type in Python?",
    "options": [
      "tuple",
      "string",
      "list",
      "int"
    ],
    "correct_answer": 2,
    "explanation": "Lists are mutable (can be modified after creation), while tuples, strings, and integers are immutable.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question": "What is a decorator in Python?",
    "options": [
      "A design pattern for UI",
      "A function that modifies another function",
      "A type of class",
      "A built-in module"
    ],
    "correct_answer": 1,
    "explanation": "A decorator is a function that takes another function and extends its behavior without explicitly modifying it.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question": "What is the output of 3 * \"ab\" in Python?",
    "options": [
      "ababab",
      "3ab",
      "ab3",
      "Error"
    ],
    "correct_answer": 0,
    "explanation": "In Python, multiplying a string by an integer repeats the string that many times. So 3 * \"ab\" = \"ababab\".",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question": "What is the time complexity of binary search?",
    "options": [
      "O(n)",
      "O(log n)",
      "O(n²)",
      "O(1)"
    ],
    "correct_answer": 1,
    "explanation": "Binary search has O(log n) time complexity because it halves the search space with each comparison.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question": "Which data structure uses FIFO (First In, First Out)?",
    "options": [
      "Stack",
      "Queue",
      "Tree",
      "Graph"
    ],
    "correct_answer": 1,
    "explanation": "A queue follows FIFO - the first element added is the first one removed. A stack follows LIFO (Last In, First Out).",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question": "What is the worst-case time complexity of quicksort?",
    "options": [
      "O(n log n)",
      "O(n)",
      "O(n²)",
      "O(log n)"
    ],
    "correct_answer": 2,
    "explanation": "Quicksort has O(n²) worst-case time complexity when the pivot selection is poor (e.g., already sorted array), though average case is O(n log n).",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question": "Which data structure is best for implementing a priority queue?",
    "options": [
      "Array",
      "Linked List",
      "Heap",
      "Stack"
    ],
    "correct_answer": 2,
    "explanation": "A heap (specifically a binary heap) is the most efficient data structure for implementing a priority queue, with O(log n) insertion and extraction.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question": "What is a hash table?",
    "options": [
      "A table of hashes",
      "A data structure that maps keys to values",
      "A sorted array",
      "A type of linked list"
    ],
    "correct_answer": 1,
    "explanation": "A hash table is a data structure that implements an associative array, mapping keys to values using a hash function for efficient lookup.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question": "What is an artificial neuron?",
    "options": [
      "A biological brain cell",
      "A mathematical function that processes inputs",
      "A type of computer chip",
      "A data storage unit"
    ],
    "correct_answer": 1,
    "explanation": "An artificial neuron is a mathematical function that receives one or more inputs, applies weights and an activation function, and produces an output.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question": "What is backpropagation?",
    "options": [
      "A forward pass through the network",
      "An algorithm to calculate gradients for weight updates",
      "A type of neural network",
      "A data preprocessing technique"
    ],
    "correct_answer": 1,
    "explanation": "Backpropagation is an algorithm that calculates the gradient of the loss function with respect to each weight by applying the chain rule, enabling weight updates during training.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question": "What is the purpose of an activation function?",
    "options": [
      "To normalize data",
      "To introduce non-linearity",
      "To reduce overfitting",
      "To speed up training"
    ],
    "correct_answer": 1,
    "explanation": "Activation functions introduce non-linearity into the network, allowing it to learn complex patterns. Without them, a neural network would just be a linear model.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question": "Which activation function outputs values between 0 and 1?",
    "options": [
      "ReLU",
      "Sigmoid",
      "Tanh",
      "Leaky ReLU"
    ],
    "correct_answer": 1,
    "explanation": "The sigmoid function outputs values between 0 and 1, making it useful for binary classification. Tanh outputs between -1 and 1, while ReLU outputs from 0 to infinity.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question": "What is overfitting in machine learning?",
    "options": [
      "When the model performs well on training data but poorly on new data",
      "When the model is too simple",
      "When training takes too long",
      "When the model has too few parameters"
    ],
    "correct_answer": 0,
    "explanation": "Overfitting occurs when a model learns the training data too well, including its noise and outliers, resulting in poor generalization to new, unseen data.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "question": "What is supervised learning?",
    "options": [
      "Learning without labels",
      "Learning with labeled data",
      "Learning from rewards",
      "Learning without data"
    ],
    "correct_answer": 1,
    "explanation": "Supervised learning is a type of machine learning where the model is trained on labeled data, learning to map inputs to known outputs.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "question": "What is the difference between classification and regression?",
    "options": [
      "No difference",
      "Classification predicts categories, regression predicts continuous values",
      "Regression predicts categories, classification predicts numbers",
      "They are the same"
    ],
    "correct_answer": 1,
    "explanation": "Classification predicts discrete categories (e.g., spam/not spam), while regression predicts continuous numerical values (e.g., house prices).",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "question": "What is a training set?",
    "options": [
      "A set of test data",
      "Data used to train the model",
      "A set of validation data",
      "Data used to evaluate the model"
    ],
    "correct_answer": 1,
    "explanation": "The training set is the portion of data used to train the machine learning model. It is separate from validation and test sets.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "question": "What is feature engineering?",
    "options": [
      "Building physical features",
      "Creating input variables from raw data",
      "Designing neural networks",
      "Writing code"
    ],
    "correct_answer": 1,
    "explanation": "Feature engineering is the process of creating meaningful input features from raw data to improve model performance.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "question": "What is cross-validation?",
    "options": [
      "Validating across different models",
      "Splitting data into multiple folds for robust evaluation",
      "Training on multiple GPUs",
      "Comparing different algorithms"
    ],
    "correct_answer": 1,
    "explanation": "Cross-validation is a technique where data is split into multiple folds, and the model is trained and validated multiple times on different folds for more robust evaluation.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "question": "What is the speed of light in a vacuum?",
    "options": [
      "300,000 km/s",
      "150,000 km/s",
      "500,000 km/s",
      "1,000,000 km/s"
    ],
    "correct_answer": 0,
    "explanation": "The speed of light in a vacuum is approximately 299,792 km/s, commonly rounded to 300,000 km/s.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "question": "What is Newton's second law of motion?",
    "options": [
      "F = ma",
      "E = mc²",
      "V = IR",
      "P = IV"
    ],
    "correct_answer": 0,
    "explanation": "Newton's second law states that Force equals mass times acceleration (F = ma).",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "question": "What is the unit of force?",
    "options": [
      "Joule",
      "Watt",
      "Newton",
      "Pascal"
    ],
    "correct_answer": 2,
    "explanation": "The Newton (N) is the SI unit of force, defined as the force needed to accelerate 1 kg by 1 m/s².",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "question": "What is the law of conservation of energy?",
    "options": [
      "Energy cannot be created or destroyed",
      "Energy always increases",
      "Energy is always lost",
      "Energy can be created from nothing"
    ],
    "correct_answer": 0,
    "explanation": "The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "question": "What is the acceleration due to gravity on Earth?",
    "options": [
      "9.8 m/s²",
      "8.9 m/s²",
      "10.8 m/s²",
      "7.6 m/s²"
    ],
    "correct_answer": 0,
    "explanation": "The standard acceleration due to gravity on Earth is approximately 9.8 m/s².",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "question": "What is the chemical symbol for gold?",
    "options": [
      "Go",
      "Gd",
      "Au",
      "Ag"
    ],
    "correct_answer": 2,
    "explanation": "The chemical symbol for gold is Au, from the Latin word \"aurum\". Ag is silver (argentum).",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "question": "What is the pH of pure water?",
    "options": [
      "0",
      "7",
      "14",
      "1"
    ],
    "correct_answer": 1,
    "explanation": "Pure water has a pH of 7, which is considered neutral. Below 7 is acidic, above 7 is basic (alkaline).",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "question": "What is the most abundant gas in Earth's atmosphere?",
    "options": [
      "Oxygen",
      "Carbon Dioxide",
      "Nitrogen",
      "Hydrogen"
    ],
    "correct_answer": 2,
    "explanation": "Nitrogen makes up about 78% of Earth's atmosphere, while oxygen is about 21%.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "question": "What is the atomic number of carbon?",
    "options": [
      "4",
      "6",
      "8",
      "12"
    ],
    "correct_answer": 1,
    "explanation": "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "question": "What type of bond involves the sharing of electrons?",
    "options": [
      "Ionic bond",
      "Covalent bond",
      "Metallic bond",
      "Hydrogen bond"
    ],
    "correct_answer": 1,
    "explanation": "A covalent bond involves the sharing of electron pairs between atoms. Ionic bonds involve the transfer of electrons.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "question": "What is the powerhouse of the cell?",
    "options": [
      "Nucleus",
      "Ribosome",
      "Mitochondria",
      "Golgi apparatus"
    ],
    "correct_answer": 2,
    "explanation": "Mitochondria are known as the powerhouse of the cell because they produce ATP, the cell's main energy currency.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "question": "What is DNA?",
    "options": [
      "A protein",
      "A type of fat",
      "Deoxyribonucleic acid - carries genetic information",
      "A carbohydrate"
    ],
    "correct_answer": 2,
    "explanation": "DNA (Deoxyribonucleic acid) is the molecule that carries genetic instructions for the development, functioning, and reproduction of all known organisms.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a38",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "question": "What is photosynthesis?",
    "options": [
      "The process of breathing",
      "Converting light energy into chemical energy",
      "Cell division",
      "Protein synthesis"
    ],
    "correct_answer": 1,
    "explanation": "Photosynthesis is the process by which green plants convert light energy into chemical energy stored in glucose, using CO₂ and water.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a39",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "question": "How many chromosomes do humans have?",
    "options": [
      "23",
      "46",
      "44",
      "48"
    ],
    "correct_answer": 1,
    "explanation": "Humans have 46 chromosomes (23 pairs) in each cell, except for gametes which have 23.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "question": "What is the largest organ in the human body?",
    "options": [
      "Heart",
      "Liver",
      "Skin",
      "Brain"
    ],
    "correct_answer": 2,
    "explanation": "The skin is the largest organ in the human body, covering about 20 square feet in adults.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "question": "Which civilization built the pyramids of Giza?",
    "options": [
      "Roman",
      "Greek",
      "Egyptian",
      "Mayan"
    ],
    "correct_answer": 2,
    "explanation": "The pyramids of Giza were built by the ancient Egyptians around 4,500 years ago as tombs for pharaohs.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "question": "What was the primary writing system of ancient Mesopotamia?",
    "options": [
      "Hieroglyphics",
      "Cuneiform",
      "Sanskrit",
      "Latin"
    ],
    "correct_answer": 1,
    "explanation": "Cuneiform was the writing system used in ancient Mesopotamia, consisting of wedge-shaped marks on clay tablets.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "question": "Who was the first Roman Emperor?",
    "options": [
      "Julius Caesar",
      "Augustus",
      "Nero",
      "Constantine"
    ],
    "correct_answer": 1,
    "explanation": "Augustus (formerly Octavian) became the first Roman Emperor in 27 BC after defeating Mark Antony.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "question": "The ancient Olympic Games originated in which country?",
    "options": [
      "Rome",
      "Egypt",
      "Greece",
      "Babylon"
    ],
    "correct_answer": 2,
    "explanation": "The ancient Olympic Games were held in Olympia, Greece, starting in 776 BC as a religious and athletic festival.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "question": "What was the Code of Hammurabi?",
    "options": [
      "A set of laws",
      "A religious text",
      "A military strategy",
      "A trade agreement"
    ],
    "correct_answer": 0,
    "explanation": "The Code of Hammurabi was one of the earliest and most complete written legal codes, created by the Babylonian king Hammurabi around 1754 BC.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "question": "In which year did World War I begin?",
    "options": [
      "1912",
      "1914",
      "1916",
      "1918"
    ],
    "correct_answer": 1,
    "explanation": "World War I began in 1914 after the assassination of Archduke Franz Ferdinand of Austria.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "question": "What event triggered the United States entry into World War II?",
    "options": [
      "Invasion of Poland",
      "Attack on Pearl Harbor",
      "Battle of Britain",
      "D-Day"
    ],
    "correct_answer": 1,
    "explanation": "The attack on Pearl Harbor by Japan on December 7, 1941, led to the United States entering World War II.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "question": "Which battle is considered the turning point on the Eastern Front in WWII?",
    "options": [
      "Battle of Britain",
      "Battle of Stalingrad",
      "Battle of Midway",
      "Battle of the Bulge"
    ],
    "correct_answer": 1,
    "explanation": "The Battle of Stalingrad (1942-1943) is considered the turning point on the Eastern Front, where the Soviet Union defeated Nazi Germany.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a49",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "question": "What was the D-Day invasion?",
    "options": [
      "The invasion of Normandy",
      "The invasion of Italy",
      "The invasion of Japan",
      "The invasion of North Africa"
    ],
    "correct_answer": 0,
    "explanation": "D-Day (June 6, 1944) was the Allied invasion of Normandy, France, which began the liberation of Western Europe from Nazi control.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "question": "Which treaty ended World War I?",
    "options": [
      "Treaty of Versailles",
      "Treaty of Paris",
      "Treaty of Vienna",
      "Treaty of Westphalia"
    ],
    "correct_answer": 0,
    "explanation": "The Treaty of Versailles, signed in 1919, officially ended World War I between Germany and the Allied Powers.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "question": "What is the capital of Japan?",
    "options": [
      "Seoul",
      "Beijing",
      "Tokyo",
      "Bangkok"
    ],
    "correct_answer": 2,
    "explanation": "Tokyo is the capital of Japan and one of the largest metropolitan areas in the world.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "question": "What is the capital of Australia?",
    "options": [
      "Sydney",
      "Melbourne",
      "Canberra",
      "Perth"
    ],
    "correct_answer": 2,
    "explanation": "Canberra is the capital of Australia, not Sydney or Melbourne as many people assume.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "question": "What is the capital of Canada?",
    "options": [
      "Toronto",
      "Vancouver",
      "Ottawa",
      "Montreal"
    ],
    "correct_answer": 2,
    "explanation": "Ottawa is the capital of Canada, located in the province of Ontario.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "question": "What is the capital of Brazil?",
    "options": [
      "Rio de Janeiro",
      "São Paulo",
      "Brasília",
      "Salvador"
    ],
    "correct_answer": 2,
    "explanation": "Brasília has been the capital of Brazil since 1960, replacing Rio de Janeiro.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "question": "What is the capital of Egypt?",
    "options": [
      "Alexandria",
      "Cairo",
      "Luxor",
      "Giza"
    ],
    "correct_answer": 1,
    "explanation": "Cairo is the capital of Egypt and the largest city in the Arab world.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a56",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "question": "What is the longest river in the world?",
    "options": [
      "Amazon",
      "Nile",
      "Yangtze",
      "Mississippi"
    ],
    "correct_answer": 1,
    "explanation": "The Nile River in Africa is traditionally considered the longest at about 6,650 km, though some studies suggest the Amazon may be longer.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a57",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "question": "What is the largest desert in the world?",
    "options": [
      "Sahara",
      "Gobi",
      "Antarctic Desert",
      "Arabian Desert"
    ],
    "correct_answer": 2,
    "explanation": "The Antarctic Desert is the largest desert in the world, covering about 14.2 million km². Deserts are defined by low precipitation, not heat.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a58",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "question": "What is the highest mountain in the world?",
    "options": [
      "K2",
      "Mount Everest",
      "Kangchenjunga",
      "Lhotse"
    ],
    "correct_answer": 1,
    "explanation": "Mount Everest is the highest mountain above sea level at 8,849 meters (29,032 ft).",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a59",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "question": "What is the deepest ocean trench?",
    "options": [
      "Mariana Trench",
      "Tonga Trench",
      "Java Trench",
      "Puerto Rico Trench"
    ],
    "correct_answer": 0,
    "explanation": "The Mariana Trench in the Pacific Ocean is the deepest part of the world's oceans, reaching about 10,994 meters at its deepest point (Challenger Deep).",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "question": "Which is the largest ocean on Earth?",
    "options": [
      "Atlantic",
      "Indian",
      "Arctic",
      "Pacific"
    ],
    "correct_answer": 3,
    "explanation": "The Pacific Ocean is the largest and deepest ocean, covering about 63 million square miles - larger than all land area combined.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "question": "What is a startup?",
    "options": [
      "A small business",
      "A newly established business seeking to grow",
      "A government agency",
      "A non-profit organization"
    ],
    "correct_answer": 1,
    "explanation": "A startup is a newly established business, typically in its early stages, focused on developing a unique product or service with high growth potential.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "question": "What is a business plan?",
    "options": [
      "A financial report",
      "A document outlining business goals and strategies",
      "A marketing campaign",
      "An employee handbook"
    ],
    "correct_answer": 1,
    "explanation": "A business plan is a formal document that outlines a business's goals, strategies, target market, and financial projections.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a63",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "question": "What is an MVP in startup terminology?",
    "options": [
      "Most Valuable Player",
      "Minimum Viable Product",
      "Maximum Value Proposition",
      "Most Valuable Product"
    ],
    "correct_answer": 1,
    "explanation": "MVP (Minimum Viable Product) is the simplest version of a product that can be released to test a business hypothesis with minimal resources.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a64",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "question": "What is a pitch deck?",
    "options": [
      "A presentation for investors",
      "A type of board game",
      "A marketing tool",
      "A financial statement"
    ],
    "correct_answer": 0,
    "explanation": "A pitch deck is a presentation used by startups to pitch their business idea to potential investors, typically including the problem, solution, market, and team.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a65",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "question": "What is bootstrapping?",
    "options": [
      "Raising venture capital",
      "Funding a business with personal finances or revenue",
      "Selling company shares",
      "Taking out bank loans"
    ],
    "correct_answer": 1,
    "explanation": "Bootstrapping means starting and growing a business using only personal finances or the company's own revenue, without external investment.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "question": "What is compound interest?",
    "options": [
      "Interest on principal only",
      "Interest calculated on principal plus accumulated interest",
      "A fixed interest rate",
      "Interest paid monthly"
    ],
    "correct_answer": 1,
    "explanation": "Compound interest is interest calculated on the initial principal plus all previously accumulated interest, leading to exponential growth.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a67",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "question": "What is diversification in investing?",
    "options": [
      "Investing in one stock",
      "Spreading investments across different assets",
      "Selling all investments",
      "Investing only in bonds"
    ],
    "correct_answer": 1,
    "explanation": "Diversification is a risk management strategy that spreads investments across various asset classes, sectors, and geographies to reduce exposure to any single asset.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a68",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "question": "What is a stock?",
    "options": [
      "A loan to a company",
      "A share of ownership in a company",
      "A type of bond",
      "A savings account"
    ],
    "correct_answer": 1,
    "explanation": "A stock represents a share of ownership in a company. Stockholders may receive dividends and have voting rights.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a69",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "question": "What is the S&P 500?",
    "options": [
      "A type of bond",
      "A stock market index of 500 large US companies",
      "A bank",
      "A government agency"
    ],
    "correct_answer": 1,
    "explanation": "The S&P 500 is a stock market index that tracks the performance of 500 of the largest publicly traded companies in the United States.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a70",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18",
    "question": "What is inflation?",
    "options": [
      "Decrease in prices",
      "Increase in the general price level over time",
      "A type of tax",
      "A stock market crash"
    ],
    "correct_answer": 1,
    "explanation": "Inflation is the rate at which the general level of prices for goods and services rises over time, reducing purchasing power.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "question": "How many players are on a soccer team on the field?",
    "options": [
      "9",
      "10",
      "11",
      "12"
    ],
    "correct_answer": 2,
    "explanation": "Each soccer team has 11 players on the field, including the goalkeeper.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a72",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "question": "In which sport would you perform a slam dunk?",
    "options": [
      "Volleyball",
      "Basketball",
      "Tennis",
      "Badminton"
    ],
    "correct_answer": 1,
    "explanation": "A slam dunk is a basketball move where a player jumps and scores by putting the ball directly through the hoop.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a73",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "question": "How often are the Summer Olympic Games held?",
    "options": [
      "Every 2 years",
      "Every 3 years",
      "Every 4 years",
      "Every 5 years"
    ],
    "correct_answer": 2,
    "explanation": "The Summer Olympic Games are held every 4 years, with the Winter Olympics also held every 4 years but staggered by 2 years.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a74",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "question": "What is the maximum break in snooker?",
    "options": [
      "100",
      "147",
      "155",
      "180"
    ],
    "correct_answer": 1,
    "explanation": "The maximum break in snooker is 147, achieved by potting all 15 reds with 15 blacks followed by all the colors.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a75",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20",
    "question": "Which country has won the most FIFA World Cups?",
    "options": [
      "Germany",
      "Argentina",
      "Brazil",
      "Italy"
    ],
    "correct_answer": 2,
    "explanation": "Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, 2002), more than any other nation.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a76",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "question": "Who wrote \"Romeo and Juliet\"?",
    "options": [
      "Charles Dickens",
      "William Shakespeare",
      "Jane Austen",
      "Mark Twain"
    ],
    "correct_answer": 1,
    "explanation": "William Shakespeare wrote Romeo and Juliet around 1595. It is one of his most famous tragedies.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "question": "Who painted the Mona Lisa?",
    "options": [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Claude Monet"
    ],
    "correct_answer": 2,
    "explanation": "Leonardo da Vinci painted the Mona Lisa in the early 16th century. It is now housed in the Louvre Museum in Paris.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a78",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "question": "What is the best-selling novel of all time?",
    "options": [
      "Harry Potter",
      "Don Quixote",
      "A Tale of Two Cities",
      "The Lord of the Rings"
    ],
    "correct_answer": 1,
    "explanation": "Don Quixote by Miguel de Cervantes is considered the best-selling novel of all time, with over 500 million copies sold.",
    "difficulty": "hard"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a79",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "question": "Who wrote \"1984\"?",
    "options": [
      "Aldous Huxley",
      "George Orwell",
      "Ray Bradbury",
      "Franz Kafka"
    ],
    "correct_answer": 1,
    "explanation": "George Orwell (Eric Arthur Blair) wrote 1984, published in 1949. It is a dystopian novel about totalitarianism.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a80",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21",
    "question": "Which artist cut off part of his own ear?",
    "options": [
      "Pablo Picasso",
      "Vincent van Gogh",
      "Salvador Dalí",
      "Claude Monet"
    ],
    "correct_answer": 1,
    "explanation": "Vincent van Gogh cut off part of his left ear in 1888 during a period of mental illness. He painted several self-portraits with the bandaged ear.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a81",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "question": "What does \"HTTP\" stand for?",
    "options": [
      "HyperText Transfer Protocol",
      "High Tech Transfer Protocol",
      "HyperText Transmission Program",
      "High Transfer Text Protocol"
    ],
    "correct_answer": 0,
    "explanation": "HTTP stands for HyperText Transfer Protocol, the foundation of data communication on the World Wide Web.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a82",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "question": "Who is credited with inventing the World Wide Web?",
    "options": [
      "Bill Gates",
      "Steve Jobs",
      "Tim Berners-Lee",
      "Vint Cerf"
    ],
    "correct_answer": 2,
    "explanation": "Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He also created the first web browser and web server.",
    "difficulty": "medium"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a83",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "question": "What year was the first iPhone released?",
    "options": [
      "2005",
      "2006",
      "2007",
      "2008"
    ],
    "correct_answer": 2,
    "explanation": "The first iPhone was released on June 29, 2007, revolutionizing the smartphone industry.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a84",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "question": "What does \"AI\" stand for?",
    "options": [
      "Automated Intelligence",
      "Artificial Intelligence",
      "Advanced Internet",
      "Augmented Interaction"
    ],
    "correct_answer": 1,
    "explanation": "AI stands for Artificial Intelligence - the simulation of human intelligence by machines.",
    "difficulty": "easy"
  },
  {
    "id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a85",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "concept_id": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    "question": "What was the first programmable computer?",
    "options": [
      "ENIAC",
      "Colossus",
      "Z3",
      "UNIVAC"
    ],
    "correct_answer": 2,
    "explanation": "The Z3, built by Konrad Zuse in 1941, is considered the first programmable, fully automatic digital computer.",
    "difficulty": "hard"
  }
];

export const users = [
  {
    "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "username": "alex_codes",
    "email": "alex@brainsnack.com",
    "password_hash": "$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2",
    "display_name": "Alex Chen",
    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    "xp": 2450,
    "level": 8,
    "streak": 12,
    "last_active": "2026-10-02",
    "personal_best": 95,
    "created_at": "2025-01-15T10:00:00Z"
  },
  {
    "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "username": "sarah_learns",
    "email": "sarah@brainsnack.com",
    "password_hash": "$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2",
    "display_name": "Sarah Johnson",
    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    "xp": 1820,
    "level": 6,
    "streak": 7,
    "last_active": "2026-10-03",
    "personal_best": 88,
    "created_at": "2025-02-20T14:30:00Z"
  },
  {
    "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "username": "mike_quiz",
    "email": "mike@brainsnack.com",
    "password_hash": "$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2",
    "display_name": "Mike Rodriguez",
    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
    "xp": 3100,
    "level": 10,
    "streak": 21,
    "last_active": "2026-10-03",
    "personal_best": 100,
    "created_at": "2024-11-05T09:15:00Z"
  },
  {
    "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "username": "emma_brain",
    "email": "emma@brainsnack.com",
    "password_hash": "$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2",
    "display_name": "Emma Wilson",
    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    "xp": 980,
    "level": 4,
    "streak": 3,
    "last_active": "2026-10-01",
    "personal_best": 72,
    "created_at": "2025-06-10T16:45:00Z"
  },
  {
    "id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "username": "david_tech",
    "email": "david@brainsnack.com",
    "password_hash": "$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2",
    "display_name": "David Kim",
    "avatar_url": "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    "xp": 4200,
    "level": 12,
    "streak": 35,
    "last_active": "2026-10-03",
    "personal_best": 100,
    "created_at": "2024-08-22T11:00:00Z"
  }
];

export const streaks = [
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "current_streak": 12,
    "longest_streak": 15,
    "last_activity_date": "2026-10-02"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "current_streak": 7,
    "longest_streak": 10,
    "last_activity_date": "2026-10-03"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "current_streak": 21,
    "longest_streak": 28,
    "last_activity_date": "2026-10-03"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "current_streak": 3,
    "longest_streak": 8,
    "last_activity_date": "2026-10-01"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "current_streak": 35,
    "longest_streak": 42,
    "last_activity_date": "2026-10-03"
  }
];

export const badges = [
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "name": "First Steps",
    "slug": "first-steps",
    "description": "Complete your first quiz",
    "icon": "🎯",
    "criteria_type": "quiz_count",
    "criteria_value": 1
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "name": "Quiz Master",
    "slug": "quiz-master",
    "description": "Complete 10 quizzes",
    "icon": "📝",
    "criteria_type": "quiz_count",
    "criteria_value": 10
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "name": "Perfect Score",
    "slug": "perfect-score",
    "description": "Get 100% on any quiz",
    "icon": "💯",
    "criteria_type": "perfect_score",
    "criteria_value": 100
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "name": "Streak Starter",
    "slug": "streak-starter",
    "description": "Maintain a 3-day streak",
    "icon": "🔥",
    "criteria_type": "streak",
    "criteria_value": 3
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "name": "Week Warrior",
    "slug": "week-warrior",
    "description": "Maintain a 7-day streak",
    "icon": "⚡",
    "criteria_type": "streak",
    "criteria_value": 7
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "name": "Unstoppable",
    "slug": "unstoppable",
    "description": "Maintain a 30-day streak",
    "icon": "🚀",
    "criteria_type": "streak",
    "criteria_value": 30
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "name": "XP Hunter",
    "slug": "xp-hunter",
    "description": "Earn 1,000 XP",
    "icon": "⭐",
    "criteria_type": "xp",
    "criteria_value": 1000
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "name": "XP Champion",
    "slug": "xp-champion",
    "description": "Earn 5,000 XP",
    "icon": "🏆",
    "criteria_type": "xp",
    "criteria_value": 5000
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "name": "Level 5",
    "slug": "level-5",
    "description": "Reach level 5",
    "icon": "🎖️",
    "criteria_type": "level",
    "criteria_value": 5
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "name": "Level 10",
    "slug": "level-10",
    "description": "Reach level 10",
    "icon": "👑",
    "criteria_type": "level",
    "criteria_value": 10
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "name": "Topic Master",
    "slug": "topic-master",
    "description": "Achieve 90% mastery in any topic",
    "icon": "🧠",
    "criteria_type": "topic_mastery",
    "criteria_value": 90
  },
  {
    "id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "name": "Knowledge Seeker",
    "slug": "knowledge-seeker",
    "description": "Complete quizzes in 5 different topics",
    "icon": "📚",
    "criteria_type": "quiz_count",
    "criteria_value": 25
  }
];

export const userBadges = [
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "earned_at": "2025-01-15T10:30:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "earned_at": "2025-03-20T14:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "earned_at": "2025-02-10T09:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "earned_at": "2025-04-05T16:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "earned_at": "2025-05-12T11:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "earned_at": "2025-06-01T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "earned_at": "2025-02-20T15:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "earned_at": "2025-03-15T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "earned_at": "2025-07-20T14:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "earned_at": "2024-11-05T09:30:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "earned_at": "2024-12-10T11:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "earned_at": "2025-01-20T16:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "earned_at": "2024-12-01T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "earned_at": "2025-01-15T09:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "earned_at": "2025-02-28T14:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "earned_at": "2025-04-10T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "earned_at": "2025-08-15T11:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "earned_at": "2025-06-20T15:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "earned_at": "2025-06-10T17:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "earned_at": "2025-07-01T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "earned_at": "2024-08-22T11:30:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "earned_at": "2024-09-15T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "earned_at": "2024-10-01T14:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "earned_at": "2024-09-20T09:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "earned_at": "2024-10-15T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "earned_at": "2025-01-10T11:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "earned_at": "2024-11-20T14:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "earned_at": "2025-03-15T10:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09",
    "earned_at": "2024-12-01T09:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10",
    "earned_at": "2025-02-20T11:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "badge_id": "e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "earned_at": "2025-01-05T15:00:00Z"
  }
];

export const follows = [
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2025-02-01T10:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2025-02-15T14:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2025-03-01T09:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2025-03-10T11:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2024-12-01T10:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2025-06-15T16:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "created_at": "2025-06-20T10:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2025-07-01T14:00:00Z"
  },
  {
    "follower_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "followee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2024-09-01T11:00:00Z"
  }
];

export const posts = [
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "type": "achievement",
    "content": {
      "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      "score": 80,
      "topic": "Programming",
      "xp_earned": 130
    },
    "caption": "Scored 80% on the Programming quiz! Feeling the burn 🔥",
    "created_at": "2026-10-02T15:30:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "type": "streak",
    "content": {
      "streak_days": 21,
      "topic": "AI & ML"
    },
    "caption": "21-day streak! Consistency is key 💪",
    "created_at": "2026-10-03T08:00:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "type": "badge",
    "content": {
      "badge_name": "Unstoppable",
      "badge_icon": "🚀"
    },
    "caption": "Just earned the Unstoppable badge! 30-day streak complete!",
    "created_at": "2026-10-01T20:00:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "type": "achievement",
    "content": {
      "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
      "score": 80,
      "topic": "Science",
      "xp_earned": 130
    },
    "caption": "Science quiz done! 80% - getting better every time 🧪",
    "created_at": "2026-10-03T12:00:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "type": "general",
    "content": {
      "message": "Just joined BrainSnack!"
    },
    "caption": "Excited to start my learning journey! Any tips for beginners? 🎓",
    "created_at": "2026-10-01T10:00:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "type": "challenge",
    "content": {
      "challenge_id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
      "opponent": "David Kim",
      "result": "won",
      "score": 92
    },
    "caption": "Just beat David in a Programming challenge! 92% vs 85% 🏆",
    "created_at": "2026-10-02T18:00:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "type": "achievement",
    "content": {
      "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
      "score": 100,
      "topic": "History",
      "xp_earned": 300
    },
    "caption": "PERFECT SCORE on History! 100%! All that reading paid off 📚✨",
    "created_at": "2026-10-03T09:30:00Z"
  },
  {
    "id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "type": "badge",
    "content": {
      "badge_name": "Week Warrior",
      "badge_icon": "⚡"
    },
    "caption": "Week Warrior badge unlocked! 7-day streak ⚡",
    "created_at": "2026-09-28T14:00:00Z"
  }
];

export const postLikes = [
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "created_at": "2026-10-02T16:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2026-10-02T16:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2026-10-02T17:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-03T08:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "created_at": "2026-10-03T09:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2026-10-03T09:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-01T20:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "created_at": "2026-10-01T21:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2026-10-01T21:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "created_at": "2026-10-02T08:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-03T12:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2026-10-03T13:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-02T18:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "created_at": "2026-10-02T19:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2026-10-02T19:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-03T10:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "created_at": "2026-10-03T10:30:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2026-10-03T11:00:00Z"
  },
  {
    "post_id": "f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "created_at": "2026-10-03T11:30:00Z"
  }
];

export const challenges = [
  {
    "id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "challenger_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "challengee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "target_score": 80,
    "status": "completed",
    "challenger_score": 92,
    "challengee_score": 85,
    "created_at": "2026-10-01T10:00:00Z",
    "completed_at": "2026-10-02T18:00:00Z"
  },
  {
    "id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "challenger_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "challengee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "target_score": 75,
    "status": "completed",
    "challenger_score": 88,
    "challengee_score": 82,
    "created_at": "2026-10-02T09:00:00Z",
    "completed_at": "2026-10-02T20:00:00Z"
  },
  {
    "id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "challenger_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "challengee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "target_score": 85,
    "status": "pending",
    "challenger_score": null,
    "challengee_score": null,
    "created_at": "2026-10-03T08:00:00Z",
    "completed_at": null
  },
  {
    "id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "challenger_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "challengee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "target_score": 70,
    "status": "accepted",
    "challenger_score": null,
    "challengee_score": null,
    "created_at": "2026-10-03T11:00:00Z",
    "completed_at": null
  },
  {
    "id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "challenger_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "challengee_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "target_score": 90,
    "status": "pending",
    "challenger_score": null,
    "challengee_score": null,
    "created_at": "2026-10-03T14:00:00Z",
    "completed_at": null
  }
];

export const learnerTopicProgress = [
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "accuracy": 85.5,
    "questions_attempted": 40,
    "questions_correct": 34,
    "difficulty_level": "intermediate",
    "mastery_percentage": 72
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "accuracy": 78,
    "questions_attempted": 25,
    "questions_correct": 19,
    "difficulty_level": "intermediate",
    "mastery_percentage": 65
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "accuracy": 92,
    "questions_attempted": 30,
    "questions_correct": 28,
    "difficulty_level": "advanced",
    "mastery_percentage": 88
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "accuracy": 88,
    "questions_attempted": 35,
    "questions_correct": 31,
    "difficulty_level": "intermediate",
    "mastery_percentage": 78
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "accuracy": 75,
    "questions_attempted": 20,
    "questions_correct": 15,
    "difficulty_level": "beginner",
    "mastery_percentage": 55
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "accuracy": 95,
    "questions_attempted": 60,
    "questions_correct": 57,
    "difficulty_level": "advanced",
    "mastery_percentage": 92
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "accuracy": 90,
    "questions_attempted": 45,
    "questions_correct": 40,
    "difficulty_level": "advanced",
    "mastery_percentage": 85
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "accuracy": 82,
    "questions_attempted": 30,
    "questions_correct": 25,
    "difficulty_level": "intermediate",
    "mastery_percentage": 70
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "accuracy": 70,
    "questions_attempted": 15,
    "questions_correct": 10,
    "difficulty_level": "beginner",
    "mastery_percentage": 45
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "accuracy": 65,
    "questions_attempted": 10,
    "questions_correct": 6,
    "difficulty_level": "beginner",
    "mastery_percentage": 35
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "accuracy": 98,
    "questions_attempted": 80,
    "questions_correct": 78,
    "difficulty_level": "advanced",
    "mastery_percentage": 95
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "accuracy": 94,
    "questions_attempted": 55,
    "questions_correct": 52,
    "difficulty_level": "advanced",
    "mastery_percentage": 90
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "accuracy": 96,
    "questions_attempted": 50,
    "questions_correct": 48,
    "difficulty_level": "advanced",
    "mastery_percentage": 93
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "accuracy": 91,
    "questions_attempted": 40,
    "questions_correct": 36,
    "difficulty_level": "advanced",
    "mastery_percentage": 87
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "accuracy": 89,
    "questions_attempted": 35,
    "questions_correct": 31,
    "difficulty_level": "advanced",
    "mastery_percentage": 82
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16",
    "accuracy": 87,
    "questions_attempted": 30,
    "questions_correct": 26,
    "difficulty_level": "intermediate",
    "mastery_percentage": 78
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17",
    "accuracy": 93,
    "questions_attempted": 45,
    "questions_correct": 42,
    "difficulty_level": "advanced",
    "mastery_percentage": 89
  }
];

export const xpTransactions = [
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "amount": 130,
    "reason": "Quiz completed - Programming (80%)",
    "reference_type": "quiz",
    "reference_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-02T15:30:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "amount": 50,
    "reason": "Daily streak bonus",
    "reference_type": "streak",
    "reference_id": null,
    "created_at": "2026-10-02T08:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "amount": 130,
    "reason": "Quiz completed - Science (80%)",
    "reference_type": "quiz",
    "reference_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "created_at": "2026-10-03T12:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "amount": 50,
    "reason": "Daily streak bonus",
    "reference_type": "streak",
    "reference_id": null,
    "created_at": "2026-10-03T08:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "amount": 300,
    "reason": "Perfect score bonus - History",
    "reference_type": "quiz",
    "reference_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2026-10-03T09:30:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "amount": 50,
    "reason": "Daily streak bonus",
    "reference_type": "streak",
    "reference_id": null,
    "created_at": "2026-10-03T08:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "amount": 300,
    "reason": "Perfect score bonus - History",
    "reference_type": "quiz",
    "reference_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "created_at": "2026-10-03T09:30:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "amount": 100,
    "reason": "Challenge won",
    "reference_type": "challenge",
    "reference_id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "created_at": "2026-10-02T18:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "amount": 50,
    "reason": "Daily streak bonus",
    "reference_type": "streak",
    "reference_id": null,
    "created_at": "2026-10-03T08:00:00Z"
  },
  {
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "amount": 60,
    "reason": "Quiz completed - Geography (60%)",
    "reference_type": "quiz",
    "reference_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "created_at": "2026-10-01T14:00:00Z"
  }
];

export const quizzes = [
  {
    "id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "difficulty": "medium",
    "question_count": 5,
    "status": "completed",
    "xp_earned": 130,
    "score": 80,
    "created_at": "2026-10-02T15:00:00Z",
    "completed_at": "2026-10-02T15:30:00Z"
  },
  {
    "id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "difficulty": "medium",
    "question_count": 5,
    "status": "completed",
    "xp_earned": 130,
    "score": 80,
    "created_at": "2026-10-03T11:30:00Z",
    "completed_at": "2026-10-03T12:00:00Z"
  },
  {
    "id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "difficulty": "hard",
    "question_count": 5,
    "status": "completed",
    "xp_earned": 300,
    "score": 100,
    "created_at": "2026-10-03T09:00:00Z",
    "completed_at": "2026-10-03T09:30:00Z"
  },
  {
    "id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "difficulty": "hard",
    "question_count": 5,
    "status": "completed",
    "xp_earned": 150,
    "score": 80,
    "created_at": "2026-10-02T17:00:00Z",
    "completed_at": "2026-10-02T18:00:00Z"
  },
  {
    "id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "user_id": "d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "topic_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "difficulty": "easy",
    "question_count": 5,
    "status": "completed",
    "xp_earned": 60,
    "score": 60,
    "created_at": "2026-10-01T13:30:00Z",
    "completed_at": "2026-10-01T14:00:00Z"
  }
];

export const quizQuestions = [
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "position": 1
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "position": 2
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "position": 3
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "position": 4
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "position": 5
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26",
    "position": 1
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27",
    "position": 2
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28",
    "position": 3
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29",
    "position": 4
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30",
    "position": 5
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41",
    "position": 1
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42",
    "position": 2
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43",
    "position": 3
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "position": 4
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45",
    "position": 5
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "position": 1
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "position": 2
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "position": 3
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "position": 4
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "position": 5
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
    "position": 1
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52",
    "position": 2
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53",
    "position": 3
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
    "position": 4
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    "position": 5
  }
];

export const quizAttempts = [
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 9,
    "created_at": "2026-10-02T15:04:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 7,
    "created_at": "2026-10-02T15:08:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 14,
    "created_at": "2026-10-02T15:12:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "selected_answer": 1,
    "is_correct": "false",
    "time_taken": 18,
    "created_at": "2026-10-02T15:17:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 6,
    "created_at": "2026-10-02T15:21:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26",
    "selected_answer": 0,
    "is_correct": "true",
    "time_taken": 8,
    "created_at": "2026-10-03T11:34:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27",
    "selected_answer": 0,
    "is_correct": "true",
    "time_taken": 10,
    "created_at": "2026-10-03T11:37:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 12,
    "created_at": "2026-10-03T11:41:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29",
    "selected_answer": 2,
    "is_correct": "false",
    "time_taken": 16,
    "created_at": "2026-10-03T11:46:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30",
    "selected_answer": 0,
    "is_correct": "true",
    "time_taken": 7,
    "created_at": "2026-10-03T11:50:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 6,
    "created_at": "2026-10-03T09:04:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 11,
    "created_at": "2026-10-03T09:08:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 13,
    "created_at": "2026-10-03T09:12:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 8,
    "created_at": "2026-10-03T09:16:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45",
    "selected_answer": 0,
    "is_correct": "true",
    "time_taken": 15,
    "created_at": "2026-10-03T09:21:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 9,
    "created_at": "2026-10-02T17:05:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 7,
    "created_at": "2026-10-02T17:09:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13",
    "selected_answer": 1,
    "is_correct": "false",
    "time_taken": 20,
    "created_at": "2026-10-02T17:14:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 12,
    "created_at": "2026-10-02T17:18:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 10,
    "created_at": "2026-10-02T17:22:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 8,
    "created_at": "2026-10-01T13:35:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52",
    "selected_answer": 2,
    "is_correct": "true",
    "time_taken": 14,
    "created_at": "2026-10-01T13:39:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53",
    "selected_answer": 1,
    "is_correct": "false",
    "time_taken": 11,
    "created_at": "2026-10-01T13:43:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54",
    "selected_answer": 0,
    "is_correct": "false",
    "time_taken": 15,
    "created_at": "2026-10-01T13:48:00Z"
  },
  {
    "quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05",
    "question_id": "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55",
    "selected_answer": 1,
    "is_correct": "true",
    "time_taken": 9,
    "created_at": "2026-10-01T13:52:00Z"
  }
];

