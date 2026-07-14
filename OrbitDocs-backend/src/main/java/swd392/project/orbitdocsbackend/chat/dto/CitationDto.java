package swd392.project.orbitdocsbackend.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CitationDto {
    private String excerpt;
    private Float similarityScore;
    private Integer pageNum;
    private Integer chunkIndex;
    private String documentName;
    private String chapterTitle;
}
