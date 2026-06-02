package swd392.project.orbitdocsbackend.course.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
public class CourseResponse {
    private UUID id;
    private String code;
    private String name;
    private String description;
    private boolean active;
    private Instant createdAt;
}
