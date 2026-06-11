package swd392.project.orbitdocsbackend.identity.mapper;

import org.mapstruct.*;
import swd392.project.orbitdocsbackend.identity.dto.role.request.CommonRoleRequest;
import swd392.project.orbitdocsbackend.identity.dto.role.response.RoleResponse;
import swd392.project.orbitdocsbackend.identity.entity.Role;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    RoleResponse toResponse(Role role);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "users", ignore = true)
    @Mapping(target = "name", source = "name")
    @Mapping(target = "description", source = "description")
    Role fromCreateRequest(CommonRoleRequest request);

    default RoleName map(String value) {
        return RoleName.valueOf(value.toUpperCase());
    }
}
