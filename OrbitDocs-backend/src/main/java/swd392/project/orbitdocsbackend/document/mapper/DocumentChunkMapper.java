package swd392.project.orbitdocsbackend.document.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import swd392.project.orbitdocsbackend.document.dto.response.DocumentChunkResponse;
import swd392.project.orbitdocsbackend.document.entity.DocumentChunk;

@Mapper(componentModel = "spring")
public interface DocumentChunkMapper {

    @Mapping(target = "documentId", source = "document.id")
    DocumentChunkResponse toResponse(DocumentChunk documentChunk);
}
