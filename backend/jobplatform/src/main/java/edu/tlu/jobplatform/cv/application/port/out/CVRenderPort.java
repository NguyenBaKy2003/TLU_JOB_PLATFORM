package edu.tlu.jobplatform.cv.application.port.out;

import edu.tlu.jobplatform.cv.domain.model.CVTemplate;
import edu.tlu.jobplatform.cv.domain.model.OnlineCV;

/**
 * Port ra ngoài — render CV thành PDF bytes.
 * Implementation: ThymeleafCVRenderAdapter (infra layer).
 */
public interface CVRenderPort {

    /**
     * Render CV theo template → trả về PDF dạng byte array.
     *
     * @param cv       aggregate chứa toàn bộ dữ liệu CV
     * @param template metadata template (tên file .html)
     * @return PDF bytes
     */
    byte[] render(OnlineCV cv, CVTemplate template);
}