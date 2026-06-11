package swd392.project.orbitdocsbackend.course.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.course.mapper.CourseMapper;
import swd392.project.orbitdocsbackend.course.repository.CourseRepository;
import swd392.project.orbitdocsbackend.course.service.ICourseService;
import swd392.project.orbitdocsbackend.identity.abstractions.services.IUserService;
import swd392.project.orbitdocsbackend.identity.entity.User;
import swd392.project.orbitdocsbackend.shared.exception.AppException;
import swd392.project.orbitdocsbackend.shared.exception.ErrorCode;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements ICourseService {

    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final IUserService userService;

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        User lecturer = userService.getUserEntityById(request.getLecturerId());

        Course course = courseMapper.toEntity(request);
        course.setLecturer(lecturer);

        course = courseRepository.save(course);
        return courseMapper.toResponse(course);
    }

    @Override
    public CourseResponse getCourseById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
        return courseMapper.toResponse(course);
    }

    @Override
    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(courseMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<CourseResponse> searchCoursesByCode(String code, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return courseRepository.findByCodeContainingIgnoreCase(code, pageable)
                .map(courseMapper::toResponse);
    }

    @Override
    public CourseResponse updateCourse(UUID id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        course.setCode(request.getCode());
        course.setName(request.getName());
        course.setDescription(request.getDescription());

        if (request.getLecturerId() != null) {
            User lecturer = userService.getUserEntityById(request.getLecturerId());
            course.setLecturer(lecturer);
        }

        course = courseRepository.save(course);
        return courseMapper.toResponse(course);
    }

    @Override
    public Course getCourseEntityById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
    }
}
