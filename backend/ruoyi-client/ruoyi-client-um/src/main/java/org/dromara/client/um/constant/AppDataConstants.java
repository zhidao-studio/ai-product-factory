package org.dromara.client.um.constant;

/**
 * App 数据常量。
 *
 * @author Lion Li
 */
public interface AppDataConstants {

    /**
     * 有效。
     */
    String VALID = "1";

    /**
     * 无效。
     */
    String INVALID = "0";

    /**
     * 判断有效标志是否合法。
     *
     * @param validFlag 有效标志
     * @return 仅 1 或 0 返回 true
     */
    static boolean isValidFlag(String validFlag) {
        return VALID.equals(validFlag) || INVALID.equals(validFlag);
    }

}
