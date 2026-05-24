# User Stories & Acceptance Criteria: SWD392 Course Document Chatbot

This document details the functional requirements of the SWD392 Course Document Chatbot. The core objective is to build a chatbot that allows students to ask and answer questions based on the SWD392 course materials (the FLM textbook: *Software Modeling and Design: UML, Use Cases, Patterns, and Software Architectures*).

---

## 1. Topic & Scope

### 1.1 In Scope
- Upload PDF, DOCX, and lecture slide documents.
- Automatically chunk and embed documents.
- Manage documents by course and chapter.
- View the list of indexed documents.
- Natural chat with conversational context.
- Answer with citations to the original source documents.
- Restrict answers to the indexed document scope.
- Maintain conversation history by session.
- Prepare a test set of 50 questions with ground truth for chatbot evaluation.

### 1.2 Out of Scope
- Managing multiple schools or multiple academic programs.
- Auto-grading student assignments.
- Generating content outside the course materials.
- Direct integration with FLM production systems if API access is not available.

---

## 2. Primary Actors

- **SWD392 Student**: Asks the chatbot questions based on course materials to clarify concepts and study.
- **Lecturer / Course Administrator**: Uploads, indexes, and manages course documents to keep source materials up to date.

> [!NOTE]
> Primary actor definitions are subject to Product Owner (PO) final confirmation before the backlog is finalized.

---

## 3. User Stories & Acceptance Criteria

### US-01: Upload course documents

**User Story:**
* **As a** SWD392 lecturer/course administrator
* **I want to** upload course documents in PDF, DOCX, and slide formats
* **So that** students have official source materials for the chatbot to answer from

**INVEST Checklist:**
- [x] **Independent**: Can be built separately from the assignment and indexing modules.
- [x] **Negotiable**: Does not lock the UI or storage implementation details.
- [x] **Valuable**: Creates the necessary input data for the chatbot.
- [x] **Estimable**: File formats (PDF, DOCX, slides) and the target actor are clearly defined.
- [x] **Small**: Focuses exclusively on file upload mechanics.
- [x] **Testable**: Can be verified with supported and unsupported file formats.

**Acceptance Criteria:**
* **AC1: Upload a valid file**
  * **Given** the lecturer/course administrator is logged into the system
  * **When** they upload a PDF, DOCX, or slide file for SWD392
  * **Then** the system saves the file successfully
  * **And** the system displays the file status as `Uploaded`
* **AC2: Reject unsupported file formats**
  * **Given** the lecturer/course administrator is on the document upload screen
  * **When** they upload a file format other than PDF, DOCX, or slides (e.g., TXT, ZIP)
  * **Then** the system rejects the file and does not save it
  * **And** displays an error message indicating the file format is not supported
* **AC3: Handle missing course/chapter metadata**
  * **Given** the lecturer/course administrator is uploading a document
  * **When** they do not assign the document to a course or chapter
  * **Then** the system blocks the upload
  * **And** displays a message requesting the missing required metadata

---

### US-02: Assign documents to courses and chapters

**User Story:**
* **As a** SWD392 lecturer/course administrator
* **I want to** assign uploaded documents to the correct course and chapter
* **So that** the chatbot can retrieve and cite sources according to the course structure

**INVEST Checklist:**
- [x] **Independent**: Separate from the physical file upload step.
- [x] **Negotiable**: Metadata design and storage can remain flexible.
- [x] **Valuable**: Helps enforce the correct retrieval scope during RAG search.
- [x] **Estimable**: Course and chapter metadata structure is straightforward.
- [x] **Small**: Focused entirely on document metadata tagging.
- [x] **Testable**: Verified by assigning, editing, and verifying document metadata.

**Acceptance Criteria:**
* **AC1: Assign a document to a chapter**
  * **Given** a document has been uploaded successfully
  * **When** the lecturer/course administrator selects SWD392 and a specific chapter
  * **Then** the system saves the document assignment metadata
