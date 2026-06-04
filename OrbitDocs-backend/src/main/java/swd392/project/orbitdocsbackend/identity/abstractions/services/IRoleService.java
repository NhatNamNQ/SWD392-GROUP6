package swd392.project.orbitdocsbackend.identity.abstractions.services;


import swd392.project.orbitdocsbackend.identity.dtos.role.request.CommonRoleRequest;
import swd392.project.orbitdocsbackend.identity.dtos.role.response.RoleResponse;

import java.util.List;
import java.util.UUID;

public interface IRoleService {
    RoleResponse createRole(CommonRoleRequest request);
    List<RoleResponse> getAll();
    RoleResponse getById(UUID id);
    RoleResponse getByName(String name);
    RoleResponse update(UUID id, CommonRoleRequest request);
    void deleteById(UUID id);
}
