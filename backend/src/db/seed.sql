-- BrainSnack Seed Data
-- Realistic demo data for development

-- Clear existing data
TRUNCATE user_badges, badges, xp_transactions, learner_concept_progress, learner_topic_progress, quiz_attempts, quiz_questions, quizzes, questions, concepts, topics, post_likes, posts, follows, challenges, streaks, users RESTART IDENTITY CASCADE;

-- ============================================
-- TOPICS
-- ============================================
INSERT INTO topics (id, name, slug, icon, color, description) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Programming', 'programming', '💻', '#3b82f6', 'Learn programming languages, algorithms, and software development'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'AI & Machine Learning', 'ai-ml', '🤖', '#8b5cf6', 'Explore artificial intelligence, neural networks, and data science'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Science', 'science', '🔬', '#10b981', 'Discover the wonders of physics, chemistry, biology, and beyond'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'History', 'history', '📜', '#f59e0b', 'Journey through time and explore the events that shaped our world'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Geography', 'geography', '🌍', '#06b6d4', 'Explore countries, capitals, landscapes, and cultures around the globe'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Business', 'business', '📊', '#ec4899', 'Learn about entrepreneurship, finance, marketing, and management'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'General Knowledge', 'general-knowledge', '🧠', '#6366f1', 'A bit of everything - test your knowledge across all domains');

-- ============================================
-- CONCEPTS
-- ============================================
INSERT INTO concepts (id, topic_id, name, slug, description) VALUES
-- Programming concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'JavaScript Fundamentals', 'javascript-fundamentals', 'Core JavaScript language concepts'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Python Basics', 'python-basics', 'Introduction to Python programming'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Data Structures', 'data-structures', 'Arrays, linked lists, trees, graphs, and more'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Web Development', 'web-development', 'HTML, CSS, and modern web frameworks'),

-- AI/ML concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Neural Networks', 'neural-networks', 'Fundamentals of artificial neural networks'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Machine Learning Basics', 'ml-basics', 'Supervised, unsupervised, and reinforcement learning'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Natural Language Processing', 'nlp', 'Computational processing of human language'),

-- Science concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Physics', 'physics', 'Motion, energy, forces, and the laws of the universe'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Chemistry', 'chemistry', 'Atoms, molecules, reactions, and the periodic table'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Biology', 'biology', 'Living organisms, cells, genetics, and ecosystems'),

-- History concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Ancient Civilizations', 'ancient-civilizations', 'Egypt, Greece, Rome, Mesopotamia, and more'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'World Wars', 'world-wars', 'Causes, events, and consequences of WWI and WWII'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Modern History', 'modern-history', 'Post-war era to the present day'),

-- Geography concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'World Capitals', 'world-capitals', 'Capital cities of countries around the world'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Physical Geography', 'physical-geography', 'Landforms, climate, oceans, and natural features'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Countries & Cultures', 'countries-cultures', 'Nations, languages, traditions, and customs'),

-- Business concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Entrepreneurship', 'entrepreneurship', 'Starting and growing a business'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Finance & Investing', 'finance-investing', 'Personal finance, stocks, and investment strategies'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Marketing', 'marketing', 'Branding, digital marketing, and consumer behavior'),

-- General Knowledge concepts
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Sports', 'sports', 'Athletic events, rules, and famous athletes'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Arts & Literature', 'arts-literature', 'Famous works, artists, and literary movements'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'Technology', 'technology', 'Gadgets, innovations, and tech history');

-- ============================================
-- QUESTIONS
-- ============================================
INSERT INTO questions (id, topic_id, concept_id, question, options, correct_answer, explanation, difficulty) VALUES
-- Programming - JavaScript (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'What is the output of typeof null in JavaScript?', '["null", "undefined", "object", "number"]', 2, 'In JavaScript, typeof null returns "object". This is a well-known bug in the language that has been kept for backward compatibility.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Which method adds an element to the end of an array?', '["shift()", "unshift()", "push()", "pop()"]', 2, 'push() adds an element to the end of an array. unshift() adds to the beginning, pop() removes from the end, and shift() removes from the beginning.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'What does the "===" operator do in JavaScript?', '["Assigns a value", "Compares value only", "Compares value and type", "None of the above"]', 2, 'The strict equality operator (===) compares both value and type without type coercion, unlike == which performs type coercion.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'What is a closure in JavaScript?', '["A function that has access to its outer scope", "A way to close the browser", "A type of loop", "A method to end a program"]', 0, 'A closure is a function that remembers and can access variables from its outer (enclosing) scope even after the outer function has returned.', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'Which keyword declares a block-scoped variable in JavaScript?', '["var", "let", "function", "global"]', 1, 'let declares a block-scoped variable. var is function-scoped, and const is also block-scoped but cannot be reassigned.', 'easy'),

