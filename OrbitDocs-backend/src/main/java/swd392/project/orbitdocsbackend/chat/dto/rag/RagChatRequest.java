package swd392.project.orbitdocsbackend.chat.dto.rag;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagChatRequest {
    private String document_id;
    private String query;
    private String chapter_title;
    @Builder.Default
    private int top_k = 10;
}