* **AC2: Update chapter metadata**
  * **Given** a document has already been assigned to a chapter
  * **When** the lecturer/course administrator updates the chapter assignment
  * **Then** the system saves the new chapter value
  * **And** the document list immediately reflects the updated metadata
* **AC3: Prevent assignment to a non-existent chapter**
  * **Given** the lecturer/course administrator is assigning metadata to a document
  * **When** they try to enter or select a chapter that does not exist in SWD392
  * **Then** the system rejects the change
  * **And** displays an appropriate error message

---

### US-03: Automatically chunk and embed documents

**User Story:**
* **As a** SWD392 lecturer/course administrator
* **I want to** have the system automatically chunk and embed documents after upload
* **So that** the chatbot can search relevant content and answer student questions

**INVEST Checklist:**
- [x] **Independent**: Runs as a background pipeline after upload and metadata assignment.
- [x] **Negotiable**: Specific chunk size and embedding model can be tuned.
- [x] **Valuable**: Essential prerequisite for the semantic RAG chatbot to function.
- [x] **Estimable**: Indexing states (Processing, Indexed, Failed) and inputs are clear.
- [x] **Small**: Focuses strictly on the indexing pipeline.
- [x] **Testable**: Verified by success/failure states and comparing generated chunk counts.

**Acceptance Criteria:**
* **AC1: Successful indexing**
  * **Given** a valid document has been uploaded and assigned metadata
  * **When** the system processes the document
  * **Then** it creates chunks and embeddings successfully
  * **And** the document status changes to `Indexed`
* **AC2: Track indexing status**
  * **Given** a document is currently being processed
  * **When** the lecturer/course administrator views the document list
  * **Then** the system displays the status as `Processing`, `Indexed`, or `Failed`
* **AC3: Handle indexing failures**
  * **Given** a document is uploaded but the system cannot read its content
  * **When** the chunking and embedding pipeline fails
  * **Then** the system marks the document status as `Failed`
  * **And** displays a human-readable failure reason

---

### US-04: View the list of indexed documents

**User Story:**
* **As a** SWD392 lecturer/course administrator
* **I want to** view the list of uploaded and indexed documents
* **So that** I know which sources the chatbot is currently using to answer questions

**INVEST Checklist:**
- [x] **Independent**: Can be built as a standalone listing and management page.
- [x] **Negotiable**: The UI layout and columns can vary.
- [x] **Valuable**: Provides administrative visibility and control over active knowledge bases.
- [x] **Estimable**: Display columns and filtering logic are standard.
- [x] **Small**: Only reads and renders the list of documents.
- [x] **Testable**: Verified by checking filtering options and document statuses.

**Acceptance Criteria:**
* **AC1: Display the document list**
  * **Given** the system contains at least one uploaded document
  * **When** the lecturer/course administrator opens the document management page
  * **Then** the system displays the document name, course, chapter, file type, and indexing status
* **AC2: Filter by indexing status**
  * **Given** the document list contains multiple statuses
  * **When** the lecturer/course administrator filters by `Indexed`
  * **Then** the system displays only documents that were indexed successfully
* **AC3: Empty document list**
  * **Given** there are no documents in the system
  * **When** the lecturer/course administrator opens the document management page
  * **Then** the system displays an empty state
  * **And** suggests uploading the first document

---

### US-05: Chat with conversational context

**User Story:**
* **As a** SWD392 student
* **I want to** chat naturally with the chatbot using conversational context
* **So that** I can learn and clarify concepts from the course materials

**INVEST Checklist:**
- [x] **Independent**: Can be tested independently in a standalone conversation UI.
- [x] **Negotiable**: LLM version and parameters remain configurable.
- [x] **Valuable**: The core value proposition for students.
- [x] **Estimable**: Scope is bounded by the SWD392 course materials.
- [x] **Small**: Focused on chat flow and memory management.
- [x] **Testable**: Verified across multiple conversation turns.

**Acceptance Criteria:**
* **AC1: Answer a direct question**
  * **Given** SWD392 materials have been indexed
  * **When** the student asks a question covered by the documents
  * **Then** the chatbot answers using relevant document excerpts
