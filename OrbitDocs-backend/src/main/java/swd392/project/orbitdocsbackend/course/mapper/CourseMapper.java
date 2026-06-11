package swd392.project.orbitdocsbackend.course.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import swd392.project.orbitdocsbackend.course.dto.request.CourseRequest;
import swd392.project.orbitdocsbackend.course.dto.response.CourseResponse;
import swd392.project.orbitdocsbackend.course.entity.Course;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", constant = "true")
    @Mapping(target = "lecturer", ignore = true)
    @Mapping(target = "documents", ignore = true)
    Course toEntity(CourseRequest request);

    @Mapping(target = "lecturerId", source = "lecturer.id")
    @Mapping(target = "lecturerName", source = "lecturer.fullName")
    CourseResponse toResponse(Course course);
}
