package swd392.project.orbitdocsbackend.course.dto.request;

import jakarta.validation.constraints.NotBlank;
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
}
