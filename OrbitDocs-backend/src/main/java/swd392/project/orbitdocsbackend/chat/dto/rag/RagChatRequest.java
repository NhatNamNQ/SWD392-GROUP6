package swd392.project.orbitdocsbackend.chat.dto.rag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatRequest {
    private String document_id;
    private String query;
    private List<String> chapter_titles;
    @Builder.Default
    private int top_k = 10;
}
