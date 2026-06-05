package swd392.project.orbitdocsbackend.identity.mapper;

import org.mapstruct.*;
import swd392.project.orbitdocsbackend.identity.dto.user.request.CreateUserRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.request.UserCommonRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;
import swd392.project.orbitdocsbackend.identity.entity.User;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {

    @Mapping(target = "roleResponse", source = "role")
    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "refreshTokens", ignore = true)
    @Mapping(target = "email", source = "userCommonRequest.email")
    @Mapping(target = "fullName", source = "userCommonRequest.fullName")
    @Mapping(target = "active", source = "userCommonRequest.active")
    @Mapping(target = "avatarUrl", source = "userCommonRequest.avatarUrl")
    User fromCreateRequest(CreateUserRequest request);

    @BeanMapping(
            nullValuePropertyMappingStrategy =
                    NullValuePropertyMappingStrategy.IGNORE
    )
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "role", ignore = true)
    @Mapping(target = "refreshTokens", ignore = true)

    @Mapping(target = "email", source = "email")
    @Mapping(target = "fullName", source = "fullName")
    @Mapping(target = "active", source = "active")
    @Mapping(target = "avatarUrl", source = "avatarUrl")
    void updateUserFromRequest(
            UserCommonRequest request,
            @MappingTarget User user
    );
}
