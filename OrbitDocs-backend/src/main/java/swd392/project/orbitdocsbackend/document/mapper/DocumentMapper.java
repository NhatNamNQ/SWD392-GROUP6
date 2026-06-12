package swd392.project.orbitdocsbackend.document.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentResponse;
import swd392.project.orbitdocsbackend.document.entity.Document;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(target = "courseId", source = "course.id")
    DocumentResponse toResponse(Document document);
}
