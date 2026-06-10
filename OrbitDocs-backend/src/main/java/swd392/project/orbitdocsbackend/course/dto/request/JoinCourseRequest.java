package swd392.project.orbitdocsbackend.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinCourseRequest {
    @NotBlank(message = "Join code cannot be blank")
    private String joinCode;
}