-- Programming - Python (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'What is the correct way to create a list in Python?', '["list = (1, 2, 3)", "list = [1, 2, 3]", "list = {1, 2, 3}", "list = <1, 2, 3>"]', 1, 'Lists in Python are created using square brackets []. Parentheses create tuples, curly braces create sets or dictionaries.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'What does the len() function do in Python?', '["Returns the length of an object", "Creates a new list", "Sorts a list", "Converts to lowercase"]', 0, 'len() returns the number of items in an object, such as the length of a string, list, tuple, or dictionary.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Which of the following is a mutable data type in Python?', '["tuple", "string", "list", "int"]', 2, 'Lists are mutable (can be modified after creation), while tuples, strings, and integers are immutable.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'What is a decorator in Python?', '["A design pattern for UI", "A function that modifies another function", "A type of class", "A built-in module"]', 1, 'A decorator is a function that takes another function and extends its behavior without explicitly modifying it.', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'What is the output of 3 * "ab" in Python?', '["ababab", "3ab", "ab3", "Error"]', 0, 'In Python, multiplying a string by an integer repeats the string that many times. So 3 * "ab" = "ababab".', 'medium'),

-- Programming - Data Structures (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 1, 'Binary search has O(log n) time complexity because it halves the search space with each comparison.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Which data structure uses FIFO (First In, First Out)?', '["Stack", "Queue", "Tree", "Graph"]', 1, 'A queue follows FIFO - the first element added is the first one removed. A stack follows LIFO (Last In, First Out).', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'What is the worst-case time complexity of quicksort?', '["O(n log n)", "O(n)", "O(n²)", "O(log n)"]', 2, 'Quicksort has O(n²) worst-case time complexity when the pivot selection is poor (e.g., already sorted array), though average case is O(n log n).', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Which data structure is best for implementing a priority queue?', '["Array", "Linked List", "Heap", "Stack"]', 2, 'A heap (specifically a binary heap) is the most efficient data structure for implementing a priority queue, with O(log n) insertion and extraction.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'What is a hash table?', '["A table of hashes", "A data structure that maps keys to values", "A sorted array", "A type of linked list"]', 1, 'A hash table is a data structure that implements an associative array, mapping keys to values using a hash function for efficient lookup.', 'medium'),

-- AI/ML - Neural Networks (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'What is an artificial neuron?', '["A biological brain cell", "A mathematical function that processes inputs", "A type of computer chip", "A data storage unit"]', 1, 'An artificial neuron is a mathematical function that receives one or more inputs, applies weights and an activation function, and produces an output.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'What is backpropagation?', '["A forward pass through the network", "An algorithm to calculate gradients for weight updates", "A type of neural network", "A data preprocessing technique"]', 1, 'Backpropagation is an algorithm that calculates the gradient of the loss function with respect to each weight by applying the chain rule, enabling weight updates during training.', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'What is the purpose of an activation function?', '["To normalize data", "To introduce non-linearity", "To reduce overfitting", "To speed up training"]', 1, 'Activation functions introduce non-linearity into the network, allowing it to learn complex patterns. Without them, a neural network would just be a linear model.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Which activation function outputs values between 0 and 1?', '["ReLU", "Sigmoid", "Tanh", "Leaky ReLU"]', 1, 'The sigmoid function outputs values between 0 and 1, making it useful for binary classification. Tanh outputs between -1 and 1, while ReLU outputs from 0 to infinity.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'What is overfitting in machine learning?', '["When the model performs well on training data but poorly on new data", "When the model is too simple", "When training takes too long", "When the model has too few parameters"]', 0, 'Overfitting occurs when a model learns the training data too well, including its noise and outliers, resulting in poor generalization to new, unseen data.', 'easy'),

