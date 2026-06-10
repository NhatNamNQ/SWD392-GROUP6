package swd392.project.orbitdocsbackend.course.service;

import org.springframework.data.domain.Page;
import swd392.project.orbitdocsbackend.course.dto.request.AssignLecturersRequest;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.entity.Course;

import java.util.List;
import java.util.UUID;

public interface ICourseService {
    CourseResponse createCourse(CourseRequest request);
    CourseResponse getCourseById(UUID id);
    List<CourseResponse> getAllCourses();
    Page<CourseResponse> searchCoursesByCode(String code, int pageNo, int pageSize);
    CourseResponse updateCourse(UUID id, CourseRequest request);
    void assignLecturers(UUID courseId, AssignLecturersRequest request);
    void joinCourse(UUID courseId, String studentId, String joinCode);
    boolean isStudentEnrolled(UUID courseId, UUID studentId);
    Course getCourseEntityById(UUID courseId);
}