* **AC2: Understand follow-up questions**
  * **Given** the student has already asked a question about "use cases"
  * **When** they ask a follow-up like "Give me another example of it"
  * **Then** the chatbot resolves "it" to "use cases" using session history
  * **And** answers correctly using the indexed materials
* **AC3: Handle vague questions**
  * **Given** the student asks a question with insufficient context
  * **When** the chatbot cannot determine the concept being referenced
  * **Then** it prompts the student to clarify the question
  * **And** does not guess or hallucinate an answer

---

### US-06: Provide source citations

**User Story:**
* **As a** SWD392 student
* **I want to** have every answer include citations to the original sources
* **So that** I can verify the answer and reread the textbook or slides

**INVEST Checklist:**
- [x] **Independent**: Can be verified on the output formatting of answers.
- [x] **Negotiable**: Format of the citation (hyperlink, text, footnote) is flexible.
- [x] **Valuable**: Builds user trust and assists in academic study.
- [x] **Estimable**: Relies on metadata stored alongside vector chunks.
- [x] **Small**: Focuses on parsing and formatting the citation output.
- [x] **Testable**: Verified by ensuring citations are returned for every answer.

**Acceptance Criteria:**
* **AC1: Answer includes a source**
  * **Given** the chatbot finds relevant content in the materials
  * **When** it answers a student question
  * **Then** the response includes source citations with the document name and chapter
* **AC2: Multiple relevant sources**
  * **Given** the answer is synthesized from multiple documents or chapters
  * **When** the chatbot responds
  * **Then** it displays all sources used
* **AC3: No suitable source found**
  * **Given** the system cannot find a relevant excerpt
  * **When** the student asks a question
  * **Then** the chatbot states that it could not find the information in the indexed materials
  * **And** does not fabricate citations

---

### US-07: Restrict answers to the document scope

**User Story:**
* **As a** SWD392 student
* **I want to** have the chatbot answer only from the indexed course materials
* **So that** I receive information that is relevant to the course and avoid out-of-scope answers

**INVEST Checklist:**
- [x] **Independent**: Can be tested with out-of-scope questions.
- [x] **Negotiable**: The fallback rejection message can be customized.
- [x] **Valuable**: Prevents scope drift and hallucinations.
- [x] **Estimable**: In-scope and out-of-scope criteria are clear.
- [x] **Small**: Focused on prompt system instructions and threshold filtering.
- [x] **Testable**: Verified by posing out-of-scope or general questions to the bot.

**Acceptance Criteria:**
* **AC1: In-scope question**
  * **Given** the student asks a question covered by the indexed SWD392 materials
  * **When** they send the question
  * **Then** the chatbot answers using the relevant materials
* **AC2: Out-of-scope question**
  * **Given** the student asks a question not covered by the indexed materials
  * **When** they send the question
  * **Then** the chatbot states that the question is outside the scope of the materials
  * **And** suggests asking another SWD392-related question
* **AC3: Request for external knowledge**
  * **Given** the student asks the chatbot to answer using external knowledge
  * **When** the information is not in the indexed materials
  * **Then** the chatbot refuses to guess
  * **And** clearly states that it only answers from the course documents

---

### US-08: Save conversation history by session

**User Story:**
* **As a** SWD392 student
* **I want to** view my conversation history by chat session
* **So that** I can continue learning without losing prior context

**INVEST Checklist:**
- [x] **Independent**: Can be implemented using session database structures.
- [x] **Negotiable**: Conversation retention policy is flexible.
- [x] **Valuable**: Supports continuous student learning and reviews.
- [x] **Estimable**: Database schema for sessions/messages is standard.
- [x] **Small**: Focused on CRUD operations for chat history.
- [x] **Testable**: Verified by creating, viewing, and continuing chat sessions.

**Acceptance Criteria:**
* **AC1: Create a new chat session**
  * **Given** the student is on the chatbot page
  * **When** they start a new conversation
  * **Then** the system creates a new chat session
  * **And** messages are stored chronologically