-- AI/ML - ML Basics (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'What is supervised learning?', '["Learning without labels", "Learning with labeled data", "Learning from rewards", "Learning without data"]', 1, 'Supervised learning is a type of machine learning where the model is trained on labeled data, learning to map inputs to known outputs.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'What is the difference between classification and regression?', '["No difference", "Classification predicts categories, regression predicts continuous values", "Regression predicts categories, classification predicts numbers", "They are the same"]', 1, 'Classification predicts discrete categories (e.g., spam/not spam), while regression predicts continuous numerical values (e.g., house prices).', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'What is a training set?', '["A set of test data", "Data used to train the model", "A set of validation data", "Data used to evaluate the model"]', 1, 'The training set is the portion of data used to train the machine learning model. It is separate from validation and test sets.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'What is feature engineering?', '["Building physical features", "Creating input variables from raw data", "Designing neural networks", "Writing code"]', 1, 'Feature engineering is the process of creating meaningful input features from raw data to improve model performance.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'What is cross-validation?', '["Validating across different models", "Splitting data into multiple folds for robust evaluation", "Training on multiple GPUs", "Comparing different algorithms"]', 1, 'Cross-validation is a technique where data is split into multiple folds, and the model is trained and validated multiple times on different folds for more robust evaluation.', 'hard'),

-- Science - Physics (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'What is the speed of light in a vacuum?', '["300,000 km/s", "150,000 km/s", "500,000 km/s", "1,000,000 km/s"]', 0, 'The speed of light in a vacuum is approximately 299,792 km/s, commonly rounded to 300,000 km/s.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'What is Newton''s second law of motion?', '["F = ma", "E = mc²", "V = IR", "P = IV"]', 0, 'Newton''s second law states that Force equals mass times acceleration (F = ma).', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'What is the unit of force?', '["Joule", "Watt", "Newton", "Pascal"]', 2, 'The Newton (N) is the SI unit of force, defined as the force needed to accelerate 1 kg by 1 m/s².', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'What is the law of conservation of energy?', '["Energy cannot be created or destroyed", "Energy always increases", "Energy is always lost", "Energy can be created from nothing"]', 0, 'The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'What is the acceleration due to gravity on Earth?', '["9.8 m/s²", "8.9 m/s²", "10.8 m/s²", "7.6 m/s²"]', 0, 'The standard acceleration due to gravity on Earth is approximately 9.8 m/s².', 'easy'),

-- Science - Chemistry (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a31', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'What is the chemical symbol for gold?', '["Go", "Gd", "Au", "Ag"]', 2, 'The chemical symbol for gold is Au, from the Latin word "aurum". Ag is silver (argentum).', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a32', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'What is the pH of pure water?', '["0", "7", "14", "1"]', 1, 'Pure water has a pH of 7, which is considered neutral. Below 7 is acidic, above 7 is basic (alkaline).', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'What is the most abundant gas in Earth''s atmosphere?', '["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"]', 2, 'Nitrogen makes up about 78% of Earth''s atmosphere, while oxygen is about 21%.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a34', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'What is the atomic number of carbon?', '["4", "6", "8", "12"]', 1, 'Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a35', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'What type of bond involves the sharing of electrons?', '["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"]', 1, 'A covalent bond involves the sharing of electron pairs between atoms. Ionic bonds involve the transfer of electrons.', 'medium'),

-- Science - Biology (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a36', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'What is the powerhouse of the cell?', '["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"]', 2, 'Mitochondria are known as the powerhouse of the cell because they produce ATP, the cell''s main energy currency.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a37', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'What is DNA?', '["A protein", "A type of fat", "Deoxyribonucleic acid - carries genetic information", "A carbohydrate"]', 2, 'DNA (Deoxyribonucleic acid) is the molecule that carries genetic instructions for the development, functioning, and reproduction of all known organisms.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a38', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'What is photosynthesis?', '["The process of breathing", "Converting light energy into chemical energy", "Cell division", "Protein synthesis"]', 1, 'Photosynthesis is the process by which green plants convert light energy into chemical energy stored in glucose, using CO₂ and water.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a39', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'How many chromosomes do humans have?', '["23", "46", "44", "48"]', 1, 'Humans have 46 chromosomes (23 pairs) in each cell, except for gametes which have 23.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a40', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'What is the largest organ in the human body?', '["Heart", "Liver", "Skin", "Brain"]', 2, 'The skin is the largest organ in the human body, covering about 20 square feet in adults.', 'easy'),

-- History - Ancient Civilizations (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Which civilization built the pyramids of Giza?', '["Roman", "Greek", "Egyptian", "Mayan"]', 2, 'The pyramids of Giza were built by the ancient Egyptians around 4,500 years ago as tombs for pharaohs.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'What was the primary writing system of ancient Mesopotamia?', '["Hieroglyphics", "Cuneiform", "Sanskrit", "Latin"]', 1, 'Cuneiform was the writing system used in ancient Mesopotamia, consisting of wedge-shaped marks on clay tablets.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Who was the first Roman Emperor?', '["Julius Caesar", "Augustus", "Nero", "Constantine"]', 1, 'Augustus (formerly Octavian) became the first Roman Emperor in 27 BC after defeating Mark Antony.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'The ancient Olympic Games originated in which country?', '["Rome", "Egypt", "Greece", "Babylon"]', 2, 'The ancient Olympic Games were held in Olympia, Greece, starting in 776 BC as a religious and athletic festival.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'What was the Code of Hammurabi?', '["A set of laws", "A religious text", "A military strategy", "A trade agreement"]', 0, 'The Code of Hammurabi was one of the earliest and most complete written legal codes, created by the Babylonian king Hammurabi around 1754 BC.', 'hard'),

-- History - World Wars (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a46', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'In which year did World War I begin?', '["1912", "1914", "1916", "1918"]', 1, 'World War I began in 1914 after the assassination of Archduke Franz Ferdinand of Austria.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a47', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'What event triggered the United States entry into World War II?', '["Invasion of Poland", "Attack on Pearl Harbor", "Battle of Britain", "D-Day"]', 1, 'The attack on Pearl Harbor by Japan on December 7, 1941, led to the United States entering World War II.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a48', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Which battle is considered the turning point on the Eastern Front in WWII?', '["Battle of Britain", "Battle of Stalingrad", "Battle of Midway", "Battle of the Bulge"]', 1, 'The Battle of Stalingrad (1942-1943) is considered the turning point on the Eastern Front, where the Soviet Union defeated Nazi Germany.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a49', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'What was the D-Day invasion?', '["The invasion of Normandy", "The invasion of Italy", "The invasion of Japan", "The invasion of North Africa"]', 0, 'D-Day (June 6, 1944) was the Allied invasion of Normandy, France, which began the liberation of Western Europe from Nazi control.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a50', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Which treaty ended World War I?', '["Treaty of Versailles", "Treaty of Paris", "Treaty of Vienna", "Treaty of Westphalia"]', 0, 'The Treaty of Versailles, signed in 1919, officially ended World War I between Germany and the Allied Powers.', 'medium'),

-- Geography - World Capitals (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'What is the capital of Japan?', '["Seoul", "Beijing", "Tokyo", "Bangkok"]', 2, 'Tokyo is the capital of Japan and one of the largest metropolitan areas in the world.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'What is the capital of Australia?', '["Sydney", "Melbourne", "Canberra", "Perth"]', 2, 'Canberra is the capital of Australia, not Sydney or Melbourne as many people assume.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'What is the capital of Canada?', '["Toronto", "Vancouver", "Ottawa", "Montreal"]', 2, 'Ottawa is the capital of Canada, located in the province of Ontario.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'What is the capital of Brazil?', '["Rio de Janeiro", "São Paulo", "Brasília", "Salvador"]', 2, 'Brasília has been the capital of Brazil since 1960, replacing Rio de Janeiro.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'What is the capital of Egypt?', '["Alexandria", "Cairo", "Luxor", "Giza"]', 1, 'Cairo is the capital of Egypt and the largest city in the Arab world.', 'easy'),

-- Geography - Physical Geography (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a56', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'What is the longest river in the world?', '["Amazon", "Nile", "Yangtze", "Mississippi"]', 1, 'The Nile River in Africa is traditionally considered the longest at about 6,650 km, though some studies suggest the Amazon may be longer.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a57', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'What is the largest desert in the world?', '["Sahara", "Gobi", "Antarctic Desert", "Arabian Desert"]', 2, 'The Antarctic Desert is the largest desert in the world, covering about 14.2 million km². Deserts are defined by low precipitation, not heat.', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a58', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'What is the highest mountain in the world?', '["K2", "Mount Everest", "Kangchenjunga", "Lhotse"]', 1, 'Mount Everest is the highest mountain above sea level at 8,849 meters (29,032 ft).', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a59', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'What is the deepest ocean trench?', '["Mariana Trench", "Tonga Trench", "Java Trench", "Puerto Rico Trench"]', 0, 'The Mariana Trench in the Pacific Ocean is the deepest part of the world''s oceans, reaching about 10,994 meters at its deepest point (Challenger Deep).', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a60', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Which is the largest ocean on Earth?', '["Atlantic", "Indian", "Arctic", "Pacific"]', 3, 'The Pacific Ocean is the largest and deepest ocean, covering about 63 million square miles - larger than all land area combined.', 'easy'),

-- Business - Entrepreneurship (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a61', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'What is a startup?', '["A small business", "A newly established business seeking to grow", "A government agency", "A non-profit organization"]', 1, 'A startup is a newly established business, typically in its early stages, focused on developing a unique product or service with high growth potential.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a62', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'What is a business plan?', '["A financial report", "A document outlining business goals and strategies", "A marketing campaign", "An employee handbook"]', 1, 'A business plan is a formal document that outlines a business''s goals, strategies, target market, and financial projections.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a63', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'What is an MVP in startup terminology?', '["Most Valuable Player", "Minimum Viable Product", "Maximum Value Proposition", "Most Valuable Product"]', 1, 'MVP (Minimum Viable Product) is the simplest version of a product that can be released to test a business hypothesis with minimal resources.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a64', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'What is a pitch deck?', '["A presentation for investors", "A type of board game", "A marketing tool", "A financial statement"]', 0, 'A pitch deck is a presentation used by startups to pitch their business idea to potential investors, typically including the problem, solution, market, and team.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a65', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'What is bootstrapping?', '["Raising venture capital", "Funding a business with personal finances or revenue", "Selling company shares", "Taking out bank loans"]', 1, 'Bootstrapping means starting and growing a business using only personal finances or the company''s own revenue, without external investment.', 'medium'),

-- Business - Finance (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a66', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'What is compound interest?', '["Interest on principal only", "Interest calculated on principal plus accumulated interest", "A fixed interest rate", "Interest paid monthly"]', 1, 'Compound interest is interest calculated on the initial principal plus all previously accumulated interest, leading to exponential growth.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a67', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'What is diversification in investing?', '["Investing in one stock", "Spreading investments across different assets", "Selling all investments", "Investing only in bonds"]', 1, 'Diversification is a risk management strategy that spreads investments across various asset classes, sectors, and geographies to reduce exposure to any single asset.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a68', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'What is a stock?', '["A loan to a company", "A share of ownership in a company", "A type of bond", "A savings account"]', 1, 'A stock represents a share of ownership in a company. Stockholders may receive dividends and have voting rights.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a69', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'What is the S&P 500?', '["A type of bond", "A stock market index of 500 large US companies", "A bank", "A government agency"]', 1, 'The S&P 500 is a stock market index that tracks the performance of 500 of the largest publicly traded companies in the United States.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a70', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'What is inflation?', '["Decrease in prices", "Increase in the general price level over time", "A type of tax", "A stock market crash"]', 1, 'Inflation is the rate at which the general level of prices for goods and services rises over time, reducing purchasing power.', 'easy'),

-- General Knowledge - Sports (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a71', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'How many players are on a soccer team on the field?', '["9", "10", "11", "12"]', 2, 'Each soccer team has 11 players on the field, including the goalkeeper.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a72', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'In which sport would you perform a slam dunk?', '["Volleyball", "Basketball", "Tennis", "Badminton"]', 1, 'A slam dunk is a basketball move where a player jumps and scores by putting the ball directly through the hoop.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a73', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'How often are the Summer Olympic Games held?', '["Every 2 years", "Every 3 years", "Every 4 years", "Every 5 years"]', 2, 'The Summer Olympic Games are held every 4 years, with the Winter Olympics also held every 4 years but staggered by 2 years.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a74', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'What is the maximum break in snooker?', '["100", "147", "155", "180"]', 1, 'The maximum break in snooker is 147, achieved by potting all 15 reds with 15 blacks followed by all the colors.', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a75', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'Which country has won the most FIFA World Cups?', '["Germany", "Argentina", "Brazil", "Italy"]', 2, 'Brazil has won the FIFA World Cup 5 times (1958, 1962, 1970, 1994, 2002), more than any other nation.', 'medium'),

-- General Knowledge - Arts & Literature (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a76', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Who wrote "Romeo and Juliet"?', '["Charles Dickens", "William Shakespeare", "Jane Austen", "Mark Twain"]', 1, 'William Shakespeare wrote Romeo and Juliet around 1595. It is one of his most famous tragedies.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a77', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Who painted the Mona Lisa?', '["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"]', 2, 'Leonardo da Vinci painted the Mona Lisa in the early 16th century. It is now housed in the Louvre Museum in Paris.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a78', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'What is the best-selling novel of all time?', '["Harry Potter", "Don Quixote", "A Tale of Two Cities", "The Lord of the Rings"]', 1, 'Don Quixote by Miguel de Cervantes is considered the best-selling novel of all time, with over 500 million copies sold.', 'hard'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a79', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Who wrote "1984"?', '["Aldous Huxley", "George Orwell", "Ray Bradbury", "Franz Kafka"]', 1, 'George Orwell (Eric Arthur Blair) wrote 1984, published in 1949. It is a dystopian novel about totalitarianism.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a80', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'Which artist cut off part of his own ear?', '["Pablo Picasso", "Vincent van Gogh", "Salvador Dalí", "Claude Monet"]', 1, 'Vincent van Gogh cut off part of his left ear in 1888 during a period of mental illness. He painted several self-portraits with the bandaged ear.', 'medium'),

-- General Knowledge - Technology (5 questions)
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a81', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'What does "HTTP" stand for?', '["HyperText Transfer Protocol", "High Tech Transfer Protocol", "HyperText Transmission Program", "High Transfer Text Protocol"]', 0, 'HTTP stands for HyperText Transfer Protocol, the foundation of data communication on the World Wide Web.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a82', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Who is credited with inventing the World Wide Web?', '["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Vint Cerf"]', 2, 'Tim Berners-Lee invented the World Wide Web in 1989 while working at CERN. He also created the first web browser and web server.', 'medium'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a83', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'What year was the first iPhone released?', '["2005", "2006", "2007", "2008"]', 2, 'The first iPhone was released on June 29, 2007, revolutionizing the smartphone industry.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a84', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'What does "AI" stand for?', '["Automated Intelligence", "Artificial Intelligence", "Advanced Internet", "Augmented Interaction"]', 1, 'AI stands for Artificial Intelligence - the simulation of human intelligence by machines.', 'easy'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a85', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'What was the first programmable computer?', '["ENIAC", "Colossus", "Z3", "UNIVAC"]', 2, 'The Z3, built by Konrad Zuse in 1941, is considered the first programmable, fully automatic digital computer.', 'hard');

-- ============================================
-- USERS (Demo users with varied stats)
-- ============================================
-- Password for all demo users: "password123"
INSERT INTO users (id, username, email, password_hash, display_name, avatar_url, xp, level, streak, last_active, personal_best, created_at) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'alex_codes', 'alex@brainsnack.com', '$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2', 'Alex Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', 2450, 8, 12, '2026-10-02', 95, '2025-01-15T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'sarah_learns', 'sarah@brainsnack.com', '$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2', 'Sarah Johnson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', 1820, 6, 7, '2026-10-03', 88, '2025-02-20T14:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'mike_quiz', 'mike@brainsnack.com', '$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2', 'Mike Rodriguez', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', 3100, 10, 21, '2026-10-03', 100, '2024-11-05T09:15:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'emma_brain', 'emma@brainsnack.com', '$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2', 'Emma Wilson', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', 980, 4, 3, '2026-10-01', 72, '2025-06-10T16:45:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'david_tech', 'david@brainsnack.com', '$2a$10$0SU.LE7mWiQQ1WPSvUJz6.CxPZUqJGa9jy91a/ToI2EAXEmz5zBV2', 'David Kim', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', 4200, 12, 35, '2026-10-03', 100, '2024-08-22T11:00:00Z');

-- ============================================
-- STREAKS
-- ============================================
INSERT INTO streaks (user_id, current_streak, longest_streak, last_activity_date) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 12, 15, '2026-10-02'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 7, 10, '2026-10-03'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 21, 28, '2026-10-03'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 3, 8, '2026-10-01'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 35, 42, '2026-10-03');

-- ============================================
-- BADGES
-- ============================================
INSERT INTO badges (id, name, slug, description, icon, criteria_type, criteria_value) VALUES
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'First Steps', 'first-steps', 'Complete your first quiz', '🎯', 'quiz_count', 1),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'Quiz Master', 'quiz-master', 'Complete 10 quizzes', '📝', 'quiz_count', 10),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'Perfect Score', 'perfect-score', 'Get 100% on any quiz', '💯', 'perfect_score', 100),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'Streak Starter', 'streak-starter', 'Maintain a 3-day streak', '🔥', 'streak', 3),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'Week Warrior', 'week-warrior', 'Maintain a 7-day streak', '⚡', 'streak', 7),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'Unstoppable', 'unstoppable', 'Maintain a 30-day streak', '🚀', 'streak', 30),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'XP Hunter', 'xp-hunter', 'Earn 1,000 XP', '⭐', 'xp', 1000),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'XP Champion', 'xp-champion', 'Earn 5,000 XP', '🏆', 'xp', 5000),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', 'Level 5', 'level-5', 'Reach level 5', '🎖️', 'level', 5),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', 'Level 10', 'level-10', 'Reach level 10', '👑', 'level', 10),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Topic Master', 'topic-master', 'Achieve 90% mastery in any topic', '🧠', 'topic_mastery', 90),
('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Knowledge Seeker', 'knowledge-seeker', 'Complete quizzes in 5 different topics', '📚', 'quiz_count', 25);

