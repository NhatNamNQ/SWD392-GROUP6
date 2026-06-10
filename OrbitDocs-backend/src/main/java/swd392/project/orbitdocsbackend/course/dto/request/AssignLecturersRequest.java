package swd392.project.orbitdocsbackend.course.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class AssignLecturersRequest {
    @NotEmpty(message = "Lecturer IDs cannot be empty")
    private List<UUID> lecturerIds;
}
