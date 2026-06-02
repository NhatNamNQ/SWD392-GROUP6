package swd392.project.orbitdocsbackend.course.repository;

import swd392.project.orbitdocsbackend.course.entity.CourseLecturer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface CourseLecturerRepository extends JpaRepository<CourseLecturer, UUID> {
    List<CourseLecturer> findByCourseId(UUID courseId);
    List<CourseLecturer> findByLecturerId(UUID lecturerId);
}

