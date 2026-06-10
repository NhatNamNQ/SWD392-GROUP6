package swd392.project.orbitdocsbackend.identity.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IAdminService;
import swd392.project.orbitdocsbackend.identity.dto.user.request.CreateLecturerRequest;
import swd392.project.orbitdocsbackend.identity.dto.user.response.UserResponse;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/lecturers")
    public ResponseEntity<ApiResponse<UserResponse>> createLecturer(
            @Valid @RequestBody CreateLecturerRequest request) {

        UserResponse response = adminService.createLecturer(request);

        return ResponseEntity.ok(
                ApiResponse.success(response, "Lecturer created and notification email sent.")
        );
    }
}