-- ============================================
-- USER BADGES (earned)
-- ============================================
INSERT INTO user_badges (user_id, badge_id, earned_at) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2025-01-15T10:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2025-03-20T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2025-02-10T09:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2025-04-05T16:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '2025-05-12T11:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '2025-06-01T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2025-02-20T15:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2025-03-15T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '2025-07-20T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2024-11-05T09:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2024-12-10T11:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2025-01-20T16:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2024-12-01T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2025-01-15T09:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '2025-02-28T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '2025-04-10T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '2025-08-15T11:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025-06-20T15:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2025-06-10T17:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2025-07-01T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2024-08-22T11:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2024-09-15T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2024-10-01T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2024-09-20T09:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2024-10-15T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', '2025-01-10T11:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', '2024-11-20T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', '2025-03-15T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a09', '2024-12-01T09:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a10', '2025-02-20T11:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2025-01-05T15:00:00Z');

-- ============================================
-- FOLLOWS
-- ============================================
INSERT INTO follows (follower_id, followee_id, created_at) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2025-02-01T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2025-02-15T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2025-03-01T09:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2025-03-10T11:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2024-12-01T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2025-06-15T16:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2025-06-20T10:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2025-07-01T14:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2024-09-01T11:00:00Z');

-- ============================================
-- POSTS
-- ============================================
INSERT INTO posts (id, user_id, type, content, caption, created_at) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'achievement', '{"quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01", "score": 80, "topic": "Programming", "xp_earned": 130}', 'Scored 80% on the Programming quiz! Feeling the burn 🔥', '2026-10-02T15:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'streak', '{"streak_days": 21, "topic": "AI & ML"}', '21-day streak! Consistency is key 💪', '2026-10-03T08:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'badge', '{"badge_name": "Unstoppable", "badge_icon": "🚀"}', 'Just earned the Unstoppable badge! 30-day streak complete!', '2026-10-01T20:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'achievement', '{"quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02", "score": 80, "topic": "Science", "xp_earned": 130}', 'Science quiz done! 80% - getting better every time 🧪', '2026-10-03T12:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'general', '{"message": "Just joined BrainSnack!"}', 'Excited to start my learning journey! Any tips for beginners? 🎓', '2026-10-01T10:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'challenge', '{"challenge_id": "10eebc99-9c0b-4ef8-bb6d-6bb9bd380a01", "opponent": "David Kim", "result": "won", "score": 92}', 'Just beat David in a Programming challenge! 92% vs 85% 🏆', '2026-10-02T18:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'achievement', '{"quiz_id": "20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03", "score": 100, "topic": "History", "xp_earned": 300}', 'PERFECT SCORE on History! 100%! All that reading paid off 📚✨', '2026-10-03T09:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a08', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'badge', '{"badge_name": "Week Warrior", "badge_icon": "⚡"}', 'Week Warrior badge unlocked! 7-day streak ⚡', '2026-09-28T14:00:00Z');

