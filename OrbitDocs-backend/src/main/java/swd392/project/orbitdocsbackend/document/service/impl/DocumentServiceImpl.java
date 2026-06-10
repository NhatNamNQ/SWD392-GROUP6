package swd392.project.orbitdocsbackend.document.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.course.repository.CourseRepository;
import swd392.project.orbitdocsbackend.document.dto.request.DocumentUploadRequest;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentResponse;
import swd392.project.orbitdocsbackend.document.entity.Document;
import swd392.project.orbitdocsbackend.document.mapper.DocumentMapper;
import swd392.project.orbitdocsbackend.document.repository.DocumentRepository;
import swd392.project.orbitdocsbackend.document.service.IDocumentService;
import swd392.project.orbitdocsbackend.document.service.IRagIntegrationService;
import swd392.project.orbitdocsbackend.document.service.IStorageService;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.UserRepository;
import swd392.project.orbitdocsbackend.identity.dto.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.shared.enums.DocumentStatus;
import swd392.project.orbitdocsbackend.shared.enums.FileType;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import swd392.project.orbitdocsbackend.course.service.ICourseService;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements IDocumentService {

    private final DocumentRepository documentRepository;
    private final CourseRepository courseRepository;
    private final ICourseService courseService;
    private final IStorageService storageService;
    private final IRagIntegrationService ragIntegrationService;
    private final DocumentMapper documentMapper;

    @Override
    @Transactional
    public DocumentResponse uploadDocument(DocumentUploadRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        // Get current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User uploadedBy = userDetails.user();

        // Check if uploader is the Head Lecturer of this course
        if (course.getHeadLecturer() == null || !course.getHeadLecturer().getId().equals(uploadedBy.getId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED); // Only head lecturer can upload
        }

        // Validate file type
        String originalFilename = request.getFile().getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new AppException(ErrorCode.INVALID_FILE_TYPE);
        }

        // Check if a document with the same filename already exists in this course
        var existingDoc = documentRepository.findByOriginalFilenameAndCourseId(originalFilename, course.getId());

        Document document;
        String storagePath;

        if (existingDoc.isPresent()) {
            // Reuse existing document - just update file and reset status
            document = existingDoc.get();

            // Delete old file from storage
            try {
                storageService.deleteFile(document.getStoragePath());
            } catch (IOException e) {
                log.warn("Could not delete old file: {}", document.getStoragePath());
            }

            // Upload new file
            try {
                storagePath = storageService.uploadFile(request.getFile());
            } catch (IOException e) {
                log.error("Failed to store file", e);
                throw new AppException(ErrorCode.FILE_STORAGE_FAILED);
            }

            // Update existing document metadata
            document.setStoragePath(storagePath);
            document.setFileSizeBytes(request.getFile().getSize());
            document.setStatus(DocumentStatus.UPLOADED);
            document.setFailureReason(null);
            document = documentRepository.save(document);

            log.info("Re-uploading existing document: {} (ID: {})", originalFilename, document.getId());
        } else {
            // Brand new document
            try {
                storagePath = storageService.uploadFile(request.getFile());
            } catch (IOException e) {
                log.error("Failed to store file", e);
                throw new AppException(ErrorCode.FILE_STORAGE_FAILED);
            }

            document = Document.builder()
                    .course(course)
                    .uploadedBy(uploadedBy)
                    .originalFilename(originalFilename)
                    .storagePath(storagePath)
                    .fileType(FileType.PDF)
                    .fileSizeBytes(request.getFile().getSize())
                    .status(DocumentStatus.UPLOADED)
                    .build();

            document = documentRepository.save(document);

            log.info("Created new document: {} (ID: {})", originalFilename, document.getId());
        }

        // Trigger indexing (creates a new IndexingJob each time)
        ragIntegrationService.triggerIndexing(document.getId(), storagePath);

        return documentMapper.toResponse(document);
    }

    @Override
    public List<DocumentResponse> getDocumentsByCourseId(UUID courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.user();

            // Allow if user is ADMIN or LECTURER or enrolled STUDENT
            if (user.getRole().getName().name().equals("STUDENT")) {
                if (!courseService.isStudentEnrolled(courseId, user.getId())) {
                    throw new AppException(ErrorCode.UNAUTHORIZED);
                }
            }
        }

        return documentRepository.findByCourseId(courseId)
                .stream()
                .map(documentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentResponse getDocumentById(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
        return documentMapper.toResponse(document);
    }

    @Override
    @Transactional
    public void deleteDocument(UUID id) {
        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));

        try {
            storageService.deleteFile(document.getStoragePath());
        } catch (IOException e) {
            log.error("Failed to delete file from storage: {}", document.getStoragePath(), e);
        }

        documentRepository.delete(document);
    }

    @Override
    public Document getDocumentEntityById(UUID id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DOCUMENT_NOT_FOUND));
    }
}