* **AC2: View chat history**
  * **Given** the student has previous chat sessions
  * **When** they open the chat history list
  * **Then** the system displays the saved sessions
  * **And** allows them to reopen any past session
* **AC3: Continue an existing session**
  * **Given** the student reopens an older chat session
  * **When** they send a follow-up question
  * **Then** the chatbot uses that session's context to process the question
  * **And** appends the new message to the same session

---

### US-09: Prepare a test set of 50 questions with ground truth

**User Story:**
* **As a** SWD392 lecturer/course administrator
* **I want to** prepare a set of 50 questions with human-verified correct answers
* **So that** the development team can evaluate the chatbot’s accuracy

**INVEST Checklist:**
- [x] **Independent**: Can run in parallel with chatbot development.
- [x] **Negotiable**: The file format (CSV, JSON, Markdown) can evolve.
- [x] **Valuable**: Crucial for evaluation, benchmarking, and accuracy tuning.
- [x] **Estimable**: Bounded by a fixed count of 50 questions.
- [x] **Small**: Limited to the SWD392 curriculum.
- [x] **Testable**: Verified by reviewing the test file for question count and source links.

**Acceptance Criteria:**
* **AC1: Produce exactly 50 questions**
  * **Given** the SWD392 materials are identified
  * **When** the lecturer prepares the test set
  * **Then** the test set contains exactly 50 questions
  * **And** each question has a corresponding ground truth answer
* **AC2: Each question includes a reference source**
  * **Given** each ground truth answer is written based on the course materials
  * **When** the test set is reviewed
  * **Then** each item includes a specific reference source (textbook chapter/slide)
* **AC3: Remove out-of-scope questions**
  * **Given** the test set contains a question that cannot be answered from SWD392 materials
  * **When** the lecturer reviews the test set
  * **Then** the question is revised or removed to maintain exactly 50 in-scope items

---

## 4. Deliverables

### 4.1 Technical Deliverables
- Web application chatbot (Next.js frontend).
- Source code hosted on GitHub.
- README with setup, local run, document upload, indexing, and chat usage instructions.
- Document upload and metadata management modules.
- Document chunking and embedding modules.
- Chat RAG module (with citations and scope restriction).
- Conversation history module (by session).

### 4.2 Evaluation Deliverables
- Test set of 50 questions with human-verified ground truth answers.
- Source references for each ground truth answer.
- Chatbot evaluation results report.

---

## 5. Evaluation Set (50 Questions & Ground Truth)

> [!NOTE]
> The ground truth below is a starter draft based on standard software engineering knowledge. It must be aligned with the exact SWD392 textbook chapters before being used as the official evaluation set.

