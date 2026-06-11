package swd392.project.orbitdocsbackend.course.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import swd392.project.orbitdocsbackend.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    
    @EntityGraph(attributePaths = {"lecturer"})
    Page<Course> findByCodeContainingIgnoreCase(String code, Pageable pageable);

    @Override
    @EntityGraph(attributePaths = {"lecturer"})
    List<Course> findAll();

    @Override
    @EntityGraph(attributePaths = {"lecturer"})
    Optional<Course> findById(UUID id);
}

