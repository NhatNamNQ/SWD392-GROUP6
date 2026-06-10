package swd392.project.orbitdocsbackend.document.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swd392.project.orbitdocsbackend.document.dto.request.ChapterSyncRequest;
import swd392.project.orbitdocsbackend.document.dto.response.ChapterResponse;
import swd392.project.orbitdocsbackend.document.entity.Chapter;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.entity.IndexingJob;
import swd392.project.orbitdocsbackend.document.mapper.ChapterMapper;
import swd392.project.orbitdocsbackend.document.repository.ChapterRepository;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.repository.IndexingJobRepository;
import swd392.project.orbitdocsbackend.document.service.IChapterService;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import swd392.project.orbitdocsbackend.identity.dto.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.identity.entity.User;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import swd392.project.orbitdocsbackend.course.service.ICourseService;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements IChapterService {

        private final ChapterRepository chapterRepository;
        private final DocumentRepository documentRepository;
        private final IndexingJobRepository indexingJobRepository;
        private final ChapterMapper chapterMapper;

        private final ICourseService courseService;

        @Override
        public List<ChapterResponse> getChaptersByDocumentId(UUID documentId) {
                Document document = documentRepository.findById(documentId)
                                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
                        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
                        User user = userDetails.user();
                        
                        if (user.getRole().getName().name().equals("STUDENT")) {
                                if (!courseService.isStudentEnrolled(document.getCourse().getId(), user.getId())) {
                                        throw new AppException(ErrorCode.UNAUTHORIZED);
                                }
                        }
                }

                return chapterRepository.findByDocumentId(documentId)
                                .stream()
                                .map(chapterMapper::toResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void syncChaptersFromRag(ChapterSyncRequest request) {
                Document document = documentRepository.findById(request.getDocumentId())
                                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

                // Clear existing chapters
                chapterRepository.deleteByDocumentId(document.getId());
                document.getChapters().clear();

                List<Chapter> chapters = request.getChapters().stream().map(info -> Chapter.builder()
                                .document(document)
                                .title(info.getTitle())
                                .orderIndex(info.getOrderIndex())
                                .description(info.getDescription())
                                .build()).collect(Collectors.toList());

                chapterRepository.saveAll(chapters);

                // Mark document as indexed with actual chunk count from Python RAG
                int chunkCount = request.getChunkCount() != null ? request.getChunkCount() : 0;
                document.markIndexed(chunkCount);
                documentRepository.save(document);

                // Mark the specific processing job as INDEXED
                IndexingJob job = indexingJobRepository.findById(request.getJobId())
                                .orElseThrow(() -> new AppException(ErrorCode.INDEXING_JOB_NOT_FOUND));

                if (job.getStatus() == DocumentStatus.PROCESSING) {
                        job.setStatus(DocumentStatus.INDEXED);
                        job.setCompletedAt(Instant.now());
                        indexingJobRepository.save(job);
                }

                log.info("Successfully synced {} chapters and marked document {} as INDEXED",
                                chapters.size(), document.getId());
        }

        @Override
        public Chapter getChapterEntityById(UUID id) {
                return chapterRepository.findById(id)
                                .orElseThrow(() -> new AppException(ErrorCode.CHAPTER_NOT_FOUND)); // Or something similar, let's just throw generic exception if errorcode not found
        }
}
