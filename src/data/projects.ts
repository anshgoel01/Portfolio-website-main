export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  images: string[];
  tags: string[];
  techStack: string[];
  category: string;
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  features: string[];
  challenges: string[];
  metrics: {
    value: string;
    label: string;
    description?: string;
  }[];
  implementation: {
    approach: string;
    technologies: {
      name: string;
      reason: string;
    }[];
  };
  architecture?: string;
  documentation: Record<string, any>;
  repoNotes?: Record<string, any>;
}

export const projectsData: Project[] = [
  {
    id: "concord",
    title: "Concord",
    description: "A multi-agent research platform where a coordinated team of AI agents collaborates via LangGraph to turn a query into a structured, cited report.",
    fullDescription: "Built Concord, a multi-agent research platform on a 3-service microservice architecture (gateway, task-service, agent-orchestrator) that turns a single research query into a structured, cited report. A LangGraph StateGraph coordinates six specialized agents — Supervisor, Planner, Retriever, WebSearch, Analyst, and Writer — sharing a single typed state object, with Retriever and WebSearch running in parallel. Retrieval is backed by a PostgreSQL + pgvector RAG pipeline over sentence-transformer embeddings, combined with live web results from the Tavily API and reasoning from Groq's Llama 3.3 70B. Task status and the final report stream to a React frontend in real time via Server-Sent Events. Intelligent retry logic and intent-aware follow-up handling cut unnecessary LLM API calls by 65%, and the whole stack runs through Docker Compose.",
    image: "/projects/ss/concord.svg",
    images: ["/projects/ss/concord.svg"],
    tags: ["FastAPI", "LangGraph", "PostgreSQL", "pgvector", "React"],
    techStack: ["FastAPI", "LangGraph", "PostgreSQL", "pgvector", "Groq (Llama 3.3 70B)", "Tavily API", "sentence-transformers", "Docker Compose", "React", "Server-Sent Events"],
    category: "ai-ml",
    featured: true,
    githubUrl: "https://github.com/anshgoel01/MultiAgent",
    features: [
      "Multi-agent orchestration via a LangGraph StateGraph",
      "Parallel document retrieval (pgvector RAG) and live web search (Tavily)",
      "Shared typed state object merged automatically across parallel agent branches",
      "Real-time progress streaming to the frontend via SSE",
      "3-service microservice architecture, independently deployable via Docker Compose",
      "Optional CriticAgent feedback loop that routes back to retrieval when findings are thin",
      "Intelligent retry logic and intent-aware follow-up handling to cut redundant LLM calls"
    ],
    challenges: [
      "Coordinating agent execution order and shared state across parallel LangGraph branches",
      "Wiring a RAG pipeline (chunking, embedding, cosine search) on pgvector from scratch",
      "Streaming multi-stage task progress across service boundaries with SSE"
    ],
    metrics: [
      { value: "65%", label: "Fewer Redundant LLM Calls" },
      { value: "6", label: "Specialized Agents" },
      { value: "3", label: "Independent Microservices" }
    ],
    implementation: {
      approach: "Split the backend into gateway, task-service, and agent-orchestrator FastAPI services communicating over REST, each independently deployable via Docker. Agents are wired as nodes in a LangGraph StateGraph, reading and writing a shared ResearchState.",
      technologies: [
        { name: "LangGraph", reason: "Gives explicit control over agent execution order, parallel branches, and conditional feedback loops (e.g. Critic routing back to Retriever)." },
        { name: "pgvector", reason: "Enables cosine-similarity document retrieval directly in PostgreSQL without a separate vector database." },
        { name: "Groq", reason: "Low-latency inference for Llama 3.3 70B powers all reasoning agents." }
      ]
    },
    documentation: {
      setup: "Run via Docker Compose (postgres, task-service, agent-orchestrator, gateway); requires GROQ_API_KEY and TAVILY_API_KEY."
    }
  },
  {
    id: "project-verifier",
    title: "Project Verifier",
    description: "A full-stack verification platform with a real-time WebSocket leaderboard, automating validation of 12,000+ student submissions.",
    fullDescription: "Built Project Verifier (formerly VerifyHub), a full-stack verification platform with a real-time WebSocket leaderboard, automating validation of 12,000+ student submissions and reducing manual verification effort by over 90%. Developed serverless Deno Edge Functions with parallel async scraping and a custom Jaccard set-intersection fuzzy name-matching algorithm, achieving automated identity resolution across Coursera and LinkedIn. Secured backend against SSRF, IP spoofing, and JWT replay attacks via strict hostname allowlisting, user ID-based rate limiting, and idempotent DB update logic in a TypeScript/Supabase stack.",
    image: "/projects/ss/verifyhub.png",
    images: ["/projects/ss/verifyhub.png"],
    tags: ["React", "TypeScript", "Supabase", "PostgreSQL", "Deno"],
    techStack: ["React", "TypeScript", "Supabase", "PostgreSQL", "Deno Edge Functions", "WebSockets"],
    category: "web",
    featured: true,
    githubUrl: "https://github.com/anshgoel01/project_verify_main",
    liveUrl: "https://projectverifier.vercel.app/",
    features: [
      "Real-time WebSocket leaderboard",
      "Automated validation of 12,000+ submissions",
      "Deno Edge Functions for parallel scraping",
      "Custom Jaccard fuzzy name-matching",
      "Secure backend against common attacks",
      "Idempotent database update logic"
    ],
    challenges: [
      "Achieving high-speed automated identity resolution across multiple platforms",
      "Securing the backend against sophisticated network attacks",
      "Managing high-concurrency WebSocket connections for the leaderboard"
    ],
    metrics: [
      { value: "12,000+", label: "Submissions Validated" },
      { value: "90%", label: "Effort Reduction" },
      { value: "95%+", label: "Identity Resolution Accuracy" }
    ],
    implementation: {
      approach: "Used a TypeScript/Supabase stack for high reliability and speed. Leveraged Deno Edge Functions for performant, distributed scraping and name matching.",
      technologies: [
        { name: "Supabase", reason: "Provides a robust backend with built-in security and real-time capabilities." },
        { name: "Deno", reason: "Ideal for serverless edge functions with low latency." }
      ]
    },
    documentation: {
      setup: "Follow the standard Supabase and React setup instructions."
    }
  },
  {
    id: "distributed-cache-cpp",
    title: "Distributed Cache CPP",
    description: "A high-performance distributed cache in C++ achieving 682,000+ ops/sec with consistent hashing.",
    fullDescription: "Implemented consistent hashing with virtual nodes, reducing load imbalance by 85% across 10,000 keys. Integrated multi-threaded concurrent access using reader-writer locks and atomic counters, achieving 682,000+ ops/sec under 8-thread load with zero data races. Simulated node failure mid-operation with automatic key redistribution (3,312 keys redistributed), maintaining 1% imbalance and zero data loss across surviving nodes. Exposed live REST API via cpp-httplib.",
    image: "/projects/ss/cache.png",
    images: ["/projects/ss/cache.png"],
    tags: ["C++", "REST API", "Distributed Systems", "Multi-threading"],
    techStack: ["C++", "REST API (cpp-httplib)", "Consistent Hashing", "Atomic Counters", "Reader-Writer Locks"],
    category: "tools",
    featured: true,
    githubUrl: "https://github.com/Pratiikksha/distributed-cache-cpp",
    features: [
      "Consistent hashing with virtual nodes",
      "Multi-threaded concurrent access",
      "Zero data races via atomic counters",
      "Automatic node failure redistribution",
      "REST API interface",
      "High-performance operations (682k+ ops/sec)"
    ],
    challenges: [
      "Eliminating data races in a highly concurrent multi-threaded environment",
      "Implementing efficient consistent hashing that minimizes key redistribution",
      "Exposing a low-latency REST API for a high-performance system"
    ],
    metrics: [
      { value: "682,000+", label: "Ops/Sec" },
      { value: "85%", label: "Load Imbalance Reduction" },
      { value: "0", label: "Data Loss during Node Failure" }
    ],
    implementation: {
      approach: "Built using modern C++ with a focus on performance and safety. Used atomic operations and reader-writer locks for efficient synchronization.",
      technologies: [
        { name: "C++", reason: "Offers the necessary low-level control for high-performance memory management." },
        { name: "cpp-httplib", reason: "A simple and effective way to expose a REST API from C++." }
      ]
    },
    documentation: {
      setup: "Requires C++ compiler and cpp-httplib headers."
    }
  },
  {
    id: "safe-space",
    title: "Safe Space",
    description: "A multimodal AI system fusing physiological signals, facial expressions, and audio with 94.1% accuracy.",
    fullDescription: "Developed a multimodal stress detection system fusing physiological signals, facial expressions, audio, and survey data, achieving 94.1% accuracy on RAVDESS. Designed a novel Agreement-Aware Fusion (AAF) algorithm for dynamic, instance-level weighting of 4 deep learning model outputs, improving robustness over standard ensemble methods. Integrated a lightweight LLM (Phi-2) with OpenAI Whisper for real-time speech transcription and personalized mental health recommendations.",
    image: "/projects/ss/safespace.jpg",
    images: ["/projects/ss/safespace.jpg"],
    tags: ["Python", "TensorFlow", "PyTorch", "LLM", "Computer Vision"],
    techStack: ["Python", "TensorFlow", "PyTorch", "Phi-2 (LLM)", "OpenAI Whisper", "CNN", "DNN"],
    category: "ai-ml",
    featured: true,
    githubUrl: "https://github.com/anshgoel01/safe-space",
    features: [
      "Multimodal data fusion (audio, facial, physiological)",
      "Agreement-Aware Fusion (AAF) algorithm",
      "Real-time speech transcription",
      "Personalized mental health recommendations",
      "LLM integration (Phi-2)"
    ],
    challenges: [
      "Fusing heterogeneous data sources with different sampling rates and characteristics",
      "Achieving state-of-the-art accuracy in real-world conditions",
      "Deploying a multi-model pipeline including an LLM and transcription model"
    ],
    metrics: [
      { value: "94.1%", label: "Accuracy" },
      { value: "4", label: "Model Outputs Fused" }
    ],
    implementation: {
      approach: "Used a hybrid architecture combining CNNs for facial features, DNNs for physiological data, and Whisper for audio. Fused these using a custom AAF algorithm.",
      technologies: [
        { name: "TensorFlow/PyTorch", reason: "Standard frameworks for deep learning research and implementation." },
        { name: "Phi-2", reason: "A compact LLM suitable for personalized recommendation generation." }
      ]
    },
    documentation: {
      setup: "Refer to the model training scripts and deployment guides."
    }
  }
];