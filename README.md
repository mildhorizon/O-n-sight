# CP-Tutor: A Logic-First LLM for Competitive Programming

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![Unsloth](https://img.shields.io/badge/Unsloth-2.4x%20faster-orange)](https://github.com/unslothai/unsloth)

**CP-Tutor** is a specialized Large Language Model (LLM) engineered to act as a high-level mentor for Competitive Programming. Unlike standard coding assistants that prioritize "code-completion," CP-Tutor is fine-tuned to prioritize **algorithmic reasoning, memory safety, and time-complexity optimization**.

---

## 🚀 The Core Philosophy: "Logic Before Syntax"

Generic LLMs often provide "correct-looking" code that fails under strict execution limits (TLE/MLE). CP-Tutor solves this by enforcing a **Logic-First Schema**. The model is trained to output its response in a specific sequence:

1.  **Core Idea:** High-level algorithmic approach (e.g., Two Pointers, Segment Tree).
2.  **Steps:** A step-by-step breakdown of the implementation.
3.  **Data Structures:** Justification for chosen containers.
4.  **Complexity:** Rigorous $O(f(N))$ time and space analysis.
5.  **Final Code:** Clean, optimized C++17 implementation.

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

## 📥 Getting Started

### Local Deployment

To run CP-Tutor on your personal GPU, use the following Python snippet:

```python
from unsloth import FastLanguageModel
import torch

# Load the model (replace with your actual path)
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "qwen_cp_lora_model",  # or your fine-tuned checkpoint
    load_in_4bit = True,
    device_map = "auto"
)

# Inference must use use_cache=False for Qwen-2.5 stability
prompt = "Solve: Given an array of integers, find the maximum subarray sum."
inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
outputs = model.generate(
    **inputs,
    max_new_tokens=1024,
    use_cache=False  # critical for Qwen-2.5
)
print(tokenizer.decode(outputs[0], skip_special_tokens=True))
