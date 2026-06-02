package swd392.project.orbitdocsbackend.course.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.service.ICourseService;
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

    @PostMapping
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

    @PostMapping("/{courseId}/lecturers/{lecturerId}")
    public ApiResponse<Void> assignLecturer(@PathVariable UUID courseId, @PathVariable UUID lecturerId) {
        courseService.assignLecturer(courseId, lecturerId);
        return ApiResponse.success(null);
    }
}