| ID | Question | Ground Truth | Suggested Source |
|---|---|---|---|
| Q01 | What is software modeling? | Software modeling is the creation of abstract representations that describe the structure, behavior, and requirements of a software system before or during design. | Textbook chapter on software modeling |
| Q02 | Why do we use UML in software development? | UML provides a visual and standardized modeling language for communication, analysis, design, and documentation of software systems. | Textbook chapter on UML |
| Q03 | What does a use case describe? | A use case describes how an actor interacts with a system to achieve a goal of value. | Textbook chapter on use cases |
| Q04 | What is an actor in a use case? | An actor is an external role, such as a person, another system, or a device, that interacts with the system to achieve a goal. | Textbook chapter on use cases |
| Q05 | How is a primary actor different from a secondary actor? | A primary actor initiates the use case to achieve its main goal; a secondary actor supports the system or provides a service used by the use case. | Textbook chapter on use cases |
| Q06 | What is a precondition in a use case? | A precondition is a condition that must be true before the use case starts. | Textbook chapter on use case specification |
| Q07 | What is a postcondition in a use case? | A postcondition is the state the system is guaranteed to reach after the use case finishes successfully or through a specific path. | Textbook chapter on use case specification |
| Q08 | What is a main success scenario? | A main success scenario is the primary sequence of steps that describes the successful interaction between the actor and the system. | Textbook chapter on use case specification |
| Q09 | What is an extension flow used for? | An extension flow describes alternative, error, or exception situations compared with the main success path. | Textbook chapter on use case specification |
| Q10 | What does an include relationship mean in a use case? | Include means one use case always reuses the behavior of another use case as a mandatory part. | Textbook chapter on use case relationships |
| Q11 | What does an extend relationship mean in a use case? | Extend means one use case adds optional or conditional behavior to a base use case. | Textbook chapter on use case relationships |
| Q12 | What is use case generalization? | Generalization describes an inheritance relationship where a child use case specializes the behavior of a parent use case. | Textbook chapter on use case relationships |
| Q13 | What does a class diagram describe? | A class diagram describes the static structure of a system through classes, attributes, operations, and relationships. | Textbook chapter on class diagrams |
| Q14 | What is an association in a class diagram? | An association is a structural relationship between classes that shows that objects of one class are linked to objects of another class. | Textbook chapter on class diagrams |
| Q15 | How is aggregation different from composition? | Aggregation is a weaker whole-part relationship where the part can exist independently; composition is a stronger ownership relationship where the part usually depends on the whole for its lifecycle. | Textbook chapter on class diagrams |
| Q16 | What does multiplicity mean in UML? | Multiplicity indicates the number of objects that can participate at one end of a relationship, such as 1, 0..1, 1..*, or *. | Textbook chapter on class diagrams |
| Q17 | What does a sequence diagram describe? | A sequence diagram describes interactions over time between objects through messages. | Textbook chapter on sequence diagrams |
| Q18 | What is a lifeline in a sequence diagram? | A lifeline represents a participant in an interaction and its existence along the time axis. | Textbook chapter on sequence diagrams |
| Q19 | What does a message mean in a sequence diagram? | A message represents information or a call sent from one participant to another during an interaction. | Textbook chapter on sequence diagrams |
| Q20 | What does an activity diagram describe? | An activity diagram describes workflow, business process, or logic using actions, control flow, and decisions. | Textbook chapter on activity diagrams |
| Q21 | What is a decision node in an activity diagram? | A decision node splits control flow into alternative paths based on guard conditions. | Textbook chapter on activity diagrams |
| Q22 | What is a swimlane used for in an activity diagram? | A swimlane divides responsibility for activities by actor, role, department, or system component. | Textbook chapter on activity diagrams |
| Q23 | When do we use a state machine diagram? | A state machine diagram is used when we need to describe the lifecycle and states of an object driven by events. | Textbook chapter on state machine diagrams |
| Q24 | What is the difference between a state and a transition? | A state is the condition of an object at a point in time; a transition is the change from one state to another triggered by an event or condition. | Textbook chapter on state machine diagrams |
| Q25 | What is a package diagram used for? | A package diagram groups model elements and shows dependencies among packages to manage system complexity. | Textbook chapter on package diagrams |
| Q26 | What does a deployment diagram describe? | A deployment diagram describes the physical structure of a system, including nodes, artifacts, and how software is deployed onto infrastructure. | Textbook chapter on deployment diagrams |
| Q27 | What is a design pattern? | A design pattern is a reusable, general solution to a recurring design problem within a specific context. | Textbook chapter on patterns |
| Q28 | What is the benefit of design patterns? | Design patterns help reuse design experience, improve team communication, and reduce risk when solving familiar problems. | Textbook chapter on patterns |
| Q29 | What problem does the Singleton pattern solve? | Singleton ensures that a class has only one instance and provides a global access point to that instance. | Textbook chapter on design patterns |
| Q30 | What does the Factory Method pattern do? | Factory Method defines an interface for creating objects while letting subclasses decide which concrete class to instantiate. | Textbook chapter on design patterns |
| Q31 | What problem does the Observer pattern solve? | Observer defines a one-to-many relationship so that when the subject changes state, dependent observers are notified and updated. | Textbook chapter on design patterns |
| Q32 | When do we use the Strategy pattern? | Strategy is used when we need to encapsulate interchangeable algorithms and choose one at runtime. | Textbook chapter on design patterns |
| Q33 | What is MVC? | MVC is an architectural pattern that separates an application into Model, View, and Controller to separate data, presentation, and control flow. | Textbook chapter on software architecture |
| Q34 | What is the responsibility of the Model in MVC? | The Model manages data, state, and business logic for the application. | Textbook chapter on MVC |
| Q35 | What is the responsibility of the View in MVC? | The View presents data to the user and reflects the state of the Model. | Textbook chapter on MVC |
| Q36 | What is the responsibility of the Controller in MVC? | The Controller receives user input, coordinates processing, and updates the Model or View accordingly. | Textbook chapter on MVC |
| Q37 | What is layered architecture? | Layered architecture organizes a system into layers of responsibility, where each layer provides services to the layer above and uses services from the layer below. | Textbook chapter on architecture |
| Q38 | What is the benefit of layered architecture? | Layered architecture improves separation of concerns, maintainability, replaceability, and testing of individual layers. | Textbook chapter on architecture |
| Q39 | What is an architectural style? | An architectural style is the overall way a system is organized, defining the kinds of components, relationships, and constraints between them. | Textbook chapter on architecture |
| Q40 | How do non-functional requirements affect design? | Non-functional requirements such as performance, security, availability, and maintainability influence architectural choices, patterns, and design trade-offs. | Textbook chapter on software architecture |
| Q41 | What is coupling? | Coupling is the degree of dependence between modules or components; low coupling generally makes a system easier to change and maintain. | Textbook chapter on design principles |
| Q42 | What is cohesion? | Cohesion is the degree to which responsibilities within a module belong together; high cohesion is usually a sign of good design. | Textbook chapter on design principles |
| Q43 | What is information hiding? | Information hiding is the principle of concealing internal design details of a module and exposing only what is necessary through the interface. | Textbook chapter on design principles |
| Q44 | How is encapsulation different from information hiding? | Encapsulation bundles data and behavior inside one unit; information hiding focuses on hiding design decisions and internal details from the outside. | Textbook chapter on design principles |
| Q45 | What is traceability between requirements and design? | Traceability is the ability to link requirements to design, implementation, and test artifacts in order to track the impact of changes. | Textbook chapter on modeling process |
| Q46 | Why do we review design models? | Reviewing design models helps detect missing details, inconsistencies, hard-to-maintain structures, and deviations from requirements before implementation. | Textbook chapter on modeling process |
| Q47 | What is a domain model? | A domain model describes the important concepts in the business domain and the relationships between them, usually without focusing on implementation details. | Textbook chapter on domain modeling |
| Q48 | What are boundary, control, and entity classes? | Boundary classes handle interaction with actors, control classes coordinate the use case flow, and entity classes represent business information that needs to be stored. | Textbook chapter on analysis classes |
| Q49 | What is the purpose of robustness analysis? | Robustness analysis checks the completeness and consistency of a use case by mapping behavior to boundary, control, and entity objects. | Textbook chapter on analysis/design transition |
| Q50 | When should the chatbot refuse to answer? | The chatbot should refuse when the question is not supported by the indexed materials, when the user asks it to guess beyond the documents, or when no relevant source can be cited. | Requirement: restrict answers to document scope |

---

## 6. Product Owner Review Notes

- **Primary Actor Confirmation**: The exact roles (Lecturer vs. General Admin) need final validation from the PO.
- **Chapter Mapping**: The exact chapter list for course SWD392 needs to be loaded into the database configurations to prevent invalid indexing assignments.
- **Supported Slide Formats**: Clarify whether raw PowerPoint slides (`.ppt`/`.pptx`) or only PDF exports of slides are accepted.
- **Citation Precision**: Determine whether references should support page/slide numbers or if document name and chapter are sufficient.
- **Evaluation Criteria**: Define the criteria for accuracy evaluation (e.g., semantic similarity of answers, correct citation matching, or LLM-as-a-judge scoring).
