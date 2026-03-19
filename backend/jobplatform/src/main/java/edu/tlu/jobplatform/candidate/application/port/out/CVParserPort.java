package edu.tlu.jobplatform.candidate.application.port.out;

import java.io.InputStream;

public interface CVParserPort {

    /**
     * Parse PDF/DOC → plain text để lưu và dùng cho AI embedding.
     *
     * @param inputStream nội dung file
     * @param contentType MIME type
     * @return text thuần, có thể rỗng nếu không parse được
     */
    String parse(InputStream inputStream, String contentType);
}