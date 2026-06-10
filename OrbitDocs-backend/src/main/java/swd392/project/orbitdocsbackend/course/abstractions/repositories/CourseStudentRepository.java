package swd392.project.orbitdocsbackend.course.abstractions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import swd392.project.orbitdocsbackend.course.entity.CourseStudent;

import java.util.UUID;

@Repository
public interface CourseStudentRepository extends JpaRepository<CourseStudent, UUID> {
    boolean existsByCourseIdAndStudentId(UUID courseId, UUID studentId);
}