-- ============================================
-- POST LIKES
-- ============================================
INSERT INTO post_likes (post_id, user_id, created_at) VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2026-10-02T16:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2026-10-02T16:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2026-10-02T17:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-03T08:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2026-10-03T09:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2026-10-03T09:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-01T20:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2026-10-01T21:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2026-10-01T21:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2026-10-02T08:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-03T12:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2026-10-03T13:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-02T18:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2026-10-02T19:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a06', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2026-10-02T19:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-03T10:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2026-10-03T10:30:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2026-10-03T11:00:00Z'),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a07', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', '2026-10-03T11:30:00Z');

-- ============================================
-- CHALLENGES
-- ============================================
INSERT INTO challenges (id, challenger_id, challengee_id, topic_id, target_score, status, challenger_score, challengee_score, created_at, completed_at) VALUES
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 80, 'completed', 92, 85, '2026-10-01T10:00:00Z', '2026-10-02T18:00:00Z'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 75, 'completed', 88, 82, '2026-10-02T09:00:00Z', '2026-10-02T20:00:00Z'),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 85, 'pending', NULL, NULL, '2026-10-03T08:00:00Z', NULL),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 70, 'accepted', NULL, NULL, '2026-10-03T11:00:00Z', NULL),
('10eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 90, 'pending', NULL, NULL, '2026-10-03T14:00:00Z', NULL);

-- ============================================
-- LEARNER PROGRESS (sample data for demo users)
-- ============================================
INSERT INTO learner_topic_progress (user_id, topic_id, accuracy, questions_attempted, questions_correct, difficulty_level, mastery_percentage) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 85.5, 40, 34, 'intermediate', 72.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 78.0, 25, 19, 'intermediate', 65.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 92.0, 30, 28, 'advanced', 88.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 88.0, 35, 31, 'intermediate', 78.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 75.0, 20, 15, 'beginner', 55.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 95.0, 60, 57, 'advanced', 92.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 90.0, 45, 40, 'advanced', 85.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 82.0, 30, 25, 'intermediate', 70.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 70.0, 15, 10, 'beginner', 45.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 65.0, 10, 6, 'beginner', 35.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 98.0, 80, 78, 'advanced', 95.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 94.0, 55, 52, 'advanced', 90.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 96.0, 50, 48, 'advanced', 93.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 91.0, 40, 36, 'advanced', 87.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 89.0, 35, 31, 'advanced', 82.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 87.0, 30, 26, 'intermediate', 78.0),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 93.0, 45, 42, 'advanced', 89.0);

