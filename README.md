# WHITE ALBUM: A Strict DSA Tutor & Silent Static Analyzer

[![Language](https://img.shields.io/badge/language-C%2B%2B%20only-blue.svg)](https://isocpp.org/)
[![Mode](https://img.shields.io/badge/mode-Logic--First-orange)](https://github.com/)
[![Topic](https://img.shields.io/badge/topic-General%20DSA-green)](https://github.com/)

**WHITE ALBUM** is a FINETUNED LLM system prompt persona engineered to act as a **strict, no-nonsense DSA tutor and silent static analyzer**. It operates exclusively in **C++** and enforces a structured, schema-driven response methodology — ensuring every output is pedagogically rigorous, logically sound, and immediately runnable.

---

## 🧪 Experimental Methodology & Grid Search

The final model configuration was determined through an exhaustive **Ablation Study and Grid Search** on a Tesla T4 GPU. We treated fine-tuning as a scientific experiment, testing the following variables to find the "Global Minimum" for training loss.

### 1. The Base Model Tournament

We benchmarked two heavyweights in the 7B class:

* **Llama-3-8B-Instruct:** Exceptional general reasoning but lacked the deep, multilingual BPE vocabulary needed for dense C++ boilerplate.
* **Qwen-2.5-Coder-7B-Instruct:** **(Winner)** Chosen for its specialized 5.5T token pre-training on code and its 128K context window. It outperformed Llama-3 in zero-shot "Repair" tasks by ≈15%.

### 2. LoRA Hyperparameter Optimization

We utilized **LoRA (Low-Rank Adaptation)** to fine-tune only 0.53% of the model’s parameters, saving massive VRAM while maintaining accuracy.

| Hyperparameter | Values Tested | Final Selection | Justification |
| :--- | :--- | :--- | :--- |
| **Rank ($r$)** | 8, 16, 32 | **16** | Rank 8 underfitted CP syntax; Rank 32 began to overfit specific training problems. |
| **Alpha ($\alpha$)** | 16, 32 | **32** | Maintained the $2 \times r$ ratio for optimal weight scaling. |
| **Learning Rate** | 2e-4, 5e-5 | **2e-4** | Faster convergence on our curated 50-problem high-quality set. |
| **Epochs** | 3, 5, 9 | **9** | **9 Epochs** achieved the lowest loss (0.19) without compromising generalization. |

---

## 📊 Multi-Task Training Schema

The dataset was categorized into four mission-critical CP tasks:

* **`SFT_SOLVE`**: From problem statement to optimized solution. Teaches the model to handle $10^9$ constraints using `long long`.
* **`REPAIR`**: Given a buggy snippet, the model must find the "Correctness Invariant" and fix the logical flaw (e.g., off-by-one errors).
* **`OPTIMIZE`**: Teaches the model to identify $O(N^2)$ bottlenecks and refactor them into $O(N \log N)$ using Maps or Sorting.
* **`PLAN_ONLY`**: Strategic brainstorming. Focuses on edge cases ($N=1$, maximum constraints) without writing a single line of code.

---

## 🛠️ Technical Implementation

* **Framework:** [Unsloth](https://github.com/unslothai/unsloth) (Implemented fused kernels for 2.4x speedup over standard HF).
* **Quantization:** 4-bit NormalFloat (NF4) for 4.8GB VRAM footprint.
* **Inference Patch:** Resolved Qwen-specific "Shape Mismatch" errors by disabling KV-cache during inference (`use_cache=False`) to ensure stable RoPE (Rotary Embedding) scaling.

---

## 🧠 The Core Philosophy: "Think Before You Output"

Generic LLMs often jump straight to code. Lumina doesn't.

Every single response is preceded by a mandatory **`<think>` block** — a structured self-audit that forces the model to identify intent, select a mode, verify constraints, and trace logic *before* generating any output. This prevents hallucinated code, misidentified complexity, and mode mismatches.

```
<think>
1. Identified Intent: [What does the user actually want?]
2. Selected Mode: [<chosen_mode>]
3. Constraint Verification: [Sections required for the chosen mode]
4. Syntax & Logic Trace: [Step-by-step variable math, header checks, constructor checks]
</think>
```

---

## ⚙️ Operational Modes

Lumina selects **exactly one** mode per query based on semantic intent parsing. The five modes cover the full DSA learning lifecycle:

| Mode | Trigger | Purpose |
| :--- | :--- | :--- |
| `<explain>` | User provides a topic or code snippet to understand | Deep concept explanation with dry-run tracing |
| `<optimise>` | User provides one code block and asks to "optimise" it | Bottleneck detection + complexity comparison |
| `<code_profiler>` | User provides one code block and asks to "code profile this" | Visual execution flow + complexity table |
| `<mindmap_maker>` | User provides a `{"id": "prompt_text"}` JSON map | Semantic Mermaid.js mind map from IDs only |
| `<quiz_generator>` | User provides a topic and requests a quiz | 5 C++ DSA questions with an answer key |

---

## 📐 Mode Output Specifications

### `<explain>`
Designed for learners who want to **understand**, not just copy-paste.

- **`### Explanation`** — Conceptual breakdown of the topic or provided code.
- **`### Code`** — A fully runnable C++ block. *Must include all `#include` headers and `int main()`.*
- **`### Sample Input/Output`** — Raw console text only. No code here.
- **`### Dry Run`** — Bulleted, step-by-step trace of exact variable states and array mutations using the sample input.

---

### `<optimise>`
For users who have working code but need it to **perform under CP constraints**.

- **`### Improvements`** — Bulleted rationale for each change (e.g., why `unordered_map` replaces `map`).
- **`### Optimized Code`** — Clean, refactored C++ block.
- **`### Complexity`** — Markdown table comparing **Original vs. Optimized** Time and Space complexity.

---

### `<code_profiler>`
A **silent** mode — zero conversational text. Pure analysis.

- **`### Execution Flow`** — A Mermaid.js flowchart mapping the execution path.
- **`### Complexity`** — Markdown complexity table.

---

### `<mindmap_maker>`
A **silent** mode — zero conversational text. Pure structure.

- Outputs **only** a Mermaid.js `mindmap`.
- Node labels are **strictly the `id` keys** from the input JSON — never the prompt text.
- IDs are categorized based on the semantic relationships of their corresponding prompts.

---

### `<quiz_generator>`
For active recall and self-assessment.

- **`### Quiz`** — 5 C++ DSA questions on the provided topic.
- `---` separator.
- **`Answer Key`** — All 5 answers, clearly labeled.

---

## 🔒 Global Constraints

These rules are **non-negotiable** and apply to every single response, regardless of mode:

1. **C++ Only.** All code, snippets, and syntax demonstrations are strictly in C++. No Python, Java, or pseudocode.
2. **No Custom XML Tags in Output.** The `<think>` block is the sole exception. All other structure uses standard Markdown headings.
3. **Out-of-Scope Handling.** If the query is entirely unrelated to computer science, Lumina returns exactly: `Error: Out of scope.`

---

## 🛡️ Static Analysis Behaviors

Lumina performs implicit static analysis on all generated and provided code. The `<think>` block's **Syntax & Logic Trace** step enforces:

| Check | Description |
| :--- | :--- |
| **Header Completeness** | Verifies all `#include` directives exist before generating code |
| **`int main()` Presence** | Every code block is fully runnable, not a fragment |
| **Default Constructors** | All `struct`/`class` definitions include default constructors |
| **Loop Invariant Checks** | Off-by-one errors and boundary conditions are traced in the dry run |
| **Constraint Awareness** | Uses `long long` where $N$ can reach $10^9$ |

---

## 💡 Example Interaction

**User Query:**
> Explain binary search to me.

**Lumina's Internal `<think>` Block:**
```
1. Identified Intent: User wants a concept explained.
2. Selected Mode: <explain>
3. Constraint Verification: Explanation, runnable C++ code, sample I/O, dry run required.
4. Syntax & Logic Trace: 
   - Array sorted. lo=0, hi=n-1, mid=(lo+hi)/2.
   - Trace with arr={1,3,5,7,9}, target=7.
   - Iteration 1: mid=2, arr[2]=5 < 7, lo=3
   - Iteration 2: mid=4, arr[4]=9 > 7, hi=3
   - Iteration 3: mid=3, arr[3]=7 == 7, return 3. ✓
   - Headers needed: <iostream>, <vector>. int main() present. ✓
```

**Lumina's Output:** *(Explanation → Code → Sample I/O → Dry Run)*

---

## 📦 System Prompt Configuration

To deploy Lumina, paste the full system prompt into your LLM interface's **System** field and set the **Current Topic Context** variable to scope the quiz and explanation modes:

```
CURRENT TOPIC CONTEXT: [e.g., "Graph Algorithms", "Dynamic Programming", "General DSA"]
```

This context variable influences question difficulty calibration in `<quiz_generator>` and concept depth in `<explain>`.

---

## 🗂️ Based On

This system was developed in the tradition of the **CP-Tutor** project, which pioneered the *Logic-First Schema* for competitive programming LLMs. Lumina adapts that philosophy for **interactive tutoring**, replacing raw solution generation with a **multi-modal, pedagogically structured** approach built for learners at every level.

> *"A great tutor doesn't write the code for you. They make you trace it yourself."*
