## What is O(n)sight?

Most AI educational tools are just thin wrappers around a chat API. **O(n)sight** is a fully integrated, full-stack educational platform designed specifically for mastering Data Structures and Algorithms. It treats the AI, the backend architecture, and the frontend user experience as equal pillars.

### The AI Engine
At its core runs a highly optimized, fine-tuned Small Language Model (SLM). Instead of outputting generic conversational text, the model is strictly constrained via QLoRA to output distinct structural formats: 
* **Concept Breakdowns:** Clean, readable Markdown.
* **Visualizations:** Mermaid.js syntax for rendering trees, graphs, and logic flows.
* **Interactive Testing:** Strict JSON objects for multiple-choice quizzes.

The model is hardware-agnostic, designed to run efficiently on local consumer hardware (requiring as little as 4GB of VRAM) via GGUF quantization, or hosted remotely via a cloud notebook API tunnel (e.g., Google Colab T4 instances).

### The Web Architecture & Dynamic UI
The true power of O(n)sight lies in the web pipeline that parses the model's output in real-time and manages the user's learning state.

**1. Backend Context Injection (The Loop)**
When a user asks a question, the backend intercepts the request and retrieves data from two sources:
* **Vector Database:** Retrieves semantic embeddings of past conversations to maintain chat history.
* **Standard Database:** Retrieves numerical performance metrics on specific DSA topics.

The backend compiles this data into a hidden system prompt. The model processes the prompt and factors the user's specific weaknesses into its output calculation.

**2. Frontend Rendering & State Management**
The frontend receives the AI's response and dynamically renders the UI based on the syntax. It intercepts ` ```mermaid ` blocks to draw interactive SVG flowcharts on the fly, and it parses ` ```json ` blocks to construct state-managed quiz components.

---

### Data Contracts & System Schemas

To maintain strict communication between the AI, the frontend, and the database, O(n)sight relies on rigid data schemas. 

#### 1. Analytics Schema (Backend Database)
When a user completes a quiz on the frontend, the result is sent to the backend and stored to track weaknesses. 
```json
{
  "user_id": "usr_98765",
  "topic_id": "graphs_dijkstra",
  "topic_name": "Dijkstra's Algorithm",
  "performance_metrics": {
    "total_attempts": 4,
    "average_score": 65.0,
    "last_score": 80.0
  },
  "status": "needs_review"
}