-- ============================================
-- XP TRANSACTIONS (sample recent activity)
-- ============================================
INSERT INTO xp_transactions (user_id, amount, reason, reference_type, reference_id, created_at) VALUES
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 130, 'Quiz completed - Programming (80%)', 'quiz', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-02T15:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 50, 'Daily streak bonus', 'streak', NULL, '2026-10-02T08:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 130, 'Quiz completed - Science (80%)', 'quiz', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', '2026-10-03T12:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 50, 'Daily streak bonus', 'streak', NULL, '2026-10-03T08:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 300, 'Perfect score bonus - History', 'quiz', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2026-10-03T09:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 50, 'Daily streak bonus', 'streak', NULL, '2026-10-03T08:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 300, 'Perfect score bonus - History', 'quiz', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', '2026-10-03T09:30:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 100, 'Challenge won', 'challenge', '10eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', '2026-10-02T18:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 50, 'Daily streak bonus', 'streak', NULL, '2026-10-03T08:00:00Z'),
('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 60, 'Quiz completed - Geography (60%)', 'quiz', '20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', '2026-10-01T14:00:00Z');

-- ============================================
-- QUIZZES (sample completed quizzes)
-- ============================================
-- Scores are whole percentages derived from 5-question attempts (0/20/.../100)
-- so the seeded numbers are actually reproducible by replaying the attempts below.
INSERT INTO quizzes (id, user_id, topic_id, difficulty, question_count, status, xp_earned, score, created_at, completed_at) VALUES
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'medium', 5, 'completed', 130, 80, '2026-10-02T15:00:00Z', '2026-10-02T15:30:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'medium', 5, 'completed', 130, 80, '2026-10-03T11:30:00Z', '2026-10-03T12:00:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'hard', 5, 'completed', 300, 100, '2026-10-03T09:00:00Z', '2026-10-03T09:30:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'hard', 5, 'completed', 150, 80, '2026-10-02T17:00:00Z', '2026-10-02T18:00:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'easy', 5, 'completed', 60, 60, '2026-10-01T13:30:00Z', '2026-10-01T14:00:00Z');

