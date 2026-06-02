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
    Course toEntity(CourseRequest request);

    CourseResponse toResponse(Course course);
}
