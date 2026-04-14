const express = require('express');
const router = express.Router();

const getRandomElements = (arr, num) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, num);
};

const masteryExams = {
  "fundamentals": {
    mcqsPool: [
      { question: "Which data type is best for storing a single letter?", options: ["int", "string", "char", "bool"], answer: 2 },
      { question: "What is the output of 10 % 3?", options: ["3.33", "3", "1", "0"], answer: 2 },
      { question: "Which of the following is a valid C++ single-line comment?", options: ["/* comment */", "// comment", "# comment", ""], answer: 1 },
      { question: "What does the '++' operator do?", options: ["Multiplies by 2", "Adds 1", "Subtracts 1", "Squares the number"], answer: 1 },
      { question: "Which keyword is used to return a value from a function?", options: ["send", "break", "return", "output"], answer: 2 },
      { question: "What is the size of a standard 'int' in modern 64-bit C++?", options: ["1 byte", "2 bytes", "4 bytes", "8 bytes"], answer: 2 },
      { question: "Which loop is guaranteed to execute at least once?", options: ["for", "while", "do-while", "range-for"], answer: 2 },
      { question: "What symbol is used for logical AND?", options: ["&&", "||", "!", "&"], answer: 0 },
      { question: "How do you declare a constant variable?", options: ["constant int x = 5;", "const int x = 5;", "int const x = 5;", "Both B and C"], answer: 3 },
      { question: "What is the correct way to include the standard input/output library?", options: ["#include <stdio.h>", "#include <iostream>", "import <iostream>", "using <iostream>"], answer: 1 }
    ],
    codingPool: [
      { prompt: "Write a C++ program that takes an integer 'n' and prints all EVEN numbers from 2 to 'n' using a for loop.", starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Write your loop here\n\n    return 0;\n}" },
      { prompt: "Write a C++ program that takes two integers 'a' and 'b' and prints their sum.", starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // Print the sum\n\n    return 0;\n}" },
      { prompt: "Write a C++ program that takes an integer 'n' and prints 'Positive', 'Negative', or 'Zero'.", starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    // Write your conditions here\n\n    return 0;\n}" }
    ]
  },
  "arrays_strings": {
    mcqsPool: [
      { question: "In C++, array indices start at what number?", options: ["1", "0", "-1", "Depends on size"], answer: 1 },
      { question: "Which header is required to use std::string?", options: ["<char>", "<text>", "<string>", "<str>"], answer: 2 },
      { question: "What character automatically terminates a C-style string?", options: ["\\n", "\\t", "\\0", "\\end"], answer: 2 },
      { question: "How do you find the length of a std::string named 'str'?", options: ["str.length", "length(str)", "str.size()", "sizeOf(str)"], answer: 2 },
      { question: "If int arr[5] = {1, 2}; what is the value of arr[3]?", options: ["1", "2", "0", "Garbage value"], answer: 2 },
      { question: "How do you access the element in the 2nd row and 3rd column of matrix 'm'?", options: ["m[2][3]", "m[1][2]", "m(1, 2)", "m[2, 3]"], answer: 1 },
      { question: "What function reads a string with spaces from the console?", options: ["cin >>", "scanf()", "getline()", "read()"], answer: 2 },
      { question: "Which algorithm reverses a string 's'?", options: ["s.reverse()", "reverse(s.begin(), s.end())", "strrev(s)", "s.invert()"], answer: 1 },
      { question: "What happens if you access arr[10] in an array of size 5?", options: ["Compiler error", "Returns 0", "Resizes array", "Undefined behavior (Out of bounds)"], answer: 3 },
      { question: "How do you concatenate two strings s1 and s2?", options: ["s1.append(s2)", "s1 + s2", "Both A and B", "concat(s1, s2)"], answer: 2 }
    ],
    codingPool: [
      { prompt: "Write a program that calculates the sum of all elements in an array of 5 integers.", starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[5] = {10, 20, 30, 40, 50};\n    // Calculate and print sum\n\n    return 0;\n}" },
      { prompt: "Write a program that takes a string 's' and prints its reversed version.", starterCode: "#include <iostream>\n#include <string>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    string s;\n    cin >> s;\n    // Reverse and print\n\n    return 0;\n}" },
      { prompt: "Write a program to find the maximum element in a 1D array.", starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int arr[5] = {12, 45, 7, 89, 23};\n    // Find and print max\n\n    return 0;\n}" }
    ]
  },
  "memory_pointers": {
    mcqsPool: [
      { question: "What does the '&' operator do when placed before a variable?", options: ["Multiplies it", "Gets its memory address", "Dereferences it", "Deletes it"], answer: 1 },
      { question: "Which operator is used to dereference a pointer?", options: ["*", "&", "->", "::"], answer: 0 },
      { question: "How do you dynamically allocate a single integer in C++?", options: ["malloc(int)", "new int", "allocate int", "create int"], answer: 1 },
      { question: "What causes a memory leak?", options: ["Using pointers", "Forgetting to use 'delete' after 'new'", "Dereferencing a null pointer", "Deleting an array"], answer: 1 },
      { question: "What is a Dangling Pointer?", options: ["A pointer initialized to nullptr", "A pointer that points to freed memory", "A pointer to a pointer", "A void pointer"], answer: 1 },
      { question: "Which smart pointer shares ownership of an object?", options: ["unique_ptr", "shared_ptr", "weak_ptr", "auto_ptr"], answer: 1 },
      { question: "How do you free memory allocated with 'new int[10]'?", options: ["delete int", "free()", "delete[]", "remove[]"], answer: 2 },
      { question: "What is a double pointer?", options: ["A pointer twice the size", "A pointer that stores the address of another pointer", "A pointer to a double data type", "A 64-bit pointer"], answer: 1 },
      { question: "Which smart pointer should be used by default for exclusive ownership?", options: ["shared_ptr", "unique_ptr", "weak_ptr", "raw pointer"], answer: 1 },
      { question: "What value should a pointer have if it doesn't point to anything valid?", options: ["0", "NULL", "nullptr", "All of the above"], answer: 3 }
    ],
    codingPool: [
      { prompt: "Write a function 'swap(int* a, int* b)' that swaps the values of two variables using pointers.", starterCode: "#include <iostream>\nusing namespace std;\n\nvoid swap(int* a, int* b) {\n    // Write swap logic\n}\n\nint main() {\n    int x = 10, y = 20;\n    swap(&x, &y);\n    cout << x << \" \" << y;\n    return 0;\n}" },
      { prompt: "Dynamically allocate an array of 'n' integers, initialize them to 0, and then delete the array to prevent memory leaks.", starterCode: "#include <iostream>\nusing namespace std;\n\nint main() {\n    int n = 5;\n    // Allocate, initialize, and delete\n\n    return 0;\n}" },
      { prompt: "Create a unique_ptr to an integer with the value 100, and print its value.", starterCode: "#include <iostream>\n#include <memory>\nusing namespace std;\n\nint main() {\n    // Create unique_ptr and print\n\n    return 0;\n}" }
    ]
  },
  "oop": {
    mcqsPool: [
      { question: "Which pillar of OOP refers to hiding internal state and requiring all interaction to be performed through an object's methods?", options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], answer: 2 },
      { question: "What is the default access specifier for members of a C++ 'class'?", options: ["public", "private", "protected", "static"], answer: 1 },
      { question: "What special function is called automatically when an object is created?", options: ["Destructor", "Builder", "Constructor", "Initializer"], answer: 2 },
      { question: "Which keyword allows a derived class to override a base class method?", options: ["virtual", "static", "const", "override"], answer: 0 },
      { question: "What does the 'this' pointer point to?", options: ["The base class", "The current object instance", "The next object", "Null"], answer: 1 },
      { question: "Which access specifier allows derived classes to access a member, but keeps it hidden from the outside?", options: ["public", "private", "protected", "friend"], answer: 2 },
      { question: "What is an abstract class?", options: ["A class with no members", "A class with at least one pure virtual function", "A class that cannot be inherited", "A class with only private members"], answer: 1 },
      { question: "Function overloading is an example of what?", options: ["Compile-time polymorphism", "Runtime polymorphism", "Encapsulation", "Multiple inheritance"], answer: 0 },
      { question: "How do you call a base class constructor from a derived class?", options: ["Inside the constructor body", "Using an initialization list", "You cannot call it", "Using super()"], answer: 1 },
      { question: "What is the purpose of a destructor?", options: ["To allocate memory", "To initialize variables", "To clean up resources before an object is destroyed", "To pause the program"], answer: 2 }
    ],
    codingPool: [
      { prompt: "Create a class 'Rectangle' with private length and width. Include a public constructor and a method 'getArea()' that returns the area.", starterCode: "#include <iostream>\nusing namespace std;\n\n// Define Rectangle class here\n\nint main() {\n    // Test your class here\n    return 0;\n}" },
      { prompt: "Create a base class 'Animal' with a virtual method 'speak()'. Create a derived class 'Dog' that overrides 'speak()' to print 'Woof'.", starterCode: "#include <iostream>\nusing namespace std;\n\n// Define classes here\n\nint main() {\n    // Test here\n    return 0;\n}" },
      { prompt: "Write a class 'Counter' with a static integer variable 'count'. Increment 'count' in the constructor and write a static method to return it.", starterCode: "#include <iostream>\nusing namespace std;\n\n// Define Counter class here\n\nint main() {\n    // Test here\n    return 0;\n}" }
    ]
  },
  "linked_lists": {
    mcqsPool: [
      { question: "What does each node in a singly linked list contain?", options: ["Data only", "Data and pointer to previous node", "Data and pointer to next node", "Two pointers"], answer: 2 },
      { question: "What is the time complexity of inserting a node at the head of a linked list?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 0 },
      { question: "In a doubly linked list, what does the 'prev' pointer of the head node point to?", options: ["The tail node", "nullptr", "The second node", "Itself"], answer: 1 },
      { question: "What defines a circular linked list?", options: ["It has no head", "The last node points back to the head", "It uses double pointers", "It forms a tree"], answer: 1 },
      { question: "To delete the head node, what must you do first?", options: ["Delete it immediately", "Store the next node in a temporary pointer", "Traverse to the end", "Set data to 0"], answer: 1 },
      { question: "Which algorithm is best for finding the middle of a linked list in one pass?", options: ["Binary Search", "Two Pointer (Slow & Fast)", "Bubble Sort", "DFS"], answer: 1 },
      { question: "How do you detect a cycle in a linked list?", options: ["Floyd’s Cycle-Finding Algorithm", "Dijkstra's Algorithm", "Kruskal's Algorithm", "Linear Search"], answer: 0 },
      { question: "Why is a linked list preferred over an array?", options: ["Faster access time", "Dynamic size and O(1) insertions/deletions at known positions", "Uses less memory", "Contiguous memory"], answer: 1 },
      { question: "What happens if you lose the reference to the head of a linked list?", options: ["The list shrinks", "The memory is leaked and list is lost", "It loops forever", "Nothing"], answer: 1 },
      { question: "In a singly linked list, how do you traverse backward?", options: ["Use the prev pointer", "You cannot traverse backward directly", "Use array indexing", "Use head->back"], answer: 1 }
    ],
    codingPool: [
      { prompt: "Write a function to insert a new node at the HEAD of a singly linked list.", starterCode: "#include <iostream>\nusing namespace std;\nstruct Node { int data; Node* next; Node(int d): data(d), next(nullptr){} };\n\nvoid insertAtHead(Node*& head, int val) {\n    // Write logic here\n}\n\nint main() { return 0; }" },
      { prompt: "Write a function to find and return the MIDDLE node of a linked list using the slow/fast pointer technique.", starterCode: "#include <iostream>\nusing namespace std;\nstruct Node { int data; Node* next; Node(int d): data(d), next(nullptr){} };\n\nNode* findMiddle(Node* head) {\n    // Write logic here\n    return nullptr;\n}\n\nint main() { return 0; }" },
      { prompt: "Write a function to reverse a singly linked list and return the new head.", starterCode: "#include <iostream>\nusing namespace std;\nstruct Node { int data; Node* next; Node(int d): data(d), next(nullptr){} };\n\nNode* reverseList(Node* head) {\n    // Write logic here\n    return nullptr;\n}\n\nint main() { return 0; }" }
    ]
  },
  "stacks_queues": {
    mcqsPool: [
      { question: "What principle does a Stack follow?", options: ["FIFO", "LIFO", "FILO", "Both B and C"], answer: 3 },
      { question: "What principle does a Queue follow?", options: ["FIFO", "LIFO", "Random", "Priority"], answer: 0 },
      { question: "Which operation removes an element from a Stack?", options: ["push()", "pop()", "dequeue()", "remove()"], answer: 1 },
      { question: "Where are elements inserted in a standard Queue?", options: ["Front", "Middle", "Rear (Back)", "Top"], answer: 2 },
      { question: "What is a double-ended queue commonly called?", options: ["Dequeue", "Deque", "Dual-queue", "Biqueue"], answer: 1 },
      { question: "Which data structure is typically used to evaluate postfix expressions?", options: ["Queue", "Tree", "Stack", "Graph"], answer: 2 },
      { question: "In a circular queue implemented with an array, how do you calculate the next rear position?", options: ["rear + 1", "(rear + 1) % size", "rear % size", "rear * 2"], answer: 1 },
      { question: "Breadth-First Search (BFS) uses which data structure?", options: ["Stack", "Queue", "Priority Queue", "Linked List"], answer: 1 },
      { question: "Depth-First Search (DFS) typically uses which data structure?", options: ["Stack", "Queue", "Hash Map", "Deque"], answer: 0 },
      { question: "How can you implement a Queue using Stacks?", options: ["You need 1 stack", "You need 2 stacks", "You need 3 stacks", "Impossible"], answer: 1 }
    ],
    codingPool: [
      { prompt: "Implement the 'push' and 'pop' methods for a Stack using a standard array.", starterCode: "#include <iostream>\nusing namespace std;\n\nclass Stack {\n    int arr[100];\n    int topIndex;\npublic:\n    Stack() { topIndex = -1; }\n    void push(int x) { /* Implement */ }\n    void pop() { /* Implement */ }\n};\n\nint main() { return 0; }" },
      { prompt: "Implement the 'enqueue' method for a Queue using a linked list.", starterCode: "#include <iostream>\nusing namespace std;\nstruct Node { int data; Node* next; Node(int d): data(d), next(nullptr){} };\n\nclass Queue {\n    Node *front, *rear;\npublic:\n    Queue() { front = rear = nullptr; }\n    void enqueue(int x) { /* Implement */ }\n};\n\nint main() { return 0; }" },
      { prompt: "Write a function that uses a std::stack to reverse a given string.", starterCode: "#include <iostream>\n#include <stack>\n#include <string>\nusing namespace std;\n\nstring reverseString(string s) {\n    // Use stack to reverse 's'\n    return \"\";\n}\n\nint main() { return 0; }" }
    ]
  },
  "trees_heaps": {
    mcqsPool: [
      { question: "In a Binary Tree, what is the maximum number of children a node can have?", options: ["1", "2", "3", "Unlimited"], answer: 1 },
      { question: "What is the defining property of a Binary Search Tree (BST)?", options: ["All leaves are at the same level", "Left child < Root < Right child", "Root is greater than all children", "It is completely balanced"], answer: 1 },
      { question: "Which traversal of a BST visits nodes in sorted (ascending) order?", options: ["Pre-order", "In-order", "Post-order", "Level-order"], answer: 1 },
      { question: "What defines a Max Heap?", options: ["Root is the smallest element", "Every parent is greater than or equal to its children", "It is an unbalanced tree", "Left child is always greater than right child"], answer: 1 },
      { question: "What is the time complexity to insert into a balanced BST?", options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"], answer: 2 },
      { question: "In array representation of a 0-indexed heap, what is the left child of node 'i'?", options: ["2*i", "2*i + 1", "2*i + 2", "i / 2"], answer: 1 },
      { question: "Which STL container is usually implemented as a Heap?", options: ["std::map", "std::set", "std::priority_queue", "std::vector"], answer: 2 },
      { question: "What type of tree balances itself automatically (e.g., AVL, Red-Black)?", options: ["Complete Binary Tree", "Self-Balancing BST", "Spanning Tree", "Trie"], answer: 1 },
      { question: "Which traversal visits the Root first, then Left, then Right?", options: ["In-order", "Pre-order", "Post-order", "Level-order"], answer: 1 },
      { question: "What is the height of a tree with a single node?", options: ["0 or 1 (depending on convention)", "-1", "2", "Undefined"], answer: 0 }
    ],
    codingPool: [
      { prompt: "Write an In-order traversal function for a Binary Tree.", starterCode: "#include <iostream>\nusing namespace std;\nstruct Node { int data; Node *left, *right; Node(int d): data(d), left(nullptr), right(nullptr){} };\n\nvoid inorder(Node* root) {\n    // Implement inorder traversal\n}\n\nint main() { return 0; }" },
      { prompt: "Write a function to insert a new value into a Binary Search Tree (BST).", starterCode: "#include <iostream>\nusing namespace std;\nstruct Node { int data; Node *left, *right; Node(int d): data(d), left(nullptr), right(nullptr){} };\n\nNode* insert(Node* root, int val) {\n    // Implement BST insertion\n    return root;\n}\n\nint main() { return 0; }" },
      { prompt: "Write a function that calculates the height (max depth) of a Binary Tree.", starterCode: "#include <iostream>\n#include <algorithm>\nusing namespace std;\nstruct Node { int data; Node *left, *right; Node(int d): data(d), left(nullptr), right(nullptr){} };\n\nint height(Node* root) {\n    // Implement height calculation\n    return 0;\n}\n\nint main() { return 0; }" }
    ]
  },
  "graphs": {
    mcqsPool: [
      { question: "What is a Graph?", options: ["A linear data structure", "A collection of nodes (vertices) and edges", "A tree with a single root", "An array of linked lists"], answer: 1 },
      { question: "Which representation is best for a dense graph?", options: ["Adjacency List", "Adjacency Matrix", "Edge List", "Hash Map"], answer: 1 },
      { question: "Which algorithm finds the shortest path from a single source in a weighted graph without negative cycles?", options: ["Kruskal's", "Dijkstra's", "DFS", "Prim's"], answer: 1 },
      { question: "What data structure is essential for implementing Breadth-First Search (BFS)?", options: ["Stack", "Priority Queue", "Queue", "Deque"], answer: 2 },
      { question: "What algorithm is used to find a Minimum Spanning Tree (MST)?", options: ["Bellman-Ford", "Floyd-Warshall", "Kruskal's", "Topological Sort"], answer: 2 },
      { question: "Which algorithm can detect a negative weight cycle?", options: ["Dijkstra's", "BFS", "Bellman-Ford", "DFS"], answer: 2 },
      { question: "Topological sorting is only possible on what kind of graph?", options: ["Directed Acyclic Graph (DAG)", "Undirected Graph", "Cyclic Graph", "Bipartite Graph"], answer: 0 },
      { question: "What does the Union-Find (Disjoint Set) data structure help optimize?", options: ["Shortest path", "Cycle detection / Kruskal's MST", "Topological sort", "BFS"], answer: 1 },
      { question: "What is the time complexity of DFS using an Adjacency List?", options: ["O(V + E)", "O(V^2)", "O(E^2)", "O(V log E)"], answer: 0 },
      { question: "A graph where you can reach any vertex from any other vertex is called:", options: ["Bipartite", "Directed", "Connected", "Acyclic"], answer: 2 }
    ],
    codingPool: [
      { prompt: "Implement Breadth-First Search (BFS) traversal starting from node 0.", starterCode: "#include <iostream>\n#include <vector>\n#include <queue>\nusing namespace std;\n\nvoid bfs(int start, vector<int> adj[], int V) {\n    // Implement BFS\n}\n\nint main() { return 0; }" },
      { prompt: "Implement Depth-First Search (DFS) recursive traversal.", starterCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nvoid dfs(int node, vector<int> adj[], vector<bool>& visited) {\n    // Implement DFS\n}\n\nint main() { return 0; }" },
      { prompt: "Write the 'find' function for a Disjoint Set Union (DSU) with path compression.", starterCode: "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint parent[100];\nint find(int x) {\n    // Implement find with path compression\n    return x;\n}\n\nint main() { return 0; }" }
    ]
  }
};

router.get('/:topicId', (req, res) => {
  const { topicId } = req.params;
  const examPool = masteryExams[topicId] || masteryExams["fundamentals"]; 
  
  const randomizedExam = {
      mcqs: getRandomElements(examPool.mcqsPool, Math.min(8, examPool.mcqsPool.length)),
      codingChallenges: getRandomElements(examPool.codingPool, Math.min(2, examPool.codingPool.length))
  };
  
  res.status(200).json(randomizedExam);
});

module.exports = router;