package swd392.project.orbitdocsbackend.identity.abstractions.services;


import swd392.project.orbitdocsbackend.identity.dtos.role.request.CommonRoleRequest;
import swd392.project.orbitdocsbackend.identity.dtos.role.response.RoleResponse;

import java.util.List;

public interface IRoleService {
    RoleResponse createRole(CommonRoleRequest request);
    List<RoleResponse> getAll();
    RoleResponse getById(Short id);
    RoleResponse getByName(String name);
    RoleResponse update(Short id, CommonRoleRequest request);
    void deleteById(Short id);
}
