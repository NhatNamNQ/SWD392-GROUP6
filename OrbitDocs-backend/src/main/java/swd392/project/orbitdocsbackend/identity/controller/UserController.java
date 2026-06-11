package swd392.project.orbitdocsbackend.identity.controller;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IUserService;
import swd392.project.orbitdocsbackend.identity.dto.user.request.ChangePasswordRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.request.CreateUserRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.request.UserCommonRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final IUserService userService;

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody CreateUserRequest request
    ) {
        UserResponse response = userService.createUser(request);

        return ResponseEntity
                .created(URI.create("/api/users/" + response.getId()))
                .body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAll() {
        return ResponseEntity.ok(userService.getAll());
    }

    @PatchMapping
    public ResponseEntity<UserResponse> updateUser(
            @RequestBody UserCommonRequest request
    ) {
        return ResponseEntity.ok(userService.update(request));
    }

    @PatchMapping("/change-password")
    public ResponseEntity<UserResponse> updatePassword(@RequestBody ChangePasswordRequest request){
        return ResponseEntity.ok(userService.changePassword(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
