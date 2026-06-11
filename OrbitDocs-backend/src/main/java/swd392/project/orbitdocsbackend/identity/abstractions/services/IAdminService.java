package swd392.project.orbitdocsbackend.identity.abstractions.services;

import swd392.project.orbitdocsbackend.identity.dto.user.request.CreateLecturerRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;

public interface IAdminService {
    UserResponse createLecturer(CreateLecturerRequest request);
}
