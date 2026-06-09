package swd392.project.orbitdocsbackend.identity.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.RoleRepository;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IRoleService;
import swd392.project.orbitdocsbackend.identity.dto.role.request.CommonRoleRequest;
import swd392.project.orbitdocsbackend.identity.dto.role.response.RoleResponse;
import swd392.project.orbitdocsbackend.identity.entity.Role;
import swd392.project.orbitdocsbackend.identity.mapper.RoleMapper;
import swd392.project.orbitdocsbackend.shared.enums.RoleName;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements IRoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional
    public RoleResponse createRole(CommonRoleRequest request) {
        if (roleRepository.findByName(RoleName.valueOf(request.getName())).isPresent()) {
            throw new RuntimeException("Role name already exists");
        }
        Role role = roleMapper.fromCreateRequest(request);
        roleRepository.save(role);

        return roleMapper.toResponse(role);
    }

    @Override
    public List<RoleResponse> getAll() {
        return roleRepository.findAll()
                .stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    public RoleResponse getById(Short id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse getByName(String name) {
        Role role = roleRepository.findByName(RoleName.valueOf(name))
                .orElseThrow(() -> new RuntimeException("Role not found"));
        return roleMapper.toResponse(role);
    }

    @Override
    public RoleResponse update(Short id, CommonRoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        role.setName(RoleName.valueOf(request.getName()));
        role.setDescription(request.getDescription());
        roleRepository.save(role);
        return roleMapper.toResponse(role);
    }

    @Override
    public void deleteById(Short id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found"));
        roleRepository.delete(role);
    }
}
