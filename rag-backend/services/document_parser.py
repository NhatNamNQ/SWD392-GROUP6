import fitz  # PyMuPDF
import logging

logger = logging.getLogger(__name__)

class DocumentParser:
    """Extracts text and table of contents from PDF."""

    @staticmethod
    def parse_pdf(file_path: str):
        """
        Parses a PDF file and returns a list of chapters.
        If no TOC is found, it treats the whole document as one chapter.
        
        Returns a tuple: (full_text, chapters_info, pages_info)
        """
        logger.info(f"Parsing PDF: {file_path}")
        try:
            doc = fitz.open(file_path)
        except Exception as e:
            logger.error(f"Failed to open PDF {file_path}: {e}")
            raise

        toc = doc.get_toc() # format: [[lvl, title, page_num], ...]
        pages_info = []
        full_text = ""
        
        for i, page in enumerate(doc):
            text = page.get_text("text")
            full_text += text + "\n\n"
            pages_info.append({
                "page_num": i + 1,
                "text": text
            })
            
        chapters_info = []
        if not toc:
            # Fallback if no TOC
            chapters_info.append({
                "title": "Document Content",
                "orderIndex": 1,
                "startPage": 1,
                "description": ""
            })
        else:
            order = 1
            for item in toc:
                lvl, title, page_num = item
                # Only take top-level chapters (Level 1)
                if lvl == 1:
                    chapters_info.append({
                        "title": title.strip(),
                        "orderIndex": order,
                        "startPage": page_num,
                        "description": f"Level {lvl} heading"
                    })
                    order += 1

        doc.close()
        return full_text, chapters_info, pages_info