-- ============================================
-- QUIZ <-> QUESTION MAPPING
-- ============================================
INSERT INTO quiz_questions (quiz_id, question_id, position) VALUES
-- Quiz 1: Alex - Programming (JavaScript fundamentals)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 1),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 2),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 3),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 4),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 5),
-- Quiz 2: Sarah - Science (Physics)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 1),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 2),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 3),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 4),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 5),
-- Quiz 3: David - History (Ancient Civilizations)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 1),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 2),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 3),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 4),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 5),
-- Quiz 4: Mike - Programming (Data Structures)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 2),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 3),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 4),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 5),
-- Quiz 5: Emma - Geography (World Capitals)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 1),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 2),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 3),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54', 4),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 5);

-- ============================================
-- QUIZ ATTEMPTS (reproduces the quiz scores above)
-- ============================================
INSERT INTO quiz_attempts (quiz_id, question_id, selected_answer, is_correct, time_taken, created_at) VALUES
-- Quiz 1: 4/5 correct (80%) - missed the closure question
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 2, true, 9, '2026-10-02T15:04:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 2, true, 7, '2026-10-02T15:08:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 2, true, 14, '2026-10-02T15:12:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 1, false, 18, '2026-10-02T15:17:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a01', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 1, true, 6, '2026-10-02T15:21:00Z'),
-- Quiz 2: 4/5 correct (80%) - missed energy conservation
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 0, true, 8, '2026-10-03T11:34:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 0, true, 10, '2026-10-03T11:37:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a28', 2, true, 12, '2026-10-03T11:41:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a29', 2, false, 16, '2026-10-03T11:46:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a02', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a30', 0, true, 7, '2026-10-03T11:50:00Z'),
-- Quiz 3: 5/5 correct (100%)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a41', 2, true, 6, '2026-10-03T09:04:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a42', 1, true, 11, '2026-10-03T09:08:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a43', 1, true, 13, '2026-10-03T09:12:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 2, true, 8, '2026-10-03T09:16:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a03', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a45', 0, true, 15, '2026-10-03T09:21:00Z'),
-- Quiz 4: 4/5 correct (80%) - missed quicksort worst case
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, true, 9, '2026-10-02T17:05:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1, true, 7, '2026-10-02T17:09:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 1, false, 20, '2026-10-02T17:14:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 2, true, 12, '2026-10-02T17:18:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a04', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 1, true, 10, '2026-10-02T17:22:00Z'),
-- Quiz 5: 3/5 correct (60%)
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a51', 2, true, 8, '2026-10-01T13:35:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a52', 2, true, 14, '2026-10-01T13:39:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a53', 1, false, 11, '2026-10-01T13:43:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a54', 0, false, 15, '2026-10-01T13:48:00Z'),
('20eebc99-9c0b-4ef8-bb6d-6bb9bd380a05', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a55', 1, true, 9, '2026-10-01T13:52:00Z');
