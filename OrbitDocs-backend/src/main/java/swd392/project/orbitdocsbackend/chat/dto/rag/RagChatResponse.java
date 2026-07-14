package swd392.project.orbitdocsbackend.chat.dto.rag;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
public class RagChatResponse {
    private String answer;
    private List<RagCitation> citations;

    @Data
    @NoArgsConstructor
    public static class RagCitation {
        private String chunk_id;
        private String document_id;
        private int chunk_index;
        private int page_num;
        private float distance;
        private String excerpt;
    }
}
