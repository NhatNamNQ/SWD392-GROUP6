package swd392.project.orbitdocsbackend.course.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import swd392.project.orbitdocsbackend.course.abstractions.repositories.CourseStudentRepository;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.entity.Course;
import swd392.project.orbitdocsbackend.course.entity.CourseLecturer;
import swd392.project.orbitdocsbackend.course.entity.CourseStudent;
import swd392.project.orbitdocsbackend.course.mapper.CourseMapper;
import swd392.project.orbitdocsbackend.course.repository.CourseLecturerRepository;
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
    private final CourseLecturerRepository courseLecturerRepository;
    private final CourseStudentRepository courseStudentRepository;
    private final CourseMapper courseMapper;
    
    private final IUserService userService;

    @Override
    public CourseResponse createCourse(CourseRequest request) {
        User headLecturer = userService.getUserEntityById(request.getHeadLecturerId());

        Course course = courseMapper.toEntity(request);
        course.setHeadLecturer(headLecturer);
        course.setJoinCode(generateJoinCode());

        course = courseRepository.save(course);
        return courseMapper.toResponse(course);
    }

    private String generateJoinCode() {
        java.security.SecureRandom random = new java.security.SecureRandom();
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder(6);
        for (int i = 0; i < 6; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return "SWD-" + sb.toString();
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
    @Transactional
    public void assignLecturers(UUID courseId, swd392.project.orbitdocsbackend.course.dto.request.AssignLecturersRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        for (UUID lecturerId : request.getLecturerIds()) {
            User lecturer = userService.getUserEntityById(lecturerId);

            if (!lecturer.getRole().getName().name().equals("LECTURER")) {
                throw new AppException(ErrorCode.UNAUTHORIZED);
            }

            if (!courseLecturerRepository.existsByCourseIdAndLecturerId(courseId, lecturerId)) {
                CourseLecturer courseLecturer = CourseLecturer.builder()
                        .course(course)
                        .lecturer(lecturer)
                        .build();
                courseLecturerRepository.save(courseLecturer);
            }
        }
    }

    @Override
    @Transactional
    public void joinCourse(UUID courseId, String studentId, String joinCode) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));

        if (course.getJoinCode() == null || !course.getJoinCode().equals(joinCode)) {
            throw new AppException(ErrorCode.INVALID_KEY); // Or specific INVALID_JOIN_CODE
        }

        UUID stId = UUID.fromString(studentId);
        if (courseStudentRepository.existsByCourseIdAndStudentId(course.getId(), stId)) {
            throw new AppException(ErrorCode.USER_ALREADY_REGISTERED); // Already joined
        }

        User student = userService.getUserEntityById(stId);

        CourseStudent courseStudent = CourseStudent.builder()
                        .course(course)
                        .student(student)
                        .build();

        courseStudentRepository.save(courseStudent);
    }

    @Override
    public boolean isStudentEnrolled(UUID courseId, UUID studentId) {
        return courseStudentRepository.existsByCourseIdAndStudentId(courseId, studentId);
    }

    @Override
    public Course getCourseEntityById(UUID courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new AppException(ErrorCode.COURSE_NOT_FOUND));
    }
}
