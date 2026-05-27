package swd392.project.orbitdocsbackend.document.entity;

import jakarta.persistence.*;
import lombok.*;
import swd392.project.orbitdocsbackend.shared.entity.BaseEntity;

import java.util.UUID;

@Entity
@Table(name = "chapters", uniqueConstraints = @UniqueConstraint(name = "uk_chapters_document_order", columnNames = {
                "document_id", "order_index" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter extends BaseEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        @Column(name = "id", updatable = false, nullable = false)
        private UUID id;

        @ManyToOne(fetch = FetchType.LAZY, optional = false)
        @JoinColumn(name = "document_id", nullable = false)
        private Document document;

        @Column(name = "order_index", nullable = false)
        private Short orderIndex;

        @Column(name = "title", nullable = false, length = 300)
        private String title;

        @Column(name = "description", columnDefinition = "TEXT")
        private String description;
}
