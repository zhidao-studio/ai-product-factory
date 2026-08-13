package org.dromara.web.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.apache.fesod.sheet.annotation.ExcelIgnoreUnannotated;
import org.apache.fesod.sheet.annotation.ExcelProperty;
import org.dromara.common.excel.annotation.ExcelDictFormat;
import org.dromara.common.excel.convert.ExcelDictConvert;

import java.io.Serial;
import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Admin 接入客户端导出视图对象。
 *
 * @author Lion Li
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = AppClientManagementVo.class)
public class AppClientExportVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键。
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 客户端 ID。
     */
    @ExcelProperty(value = "客户端 ID")
    private String clientId;

    /**
     * 客户端 key。
     */
    @ExcelProperty(value = "客户端 key")
    private String clientKey;

    /**
     * 授权类型。
     */
    @ExcelProperty(value = "授权类型")
    private String grantType;

    /**
     * 设备类型。
     */
    @ExcelProperty(value = "设备类型")
    private String deviceType;

    /**
     * 允许访问路径。
     */
    @ExcelProperty(value = "允许访问路径")
    private String accessPath;

    /**
     * IP 白名单。
     */
    @ExcelProperty(value = "IP 白名单")
    private String ipWhitelist;

    /**
     * 是否有效。
     */
    @ExcelProperty(value = "是否有效", converter = ExcelDictConvert.class)
    @ExcelDictFormat(readConverterExp = "1=有效,0=无效")
    private String validFlag;

    /**
     * 创建时间。
     */
    @ExcelProperty(value = "创建时间")
    private LocalDateTime createTime;

}
