package swd392.project.orbitdocsbackend.document.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import swd392.project.orbitdocsbackend.document.dto.response.ChapterResponse;
import swd392.project.orbitdocsbackend.document.entity.Chapter;

@Mapper(componentModel = "spring")
public interface ChapterMapper {

    @Mapping(target = "documentId", source = "document.id")
    ChapterResponse toResponse(Chapter chapter);
}
