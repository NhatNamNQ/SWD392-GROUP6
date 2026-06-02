$base = 'c:\Materials\SU26\SWD392\Project\SWD392-GROUP6\OrbitDocs-backend\src\main\java\swd392\project\orbitdocsbackend'

function Create-Repo {
    param ($module, $entity, $idType, $extraImports, $extraMethods)
    $repoDir = "$base\$module\repository"
    if (-not (Test-Path $repoDir)) { New-Item -ItemType Directory -Force -Path $repoDir | Out-Null }
    $pkg = "swd392.project.orbitdocsbackend.$module.repository"
    $entityPkg = "swd392.project.orbitdocsbackend.$module.entity.$entity"
    if ($module -eq 'shared' -and $entity -eq 'AuditLog') {
        $entityPkg = 'swd392.project.orbitdocsbackend.shared.audit.AuditLog'
    }
    
    $content = "package $pkg;

import $entityPkg;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
$extraImports

@Repository
public interface ${entity}Repository extends JpaRepository<$entity, $idType> {
$extraMethods
}
"
    Set-Content -Path "$repoDir\${entity}Repository.java" -Value $content
}

Create-Repo 'identity' 'User' 'UUID' 'import java.util.Optional;' '    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);'
Create-Repo 'identity' 'Role' 'Integer' 'import java.util.Optional;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;' '    Optional<Role> findByName(RoleName name);'
Create-Repo 'identity' 'RefreshToken' 'UUID' 'import java.util.Optional;' '    Optional<RefreshToken> findByToken(String token);
    int deleteByUser(User user);'

Create-Repo 'course' 'Course' 'UUID' '' ''
Create-Repo 'course' 'CourseLecturer' 'UUID' 'import java.util.List;' '    List<CourseLecturer> findByCourseId(UUID courseId);
    List<CourseLecturer> findByLecturerId(UUID lecturerId);'

Create-Repo 'document' 'Document' 'UUID' 'import java.util.List;' '    List<Document> findByCourseId(UUID courseId);'
Create-Repo 'document' 'Chapter' 'UUID' 'import java.util.List;' '    List<Chapter> findByDocumentId(UUID documentId);'
Create-Repo 'document' 'IndexingJob' 'UUID' 'import java.util.Optional;' '    Optional<IndexingJob> findTopByDocumentIdOrderByAttemptNumberDesc(UUID documentId);'
Create-Repo 'document' 'DocumentChunk' 'UUID' 'import java.util.List;' '    List<DocumentChunk> findByDocumentId(UUID documentId);'
Create-Repo 'document' 'ChunkEmbedding' 'UUID' '' ''

Create-Repo 'chat' 'ChatSession' 'UUID' 'import java.util.List;' '    List<ChatSession> findByUserId(UUID userId);'
Create-Repo 'chat' 'ChatMessage' 'UUID' 'import java.util.List;' '    List<ChatMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);'
Create-Repo 'chat' 'MessageCitation' 'UUID' 'import java.util.List;' '    List<MessageCitation> findByMessageId(UUID messageId);'

Create-Repo 'shared' 'AuditLog' 'UUID' '' ''
