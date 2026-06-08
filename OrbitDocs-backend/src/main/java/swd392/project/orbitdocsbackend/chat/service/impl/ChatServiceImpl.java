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
import swd392.project.orbitdocsbackend.course.repository.CourseRepository;
import swd392.project.orbitdocsbackend.document.entity.Chapter;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.repository.ChapterRepository;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.UserRepository;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.shared.enums.MessageRole;

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
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final ChapterRepository chapterRepository;
    private final RestClient restClient = RestClient.create();

    @Value("${rag.internal-url}")
    private String ragInternalUrl;

    @Value("${rag.internal-api-key}")
    private String ragInternalApiKey;

    @Override
    @Transactional
    public ChatResponse sendMessage(ChatRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ChatSession session;
        if (request.getSessionId() != null) {
            session = chatSessionRepository.findByIdAndUserIdAndActiveTrue(request.getSessionId(), userId)
                    .orElseThrow(() -> new RuntimeException("Session not found or inactive"));
        } else {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            session = ChatSession.builder()
                    .user(user)
                    .course(course)
                    .title(request.getQuery().length() > 50 ? request.getQuery().substring(0, 50) + "..." : request.getQuery())
                    .active(true)
                    .build();

            if (request.getDocumentId() != null) {
                Document doc = documentRepository.findById(request.getDocumentId())
                        .orElseThrow(() -> new RuntimeException("Document not found"));
                session.getDocuments().add(doc);
            }

            if (request.getChapterId() != null) {
                Chapter chapter = chapterRepository.findById(request.getChapterId())
                        .orElseThrow(() -> new RuntimeException("Chapter not found"));
                session.getChapters().add(chapter);
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
            ragRequest.setChapter_title(session.getChapters().get(0).getTitle());
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
                MessageCitation citation = MessageCitation.builder()
                        .message(assistantMessage)
                        .similarityScore(rc.getDistance()) // Assuming distance is score for now
                        .excerpt("Chunk " + rc.getChunk_index() + " on page " + rc.getPage_num())
                        .build();
                citations.add(citation);

                citationDtos.add(CitationDto.builder()
                        .excerpt(citation.getExcerpt())
                        .similarityScore(citation.getSimilarityScore())
                        .pageNum(rc.getPage_num())
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
        ChatSession session = chatSessionRepository.findByIdAndUserIdAndActiveTrue(sessionId, userId)
                .orElseThrow(() -> new RuntimeException("Session not found"));
        return mapToSessionDtoWithMessages(session);
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
            List<CitationDto> citationDtos = msg.getCitations().stream().map(cit -> 
                    CitationDto.builder()
                            .excerpt(cit.getExcerpt())
                            .similarityScore(cit.getSimilarityScore())
                            .pageNum(null) // we don't store pageNum in db directly yet, but can get from Chunk if needed
                            .build()
            ).collect(Collectors.toList());

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
