import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import TerminalChat from './components/TerminalChat'
import CodeWorkspace from './components/CodeWorkspace'
import QuizModal from './components/QuizModal';
import ExamModal from './components/ExamModal';
import ReadingMaterial from './components/ReadingMaterial';
import useChatResizer from "./hooks/useChatResizer";
import './FocusRoom.css'
import MermaidViewer from './MermaidViewer';

const evaluateMasteryCode = async (userCode, challengePrompt) => {
  const graderPrompt = `[SYSTEM COMMAND: Activate <code_grader> mode. Evaluate the following C++ code.
Challenge: ${challengePrompt}
Rules: 
1. Check if the logic is correct.
2. Ignore minor syntax errors if the core logic is perfectly sound.
3. Return ONLY a valid JSON object. No markdown, no backticks, no explanations outside the JSON.
Format: {"passed": true/false, "feedback": "1 sentence explanation"} ]

Code to evaluate:
${userCode}`;

  try {
    const response = await fetch('http://localhost:5000/api/compiler/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: "Mastery Evaluation",
        history: [{ role: 'user', text: graderPrompt }]
      })
    });

    const data = await response.json();
    let reply = data.reply.trim();

    if (reply.startsWith("```json")) {
      reply = reply.replace(/```json/g, "").replace(/```/g, "").trim();
    } else if (reply.startsWith("```")) {
      reply = reply.replace(/```/g, "").trim();
    }

    const grade = JSON.parse(reply);
    return grade;

  } catch (error) {
    console.error("Grading failed:", error);
    return { passed: false, feedback: "System Error: Failed to connect to the grading engine." };
  }
};

export default function FocusRoom({ levelUp }) {
  const { topicId } = useParams()
  const navigate = useNavigate()

  const [topicData, setTopicData] = useState(null);
  const storedId = localStorage.getItem('WHITE ALBUM_user_id');
  const [userPfp, setUserPfp] = useState(localStorage.getItem(`WHITE ALBUM_pfp_${storedId}`) || "");
  const [userName, setUserName] = useState(""); 
  const [isGearHovered, setIsGearHovered] = useState(false);

  useEffect(() => {
    if (storedId) {
      fetch(`http://localhost:5000/api/users/${storedId}`)
        .then(res => res.json())
        .then(data => setUserName(data.name || ""))
        .catch(err => console.error("Failed to fetch user for PFP", err));
    }
  }, [storedId]);

  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [examData, setExamData] = useState(null);
  const [mcqAnswers, setMcqAnswers] = useState({});
  const [examCodes, setExamCodes] = useState({});
  const [isGrading, setIsGrading] = useState(false);
  const [examResult, setExamResult] = useState(null);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);

  const curriculumMap = {
    "fundamentals": ["Basic Syntax", "Data Types", "Control Flow"],
    "arrays_strings": ["1D Arrays", "2D Arrays", "String Manipulation"],
    "memory_pointers": ["Pointer Basics", "Dynamic Allocation", "Smart Pointers"],
    "oop": ["Oops Basic", "Oops Four Pillar", "Oops And Pointers"],
    "linked_lists": ["Singly Linked List", "Doubly Linked List", "Circular Linked List"],
    "stacks_queues": ["Stack", "Queues", "Advanced Queues"],
    "trees_heaps": ["Tree Basics", "Binary Search Tree", "Heaps"],
    "graphs": ["Graphs", "Graph Algorithms", "Advanced Graph"]
  }

  const defaultCode = {
    "Basic Syntax": "#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello from C++!\" << endl;\n    return 0;\n}",
    "Data Types": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int a = 100;\n    float b = 3.14159f;\n    char d = 'X';\n    bool e = true;\n    return 0;\n}",
    "Control Flow": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 18;\n    if (age >= 18) cout << \"You are an adult.\" << endl;\n    return 0;\n}",
    "1D Arrays": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int scores[5] = {90, 85, 78, 92, 88};\n    for (int i = 0; i < 5; i++) cout << scores[i] << endl;\n    return 0;\n}",
    "2D Arrays": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int matrix[2][2] = {{1, 2}, {3, 4}};\n    cout << matrix[0][0] << endl;\n    return 0;\n}",
    "String Manipulation": "#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string str = \"Hello\";\n    cout << str << endl;\n    return 0;\n}",
    "Pointer Basics": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int x = 42;\n    int* ptr = &x;\n    cout << *ptr << endl;\n    return 0;\n}",
    "Dynamic Allocation": "#include <iostream>\nusing namespace std;\n\nint main() {\n    int* dynArray = new int[5];\n    delete[] dynArray;\n    return 0;\n}",
    "Smart Pointers": "#include <iostream>\n#include <memory>\nusing namespace std;\n\nint main() {\n    unique_ptr<int> p = make_unique<int>(42);\n    return 0;\n}",
    "Oops Basic": "#include <iostream>\nusing namespace std;\n\nclass Car {\npublic:\n    string model;\n    void drive() { cout << model << \" is driving\" << endl; }\n};\n\nint main() { return 0; }",
    "Oops Four Pillar": "#include <iostream>\nusing namespace std;\n\nclass BankAccount {\nprivate:\n    double balance;\npublic:\n    void deposit(double amount) { if(amount > 0) balance += amount; }\n};\n\nint main() { return 0; }",
    "Oops And Pointers": "#include <iostream>\nusing namespace std;\n\nclass Base { public: virtual void show() { cout << \"Base\"; } };\nclass Derived : public Base { public: void show() override { cout << \"Derived\"; } };\n\nint main() { return 0; }",
    "Singly Linked List": "#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}\n};\n\nint main() { return 0; }",
    "Doubly Linked List": "#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* prev;\n    Node* next;\n    Node(int val) : data(val), prev(nullptr), next(nullptr) {}\n};\n\nint main() { return 0; }",
    "Circular Linked List": "#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* next;\n    Node(int d) : data(d), next(nullptr) {}\n};\n\nint main() { return 0; }",
    "Stack": "#include <stack>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    stack<int> s;\n    s.push(10);\n    return 0;\n}",
    "Queues": "#include <queue>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    queue<int> q;\n    q.push(10);\n    return 0;\n}",
    "Advanced Queues": "#include <deque>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    deque<int> dq;\n    dq.push_front(10);\n    return 0;\n}",
    "Tree Basics": "#include <iostream>\nusing namespace std;\n\nstruct Node {\n    int data;\n    Node* left;\n    Node* right;\n    Node(int val) : data(val), left(nullptr), right(nullptr) {}\n};\n\nint main() { return 0; }",
    "Binary Search Tree": "struct Node {\n    int data;\n    Node *left, *right;\n};\n\nNode* insert(Node* root, int val) {\n    // BST insertion logic\n    return root;\n}",
    "Heaps": "#include <queue>\nusing namespace std;\n\nint main() {\n    priority_queue<int, vector<int>, greater<int>> minHeap;\n    return 0;\n}",
    "Graphs": "#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int V = 5;\n    vector<int> adj[V];\n    return 0;\n}",
    "Graph Algorithms": "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid dijkstra(int V, vector<pair<int,int>> adj[], int src) {\n    // Shortest path logic\n}",
    "Advanced Graph": "#include <vector>\nusing namespace std;\n\nclass DSU {\n    vector<int> parent;\npublic:\n    DSU(int n) { /* Initialization */ }\n};\n"
  }

  const moduleSubtopics = curriculumMap[topicId] || ["General Analysis"]

  const [activeSubtopic, setActiveSubtopic] = useState(moduleSubtopics[0])

  const [workspaces, setWorkspaces] = useState(() => {
    const savedData = localStorage.getItem(`WHITE ALBUM_data_${topicId}`);
    if (savedData) return JSON.parse(savedData);
    return {
      [moduleSubtopics[0]]: {
        code: defaultCode[moduleSubtopics[0]] || "// Write C++ logic here...",
        threads: [{ id: 1, title: "Thread 1 (General)", messages: [{ role: 'ai', text: `[SYSTEM] Workspace: ${moduleSubtopics[0].toUpperCase()}\n\nReady.` }] }],
        activeThreadId: 1
      }
    };
  });

  useEffect(() => {
    localStorage.setItem(`WHITE ALBUM_data_${topicId}`, JSON.stringify(workspaces));
  }, [workspaces, topicId]);

  useEffect(() => {
    const fetchTopicData = async () => {
      try {
        const url = `http://localhost:5000/api/curriculum/${encodeURIComponent(activeSubtopic)}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          setTopicData(data);
        } else {
          setTopicData(null);
        }
      } catch (error) {
        console.error("Failed to fetch curriculum data:", error);
        setTopicData(null);
      }
    };

    fetchTopicData();
  }, [activeSubtopic]);

  const currentSpace = workspaces[activeSubtopic] || { code: "// Loading...", threads: [], activeThreadId: 1 }

  const [whiteboardMode, setWhiteboardMode] = useState("reading")
  const [flowchartCode, setFlowchartCode] = useState("")
  const [isProfiling, setIsProfiling] = useState(false)
  const [chatScrollTrigger, setChatScrollTrigger] = useState(null)
  const [isZenMode, setIsZenMode] = useState(false)
  const [isZenChatOpen, setIsZenChatOpen] = useState(false)

  const { chatWidth, isResizingChat, setIsResizingChat, containerRef } = useChatResizer("40%");

  const handleProfileCode = async () => {
    setIsProfiling(true);
    setFlowchartCode("");

    const stealthMessage = `[SYSTEM COMMAND: Activate <code_profiler> mode. Output ONLY a valid Mermaid.js 'flowchart TD'.

CRITICAL RULES:
1. Translate the code logic into Plain English. Do NOT output raw C++ syntax (like 'for', 'cout', 'int', or '++').
2. Connect ALL nodes properly using '-->'. Create a continuous flow.
3. NEVER use quotes ("), parentheses (), brackets [], or math symbols (<, >) inside node labels.

EXAMPLE INPUT:
int n = 5;
for(int i=0; i<n; i++) { count++; }

EXAMPLE OUTPUT:
flowchart TD
  A[Set n to 5] --> B{Is i less than n}
  B -- Yes --> C[Increment count]
  C --> D[Increment i]
  D --> B
  B -- No --> E[End Loop]

Now analyze this code and follow the exact format above:
${currentSpace.code}]`;

    try {
      const response = await fetch('http://localhost:5000/api/compiler/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeSubtopic,
          history: [{ role: 'user', text: stealthMessage }]
        })
      });

      const data = await response.json();
      let extractedCode = data.reply || "";

      if (extractedCode.includes("```mermaid")) {
        extractedCode = extractedCode.split("```mermaid")[1].split("```")[0].trim();
      } else if (extractedCode.includes("```")) {
        extractedCode = extractedCode.split("```")[1].trim();
        if (extractedCode.startsWith("mermaid")) extractedCode = extractedCode.substring(7).trim();
      }

      if (!extractedCode.includes("graph") && !extractedCode.includes("flowchart")) {
        extractedCode = "flowchart TD\n  A[Error: Espada returned invalid format.]";
      }

      extractedCode = extractedCode.replace(/</g, ' less than ').replace(/([^-=])>/g, '$1 greater than ').replace(/["']/g, '').replace(/[()?]/g, '');
      setFlowchartCode(extractedCode);

    } catch (error) {
      console.error("Profiling failed:", error);
      setFlowchartCode("flowchart TD\n  A[Error: Profiling Engine Disconnected]");
    } finally {
      setIsProfiling(false);
    }
  };

  const generateThreadMap = () => {
    const activeThread = currentSpace.threads.find(t => t.id === currentSpace.activeThreadId);
    if (!activeThread) return `mindmap\n  root((Empty))`;

    let mapString = `mindmap\n  root((${activeThread.title.replace(/[\(\)]/g, '')}))\n`;
    const userMessages = activeThread.messages.filter(m => m.role === 'user');

    if (userMessages.length === 0) {
      mapString += `    ("No questions asked yet")\n`;
    } else {
      userMessages.forEach((msg, index) => {
        let cleanText = msg.text.substring(0, 30).replace(/["'\n\(\)\[\]\{\}]/g, '').trim();
        mapString += `    id${index}("Q${index + 1}: ${cleanText}...")\n`;
      });
    }
    return mapString;
  };

  const handleSubtopicChange = (newSub) => {
    if (!workspaces[newSub]) {
      setWorkspaces(prev => ({
        ...prev, [newSub]: {
          code: defaultCode[newSub] || "// Code...",
          threads: [{ id: 1, title: "Thread 1", messages: [{ role: 'ai', text: `[SYSTEM] Workspace: ${newSub.toUpperCase()}` }] }],
          activeThreadId: 1
        }
      }))
    }
    setActiveSubtopic(newSub)
    setWhiteboardMode('reading')
  }

  const handleCodeChange = (newCode) => setWorkspaces(prev => ({ ...prev, [activeSubtopic]: { ...prev[activeSubtopic], code: newCode } }))

  const handleUpdateSpace = (updatedSpace) => {
    setWorkspaces(prev => ({ ...prev, [activeSubtopic]: updatedSpace }))
  }

  const toggleZenMode = () => {
    setIsZenMode(!isZenMode)
    setIsZenChatOpen(false)
  }

  const handleGenerateQuiz = async () => {
    setIsQuizModalOpen(true);
    setIsGeneratingQuiz(true);
    setQuizData(null);
    setQuizAnswers({});
    setQuizScore(null);

    const quizPrompt = `[SYSTEM COMMAND: Activate <quiz_generator> mode. Generate exactly 5 multiple-choice questions based on this C++ topic: ${activeSubtopic}.
    Rules:
    1. Return ONLY a valid JSON array of objects. No markdown formatting, no backticks, no explanations.
    2. Format: [{"question": "...", "options": ["...", "...", "...", "..."], "answer": 0}, ...]
    3. "answer" must be the integer index (0-3) of the correct option.]`;

    try {
      const response = await fetch('http://localhost:5000/api/compiler/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: "Quiz Generation",
          history: [{ role: 'user', text: quizPrompt }]
        })
      });
      const data = await response.json();
      let reply = data.reply.trim();

      if (reply.startsWith("```json")) reply = reply.replace(/```json/g, "").replace(/```/g, "").trim();
      else if (reply.startsWith("```")) reply = reply.replace(/```/g, "").trim();

      setQuizData(JSON.parse(reply));
    } catch (error) {
      console.error("Failed to generate quiz:", error);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const submitAiQuiz = () => {
    let score = 0;
    quizData.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) score++;
    });
    setQuizScore(score);
  };

  const startExam = async () => {
    setIsTakingQuiz(true);
    setExamResult(null);
    setMcqAnswers({});
    setExamCodes({});

    try {
      const res = await fetch(`http://localhost:5000/api/exams/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setExamData(data);

        const initialCodes = {};
        data.codingChallenges.forEach((challenge, idx) => {
          initialCodes[idx] = challenge.starterCode;
        });
        setExamCodes(initialCodes);

      } else {
        console.error("Exam not found");
      }
    } catch (e) {
      console.error("Failed to fetch exam", e);
    }
  };

  const submitExam = async () => {
    if (!examData) return;

    let mcqPassed = true;
    for (let i = 0; i < examData.mcqs.length; i++) {
      if (mcqAnswers[i] !== examData.mcqs[i].answer) {
        mcqPassed = false;
        break;
      }
    }

    if (!mcqPassed) {
      setExamResult({ passed: false, feedback: "You failed the Multiple Choice section. Review the module and try again." });
      return;
    }

    setIsGrading(true);
    let allPassed = true;
    let feedbackMessages = [];

    for (let i = 0; i < examData.codingChallenges.length; i++) {
      const grade = await evaluateMasteryCode(examCodes[i], examData.codingChallenges[i].prompt);
      if (!grade.passed) {
        allPassed = false;
        feedbackMessages.push(`Challenge ${i + 1}: ${grade.feedback}`);
      }
    }

    setIsGrading(false);

    if (allPassed) {
      setExamResult({ passed: true, feedback: "Ready to proceed." });
    } else {
      setExamResult({ passed: false, feedback: feedbackMessages.join(" | ") });
    }
  };

  const handlePassQuiz = async () => {
    const moduleOrder = [
      "fundamentals", "arrays_strings", "memory_pointers", "oop",
      "linked_lists", "stacks_queues", "trees_heaps", "graphs"
    ];

    const currentIndex = moduleOrder.indexOf(topicId);
    const nextNodeId = currentIndex !== -1 && currentIndex < moduleOrder.length - 1 
      ? moduleOrder[currentIndex + 1] 
      : null;

    const storedId = localStorage.getItem('WHITE ALBUM_user_id');

    try {
      await fetch('http://localhost:5000/api/users/level-up', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentNo: storedId,
          currentNodeId: topicId,
          nextNodeId: nextNodeId
        })
      });
    } catch (err) {
      console.error("Level up sync failed", err);
    }

    const levelRewards = { "fundamentals": 1, "arrays_strings": 2, "memory_pointers": 3, "oop": 4, "linked_lists": 5, "stacks_queues": 6, "trees_heaps": 7, "graphs": 8 };
    levelUp(levelRewards[topicId] || 1);
    navigate('/dashboard', { replace: true });
  }

  const modeTabs = ['reading', 'code', 'video', 'flowchart', 'mind map'];

  return (
    <div className="focus-layout" style={{ position: "relative" }}>

      <QuizModal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        isGenerating={isGeneratingQuiz}
        quizData={quizData}
        quizAnswers={quizAnswers}
        setQuizAnswers={setQuizAnswers}
        quizScore={quizScore}
        onSubmitQuiz={submitAiQuiz}
        activeSubtopic={activeSubtopic}
      />

      <ExamModal
        isOpen={isTakingQuiz}
        onClose={() => setIsTakingQuiz(false)}
        topicId={topicId}
        examData={examData}
        mcqAnswers={mcqAnswers}
        setMcqAnswers={setMcqAnswers}
        examCodes={examCodes}
        setExamCodes={setExamCodes}
        chatScrollTrigger={chatScrollTrigger}
        setChatScrollTrigger={setChatScrollTrigger}
        isGrading={isGrading}
        examResult={examResult}
        onSubmitExam={submitExam}
        onPassQuiz={handlePassQuiz}
      />

      <div className="top-nav">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <button className="logic-btn" onClick={() => navigate('/dashboard')} style={{ width: "auto" }}>◀ RETURN</button>
          <h2 className="nav-title" style={{ margin: 0 }}>MODULE <span style={{ color: "var(--accent)" }}>// {topicId.toUpperCase()}</span></h2>
        </div>

        {isZenMode && (
          <div style={{ display: "flex", gap: "8px", flex: 1, justifyContent: "center" }}>
            {modeTabs.map(mode => (
              <button key={mode} className={`logic-btn ${whiteboardMode === mode ? 'active' : ''}`} onClick={() => setWhiteboardMode(mode)} style={{ padding: "6px 12px", fontSize: "0.75rem", textTransform: "uppercase", background: whiteboardMode === mode ? 'var(--accent)' : 'transparent', color: whiteboardMode === mode ? 'var(--bg-color)' : 'var(--text-main)', borderColor: "var(--glass-border)" }}>
                {mode}
              </button>
            ))}
          </div>
        )}
        <div className="profile-area" style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <button className="logic-btn" onClick={startExam} style={{ width: "auto", padding: "8px 16px", borderColor: "#68d391", color: "#68d391" }}>TEST MASTERY</button>

          <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid var(--accent)", background: "var(--glass-border)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "var(--accent)", fontSize: "1.2rem", textTransform: "uppercase", overflow: "hidden" }}>
            {userPfp ? (
              <img src={userPfp} alt="Profile" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              userName ? userName.charAt(0) : "?"
            )}
          </div>

          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setIsGearHovered(true)}
            onMouseLeave={() => setIsGearHovered(false)}
          >
            <button
              onClick={() => navigate('/settings')}
              className="logic-btn"
              style={{ width: "35px", height: "35px", padding: 0, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", cursor: "pointer" }}
            >
              ⚙️
            </button>

            {isGearHovered && (
              <div style={{ position: "absolute", top: "100%", right: "0", paddingTop: "12px", zIndex: 150, minWidth: "160px" }}>
                <div style={{ backgroundColor: "var(--bg-color)", border: "1px solid var(--glass-border)", borderRadius: "8px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", display: "flex", flexDirection: "column" }}>
                  <button
                    onClick={() => navigate('/settings')}
                    style={{ background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", color: "var(--text-main)", padding: "12px 15px", textAlign: "left", cursor: "pointer", fontSize: "0.85rem", transition: "0.2s", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ✏️ Edit Profile
                  </button>
                  <button
                    onClick={() => { localStorage.removeItem('WHITE ALBUM_user_id'); navigate('/login'); }}
                    style={{ background: "transparent", border: "none", color: "#ef4444", padding: "12px 15px", textAlign: "left", cursor: "pointer", fontSize: "0.85rem", transition: "0.2s", display: "flex", alignItems: "center", gap: "8px" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="content-stage" ref={containerRef} style={{ display: "flex", flex: 1, height: "100%", overflow: "hidden" }}>
        <div className="whiteboard-zone" style={{ flex: 1, minWidth: 0, position: "relative" }}>

          {isZenMode && (
            <div style={{ position: "absolute", top: whiteboardMode === 'flowchart' ? "120px" : "20px", right: "20px", zIndex: 110, display: "flex", gap: "10px", alignItems: "center" }}>
              <button onClick={toggleZenMode} className="logic-btn" title="Exit FullScreen Mode" style={{ width: "45px", height: "45px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-color)", color: "var(--text-main)", border: "1px solid var(--glass-border)", boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>⤡</button>
              <button onClick={() => setIsZenChatOpen(!isZenChatOpen)} className="logic-btn" title="Toggle AI Interface" style={{ width: "45px", height: "45px", borderRadius: "50%", padding: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: isZenChatOpen ? "var(--accent)" : "var(--bg-color)", color: isZenChatOpen ? "var(--bg-color)" : "var(--accent)", border: `1px solid ${isZenChatOpen ? "var(--accent)" : "var(--glass-border)"}`, boxShadow: "0 4px 15px rgba(0,0,0,0.3)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </button>
            </div>
          )}

          {!isZenMode && (
            <div className="sticky-header-group">
              <div className="subtopic-bar">
                {moduleSubtopics.map((sub, index) => (
                  <button key={index} className={`subtopic-pill ${activeSubtopic === sub ? 'active' : ''}`} onClick={() => handleSubtopicChange(sub)}>{sub}</button>
                ))}
              </div>

              <div className="whiteboard-header">
                <div style={{ display: "flex", gap: "8px" }}>
                  {modeTabs.map(mode => (
                    <button key={mode} className={`logic-btn ${whiteboardMode === mode ? 'active' : ''}`} onClick={() => setWhiteboardMode(mode)} style={{ padding: "6px 12px", fontSize: "0.75rem", textTransform: "uppercase", background: whiteboardMode === mode ? 'var(--accent)' : 'transparent', color: whiteboardMode === mode ? 'var(--bg-color)' : 'var(--text-main)' }}>
                      {mode}
                    </button>
                  ))}
                </div>
                <button className={`logic-btn ${isZenMode ? 'active' : ''}`} onClick={toggleZenMode} title="Enter FullScreen Mode" style={{ padding: "6px 10px", fontSize: "1rem" }}>⤢</button>
              </div>
            </div>
          )}

          <div className="scrollable-content" style={{ padding: isZenMode ? "0" : "20px", overflowY: (whiteboardMode === 'flowchart' || whiteboardMode === 'mind map') ? 'hidden' : 'auto' }}>

            {whiteboardMode === 'code' && (
              <CodeWorkspace code={currentSpace.code} onCodeChange={handleCodeChange} isZenMode={isZenMode} chatWidth={chatWidth} />
            )}

            {whiteboardMode === 'reading' && (
              <ReadingMaterial
                topicData={topicData}
                activeSubtopic={activeSubtopic}
                isZenMode={isZenMode}
                onLoadCode={(code) => {
                  handleCodeChange(code);
                  setWhiteboardMode('code');
                }}
              />
            )}

            {whiteboardMode === 'video' && (
              <div style={{ display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", alignItems: "center" }}>
                <div style={{ width: "80%", aspectRatio: "16/9", background: "#000", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--glass-border)" }}>
                  <span style={{ color: "var(--text-muted)" }}>▶ YouTube Embed</span>
                </div>
              </div>
            )}

            {whiteboardMode === 'flowchart' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(0,0,0,0.1)", background: "var(--bg)", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                  <button
                    className="logic-btn"
                    onClick={handleProfileCode}
                    disabled={isProfiling}
                    style={{
                      width: "auto", padding: "6px 12px", fontSize: "0.75rem",
                      borderColor: isProfiling ? "gray" : "#68d391",
                      color: isProfiling ? "gray" : "#68d391",
                      cursor: isProfiling ? "not-allowed" : "pointer"
                    }}
                  >
                    {isProfiling ? "PROFILING..." : "▶ PROFILE CODE"}
                  </button>
                </div>

                <div style={{ flex: 1, position: 'relative', overflow: "hidden", padding: 0 }}>
                  {isProfiling ? (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--accent)", gap: "15px", fontFamily: "'Courier New', monospace" }}>
                      <span style={{ fontSize: "1.5rem", animation: "blink 1s step-end infinite" }}>█</span>
                      <span style={{ fontWeight: "bold", letterSpacing: "2px", textTransform: "uppercase", fontSize: "0.85rem" }}>Compiling logic map...</span>
                    </div>
                  ) : flowchartCode ? (
                    <div style={{ width: '100%', height: '100%' }}>
                      <MermaidViewer chartCode={flowchartCode} />
                    </div>
                  ) : (
                    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.6", fontFamily: "'Courier New', monospace", fontSize: "0.85rem" }}>
                      <span style={{ fontSize: "2rem", display: "block", marginBottom: "15px", opacity: 0.5 }}>{"{ }"}</span>
                      Awaiting input. Execute <strong style={{ color: "var(--text-main)" }}>PROFILE CODE</strong> to generate execution map.
                    </div>
                  )}
                </div>
              </div>
            )}

            {whiteboardMode === 'mind map' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <MermaidViewer
                    chartCode={generateThreadMap()}
                    onNodeClick={(clickedText) => {
                      const match = clickedText.match(/^Q(\d+):/);
                      if (match) {
                        const questionIndex = parseInt(match[1], 10) - 1;
                        setChatScrollTrigger({ index: questionIndex, time: Date.now() });

                        if (isZenMode && !isZenChatOpen) {
                          setIsZenChatOpen(true);
                        }
                      }
                    }}
                  />
                </div>
              </div>
            )}

          </div>
        </div>

        {!isZenMode && <div className="resizer-vertical" onMouseDown={() => { setIsResizingChat(true); document.body.style.cursor = 'col-resize'; }}></div>}

        {(!isZenMode || isZenChatOpen) && (
          <TerminalChat
            currentSpace={currentSpace}
            chatWidth={chatWidth}
            isZenMode={isZenMode}
            isZenChatOpen={isZenChatOpen}
            onUpdateSpace={handleUpdateSpace}
            onOpenMindMap={() => setWhiteboardMode('mind map')}
            onGenerateQuiz={handleGenerateQuiz}
            chatScrollTrigger={chatScrollTrigger}
            whiteboardMode={whiteboardMode}
          />
        )}

      </div>
    </div>
  )
}

