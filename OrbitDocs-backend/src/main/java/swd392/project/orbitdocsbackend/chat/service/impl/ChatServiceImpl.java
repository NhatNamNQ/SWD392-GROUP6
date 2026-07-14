package swd392.project.orbitdocsbackend.chat.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import swd392.project.orbitdocsbackend.chat.dto.ChatMessageDto;
import swd392.project.orbitdocsbackend.chat.dto.ChatRequest;
import swd392.project.orbitdocsbackend.chat.dto.ChatResponse;
import swd392.project.orbitdocsbackend.chat.dto.ChatSessionDto;
import swd392.project.orbitdocsbackend.chat.dto.CitationDto;
import swd392.project.orbitdocsbackend.chat.dto.rag.RagChatRequest;
import swd392.project.orbitdocsbackend.chat.dto.rag.RagChatResponse;
import swd392.project.orbitdocsbackend.chat.entity.ChatMessage;
import swd392.project.orbitdocsbackend.chat.entity.ChatSession;
import swd392.project.orbitdocsbackend.chat.entity.MessageCitation;
import swd392.project.orbitdocsbackend.chat.repository.ChatMessageRepository;
import swd392.project.orbitdocsbackend.chat.repository.ChatSessionRepository;
import swd392.project.orbitdocsbackend.chat.service.IChatService;
import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.document.entity.Chapter;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.entity.DocumentChunk;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.repository.DocumentChunkRepository;
import swd392.project.orbitdocsbackend.shared.enums.MessageRole;
import swd392.project.orbitdocsbackend.course.service.ICourseService;
import swd392.project.orbitdocsbackend.document.service.IDocumentService;
import swd392.project.orbitdocsbackend.document.service.IChapterService;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements IChatService {

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ICourseService courseService;
    private final IDocumentService documentService;
    private final IChapterService chapterService;
    private final DocumentRepository documentRepository;
    private final DocumentChunkRepository documentChunkRepository;
    private final RestClient restClient = RestClient.create();

    @Value("${rag.internal-url}")
    private String ragInternalUrl;

    @Value("${rag.internal-api-key}")
    private String ragInternalApiKey;

    @Override
    @Transactional
    public ChatResponse sendMessage(ChatRequest request, UUID userId) {
        ChatSession session;
        if (request.getSessionId() != null) {
            session = chatSessionRepository.findByIdAndUserIdAndActiveTrue(request.getSessionId(), userId)
                    .orElseThrow(() -> new RuntimeException("Session not found or inactive"));
        } else {
            Course course = courseService.getCourseEntityById(request.getCourseId());

            // Access control: Everyone can chat on any course freely.

            session = ChatSession.builder()
                    .userId(userId)
                    .course(course)
                    .title(request.getQuery().length() > 50 ? request.getQuery().substring(0, 50) + "..." : request.getQuery())
                    .active(true)
                    .build();

            if (request.getDocumentId() != null) {
                Document doc = documentService.getDocumentEntityById(request.getDocumentId());

                // Access control check for document
                if (!doc.getCourse().getId().equals(course.getId())) {
                    throw new RuntimeException("Document does not belong to this course");
                }

                session.getDocuments().add(doc);
            }

            if (request.getChapterIds() != null && !request.getChapterIds().isEmpty()) {
                for (UUID chapId : request.getChapterIds()) {
                    Chapter chapter = chapterService.getChapterEntityById(chapId);
                    session.getChapters().add(chapter);
                }
            }
            session = chatSessionRepository.save(session);
        }

        session.setLastMessageAt(Instant.now());

        // Save User Message
        ChatMessage userMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.USER)
                .content(request.getQuery())
                .createdAt(Instant.now())
                .build();
        chatMessageRepository.save(userMessage);

        // Prepare RAG Request
        RagChatRequest ragRequest = new RagChatRequest();
        ragRequest.setQuery(request.getQuery());
        
        // Use the session's restricted document if any
        if (!session.getDocuments().isEmpty()) {
            ragRequest.setDocument_id(session.getDocuments().get(0).getId().toString());
        } else if (request.getDocumentId() != null) {
            ragRequest.setDocument_id(request.getDocumentId().toString());
        } else {
            throw new RuntimeException("A document must be selected to chat with in this version.");
        }

        if (!session.getChapters().isEmpty()) {
            ragRequest.setChapter_titles(session.getChapters().stream()
                    .map(Chapter::getTitle)
                    .collect(Collectors.toList()));
        }

        // Call Python RAG
        RagChatResponse ragResponse;
        try {
            ragResponse = restClient.post()
                    .uri(ragInternalUrl + "/api/chat")
                    .header("x-api-key", ragInternalApiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(ragRequest)
                    .retrieve()
                    .body(RagChatResponse.class);
        } catch (Exception e) {
            log.error("Failed to call RAG backend", e);
            throw new RuntimeException("Failed to get response from AI assistant.");
        }

        if (ragResponse == null) {
            throw new RuntimeException("Empty response from AI assistant.");
        }

        // Save Assistant Message
        ChatMessage assistantMessage = ChatMessage.builder()
                .session(session)
                .role(MessageRole.ASSISTANT)
                .content(ragResponse.getAnswer())
                .createdAt(Instant.now())
                .build();
        
        List<MessageCitation> citations = new ArrayList<>();
        List<CitationDto> citationDtos = new ArrayList<>();

        if (ragResponse.getCitations() != null) {
            for (RagChatResponse.RagCitation rc : ragResponse.getCitations()) {
                DocumentChunk chunk = null;
                Document document = null;
                try {
                    if (rc.getChunk_id() != null) {
                        chunk = documentChunkRepository.findById(UUID.fromString(rc.getChunk_id())).orElse(null);
                    }
                } catch (IllegalArgumentException ignored) {}
                try {
                    if (rc.getDocument_id() != null) {
                        document = documentRepository.findById(UUID.fromString(rc.getDocument_id())).orElse(null);
                    }
                } catch (IllegalArgumentException ignored) {}

                MessageCitation citation = MessageCitation.builder()
                        .message(assistantMessage)
                        .chunk(chunk)
                        .document(document)
                        .similarityScore(rc.getDistance())
                        .excerpt(rc.getExcerpt())
                        .build();
                citations.add(citation);

                String docName = document != null ? document.getOriginalFilename() : null;
                String chapterTitle = null;
                if (chunk != null && chunk.getMetadata() != null) {
                    chapterTitle = (String) chunk.getMetadata().get("chapter_title");
                }

                citationDtos.add(CitationDto.builder()
                        .excerpt(citation.getExcerpt())
                        .similarityScore(citation.getSimilarityScore())
                        .pageNum(rc.getPage_num())
                        .chunkIndex(rc.getChunk_index())
                        .documentName(docName)
                        .chapterTitle(chapterTitle)
                        .build());
            }
        }
        assistantMessage.setCitations(citations);
        assistantMessage = chatMessageRepository.save(assistantMessage);

        return ChatResponse.builder()
                .sessionId(session.getId())
                .messageId(assistantMessage.getId())
                .answer(assistantMessage.getContent())
                .citations(citationDtos)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatSessionDto> getUserSessions(UUID userId) {
        List<ChatSession> sessions = chatSessionRepository.findByUserIdAndActiveTrueOrderByLastMessageAtDesc(userId);
        return sessions.stream().map(this::mapToSessionDtoWithoutMessages).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatSessionDto getSessionDetails(UUID sessionId, UUID userId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToSessionDtoWithMessages(session);
    }

    @Override
    @Transactional
    public ChatSessionDto renameSession(UUID sessionId, String newTitle, UUID userId) {
        ChatSession session = chatSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Chat session not found"));

        if (!session.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        session.setTitle(newTitle);
        ChatSession savedSession = chatSessionRepository.save(session);
        return mapToSessionDtoWithMessages(savedSession);
    }

    private ChatSessionDto mapToSessionDtoWithoutMessages(ChatSession session) {
        return ChatSessionDto.builder()
                .id(session.getId())
                .courseId(session.getCourse().getId())
                .title(session.getTitle())
                .lastMessageAt(session.getLastMessageAt())
                .build();
    }

    private ChatSessionDto mapToSessionDtoWithMessages(ChatSession session) {
        ChatSessionDto dto = mapToSessionDtoWithoutMessages(session);
        List<ChatMessage> messages = chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());
        
        List<ChatMessageDto> messageDtos = messages.stream().map(msg -> {
            List<CitationDto> citationDtos = msg.getCitations().stream().map(cit -> {
                Integer pageNum = null;
                String chapterTitle = null;
                String docName = null;

                Integer chunkIndex = null;

                if (cit.getChunk() != null) {
                    chunkIndex = cit.getChunk().getChunkIndex();
                    if (cit.getChunk().getMetadata() != null) {
                        Object pg = cit.getChunk().getMetadata().get("page_num");
                        if (pg == null) {
                            pg = cit.getChunk().getMetadata().get("pageNum");
                        }
                        if (pg == null) {
                            pg = cit.getChunk().getMetadata().get("page");
                        }
                        if (pg instanceof Number) {
                            pageNum = ((Number) pg).intValue();
                        } else if (pg instanceof String) {
                            try {
                                pageNum = Integer.parseInt((String) pg);
                            } catch (NumberFormatException ignored) {}
                        }
                        
                        chapterTitle = (String) cit.getChunk().getMetadata().get("chapter_title");
                    }
                }

                if (cit.getDocument() != null) {
                    docName = cit.getDocument().getOriginalFilename();
                }

                return CitationDto.builder()
                        .excerpt(cit.getExcerpt())
                        .similarityScore(cit.getSimilarityScore())
                        .pageNum(pageNum)
                        .chunkIndex(chunkIndex)
                        .documentName(docName)
                        .chapterTitle(chapterTitle)
                        .build();
            }).collect(Collectors.toList());

            return ChatMessageDto.builder()
                    .id(msg.getId())
                    .role(msg.getRole())
                    .content(msg.getContent())
                    .createdAt(msg.getCreatedAt())
                    .citations(citationDtos)
                    .build();
        }).collect(Collectors.toList());
        
        dto.setMessages(messageDtos);
        return dto;
    }
}
