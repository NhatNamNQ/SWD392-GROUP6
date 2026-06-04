package swd392.project.orbitdocsbackend.course.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.course.entity.CourseLecturer;
import swd392.project.orbitdocsbackend.course.mapper.CourseMapper;
import swd392.project.orbitdocsbackend.course.repository.CourseLecturerRepository;
import swd392.project.orbitdocsbackend.course.repository.CourseRepository;
import swd392.project.orbitdocsbackend.course.service.ICourseService;
import swd392.project.orbitdocsbackend.identity.abstractions.repositories.UserRepository;
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
    private final CourseLecturerRepository courseLecturerRepository;
    private final CourseMapper courseMapper;
    
    // Khuyen dung: Trong tuong lai nen goi qua IUserService thay vi goi truc tiep UserRepository
    // de giu dung nguyen tac dong goi cua Modular Monolith.
    private final UserRepository userRepository;

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        Course course = courseMapper.toEntity(request);
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
        
        course = courseRepository.save(course);
        return courseMapper.toResponse(course);
    }

    @Override
    public void assignLecturer(UUID courseId, UUID lecturerId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
                
        User lecturer = userRepository.findById(lecturerId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        CourseLecturer assignment = CourseLecturer.builder()
                .course(course)
                .lecturer(lecturer)
                .build();
                
        courseLecturerRepository.save(assignment);
    }
}
