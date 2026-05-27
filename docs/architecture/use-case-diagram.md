# SWD392 Use Case Diagram

This document provides a system-level use case view for the SWD392 OrbitDocs
platform. It focuses on the main interactions of the three agreed actors:
Student, Teacher, and Admin.

## Scope

The diagram covers the current product direction shown across the architecture
handbook, user stories, and frontend prototype:

- Students use the chatbot to ask course questions and review cited answers.
- Teachers upload and manage study materials that feed the chatbot knowledge
  base.
- Admins control user access, course governance, and operational visibility.

## Assumptions

- `Teacher` represents a lecturer or course staff member who manages SWD392
  study materials.
- `Admin` represents a platform or course administrator role. This role is
  included for governance and operations, even though it is not yet specified
  in the same detail as Student and Teacher stories.
- Authentication is modeled as a shared use case because all actors must enter
  the system before protected actions.

## System-Level Use Case Diagram

```mermaid
flowchart LR
    Student[Student]
    Teacher[Teacher]
    Admin[Admin]

    subgraph OrbitDocs["OrbitDocs System"]
        direction TB

        subgraph StudentUC["Student Learning Flows"]
            UC1([Register Account])
            UC2([Log In])
            UC3([Start Chat Session])
            UC4([Ask Course Question])
            UC5([View Answer Citations])
            UC6([Review Chat History])
        end

        subgraph TeacherUC["Teacher Content Flows"]
            UC7([Upload Study Materials])
            UC8([Manage Document Library])
            UC9([Review Indexing Status])
        end

        subgraph AdminUC["Admin Governance Flows"]
            UC10([Manage Users and Roles])
            UC11([Monitor System Status])
            UC12([Manage Course Access Policies])
        end
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6

    Teacher --> UC1
    Teacher --> UC2
    Teacher --> UC7
    Teacher --> UC8
    Teacher --> UC9
    Teacher --> UC5

    Admin --> UC2
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
    Admin --> UC12

    UC3 -. "<<include>>" .-> UC2
    UC4 -. "<<include>>" .-> UC3
    UC4 -. "<<include>>" .-> UC5
    UC8 -. "<<include>>" .-> UC9
    UC10 -. "<<include>>" .-> UC12
```

## Actor Summary

### Student

The Student is the primary learning actor. This actor logs in, starts a chat
session, asks questions about SWD392 materials, reviews citations, and reopens
previous chat history for study continuity.

### Teacher

The Teacher is the content management actor. This actor uploads study
materials, maintains the document library, and reviews indexing status to make
sure students receive answers from approved sources.

### Admin

The Admin is the governance and operations actor. This actor manages roles and
access rules, monitors system health, and can review the document library and
indexing state for operational control.

## Notes

- `Ask Course Question` includes `View Answer Citations` because cited answers
  are part of the core product promise.
- `Manage Document Library` includes `Review Indexing Status` because document
  management depends on knowing whether materials are uploaded, processing,
  indexed, or failed.
- This diagram is intentionally system-level. Detailed textual use cases can be
  added later for Student, Teacher, and Admin flows if the team wants a deeper
  UML analysis.
