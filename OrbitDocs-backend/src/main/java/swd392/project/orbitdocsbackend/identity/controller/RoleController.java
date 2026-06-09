package swd392.project.orbitdocsbackend.identity.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IRoleService;
import swd392.project.orbitdocsbackend.identity.dto.role.request.CommonRoleRequest;
import swd392.project.orbitdocsbackend.identity.dto.role.response.RoleResponse;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final IRoleService roleService;

    @PostMapping
    public ResponseEntity<RoleResponse> createRole(
            @RequestBody CommonRoleRequest request
    ) {
        RoleResponse response = roleService.createRole(request);

        return ResponseEntity
                .created(URI.create("/api/roles/" + response.getId())) 
                .body(response);
    }

    @GetMapping
    public List<RoleResponse> getAll() {
        return roleService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoleResponse> getById(@PathVariable Short id) {
        return ResponseEntity.ok(roleService.getById(id));
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<RoleResponse> getByName(@PathVariable String name) {
        return ResponseEntity.ok(roleService.getByName(name));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<RoleResponse> update(
            @PathVariable Short id,
            @RequestBody CommonRoleRequest request
    ) {
        return ResponseEntity.ok(roleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Short id) {
        roleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
