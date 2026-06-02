package swd392.project.orbitdocsbackend.course.repository;

import swd392.project.orbitdocsbackend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;


@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {

}

