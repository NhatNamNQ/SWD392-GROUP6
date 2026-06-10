package swd392.project.orbitdocsbackend.course.dto.request;

import java.util.UUID;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequest {
    @NotBlank(message = "Course code cannot be blank")
    private String code;

    @NotBlank(message = "Course name cannot be blank")
    private String name;

    private String description;

    @NotNull(message = "Head lecturer ID is required")
    private UUID headLecturerId;
}
