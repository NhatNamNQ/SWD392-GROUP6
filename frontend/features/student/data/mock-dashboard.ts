import type { Conversation, DocumentRecord } from "@/features/student/model/types";

export const initialConversations: Conversation[] = [
  {
    id: "use-case",
    title: "Use Case Diagrams Review",
    summary: "Actors, goals, system boundary",
    messages: [
      {
        id: "m1",
        role: "user",
        text: "What does a use case model capture in SWD392?",
      },
      {
        id: "m2",
        role: "assistant",
        text: "A use case model captures how actors reach goals with the system. It keeps the focus on user intent and system scope before internal design details.",
        citations: [
          {
            id: "c1",
            label: "SWD392 Week 2 - Use Case Diagrams",
            snippet:
              "Use cases describe actor goals and system responsibilities without prescribing internal design decisions.",
          },
        ],
      },
    ],
  },
  {
    id: "mvc-layered",
    title: "MVC vs Layered Architecture",
    summary: "Compare architecture styles",
    messages: [
      {
        id: "m3",
        role: "user",
        text: "When would I pick MVC instead of layered architecture?",
      },
      {
        id: "m4",
        role: "assistant",
        text: "MVC helps when UI behavior changes often because it separates interaction flow from display concerns. Layered architecture is stronger when service boundaries and dependency direction matter most.",
        citations: [
          {
            id: "c2",
            label: "SWD392 Architecture Summary",
            snippet:
              "MVC separates model, view, and controller, while layered patterns enforce dependency direction across application boundaries.",
          },
        ],
      },
    ],
  },
  {
    id: "state-machine",
    title: "State Machine Examples",
    summary: "Behavior flow",
    messages: [],
  },
  {
    id: "broker-pattern",
    title: "Broker Pattern in Distributed Systems",
    summary: "Messaging notes",
    messages: [],
  },
  {
    id: "gof",
    title: "GoF Design Patterns",
    summary: "Revision guide",
    messages: [],
  },
];

export const initialDocuments: DocumentRecord[] = [
  {
    id: "d1",
    title: "Week 2 - Use Case Diagrams.pdf",
    status: "Indexed",
    tag: "Requirements",
    size: "18 pages",
  },
  {
    id: "d2",
    title: "Architecture Patterns Slides.pptx",
    status: "Indexed",
    tag: "Architecture",
    size: "42 slides",
  },
  {
    id: "d3",
    title: "State Machine Examples.docx",
    status: "Processing",
    tag: "UML",
    size: "9 pages",
  },
  {
    id: "d4",
    title: "GoF Pattern Cheat Sheet.md",
    status: "Indexed",
    tag: "Design Patterns",
    size: "6 sections",
  },
  {
    id: "d5",
    title: "Client Server Reading.pdf",
    status: "Indexed",
    tag: "Distributed Systems",
    size: "24 pages",
  },
  {
    id: "d6",
    title: "Sequence Diagram Tutorial.pdf",
    status: "Processing",
    tag: "UML",
    size: "13 pages",
  },
];

export const promptSuggestions = [
  "What is a Use Case Model?",
  "Explain Client-Server Architecture",
  "Compare Sequence and Communication diagrams",
];

export const courses = [
  "SWD392: Software Modeling & Design",
  "SWD392: Patterns & Architecture",
  "SWD392: Modeling Fundamentals",
];
