package swd392.project.orbitdocsbackend.identity.abstractions.services;

import swd392.project.orbitdocsbackend.identity.dto.user.request.ChangePasswordRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.request.CreateUserRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.request.UserCommonRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;
import swd392.project.orbitdocsbackend.identity.entity.User;

import java.util.List;
import java.util.UUID;

public interface IUserService {
    UserResponse createUser(CreateUserRequest request);
    UserResponse getById(UUID id);
    List<UserResponse> getAll();
    UserResponse update(UserCommonRequest request);
    UserResponse changePassword(ChangePasswordRequest request);
    void deleteById(UUID id);
    User getUserEntityById(UUID id);
}
