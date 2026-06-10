package swd392.project.orbitdocsbackend.course.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.course.dto.request.AssignLecturersRequest;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.request.JoinCourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.service.ICourseService;
import swd392.project.orbitdocsbackend.identity.dto.user.CustomUserDetails;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;
import swd392.project.orbitdocsbackend.shared.response.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/courses")
@RequiredArgsConstructor
public class CourseController {

    private final ICourseService courseService;

    @PostMapping
    public ApiResponse<CourseResponse> createCourse(@RequestBody @Valid CourseRequest request) {
        return ApiResponse.success(courseService.createCourse(request));
    }

    @GetMapping
    public ApiResponse<List<CourseResponse>> getAllCourses() {
        return ApiResponse.success(courseService.getAllCourses());
    }

    @PostMapping("/search")
    public ApiResponse<Page<CourseResponse>> searchCoursesByCode(
            @RequestParam String code,
            @RequestParam(defaultValue = "0") int pageNo,
            @RequestParam(defaultValue = "10") int pageSize) {
        return ApiResponse.success(courseService.searchCoursesByCode(code, pageNo, pageSize));
    }

    @GetMapping("/{id}")
    public ApiResponse<CourseResponse> getCourseById(@PathVariable UUID id) {
        return ApiResponse.success(courseService.getCourseById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<CourseResponse> updateCourse(@PathVariable UUID id, @RequestBody @Valid CourseRequest request) {
        return ApiResponse.success(courseService.updateCourse(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{courseId}/lecturers")
    public ApiResponse<Void> assignLecturer(@PathVariable UUID courseId, @RequestBody @Valid AssignLecturersRequest request) {
        courseService.assignLecturers(courseId, request);
        return ApiResponse.success(null, "Lecturers assigned to course successfully");
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/{courseId}/join")
    public ApiResponse<Void> joinCourse(
            @PathVariable UUID courseId,
            @RequestBody @Valid JoinCourseRequest request,
            Authentication authentication) {

        if (authentication == null || authentication.getName() == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        String studentId = userDetails.user().getId().toString();

        courseService.joinCourse(courseId, studentId, request.getJoinCode());
        return ApiResponse.success(null, "Successfully joined course");
    }
}
